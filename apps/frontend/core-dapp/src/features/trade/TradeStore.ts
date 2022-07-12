import { BigNumber, ethers } from 'ethers'
import { makeAutoObservable, reaction, runInAction } from 'mobx'
import QuoterABI from '../../../abi/uniswapV3Quoter.abi.json'
import { UNISWAP_QUOTER_ADDRESS } from '../../lib/external-contracts'
import { Erc20Store } from '../../stores/entities/Erc20.entity'
import { MarketEntity } from '../../stores/entities/MarketEntity'
import { RootStore } from '../../stores/RootStore'
import { TradeType } from '../../stores/SwapStore'
import { debounce } from '../../utils/debounce'
import { calculateValuation } from '../../utils/market-utils'
import { normalizeDecimalPrecision } from '../../utils/number-utils'

export type Direction = 'long' | 'short'

const DEFAULT_DIRECTION = 'long'

export class TradeStore {
  closeTradeHash?: string
  direction: Direction = DEFAULT_DIRECTION
  openTradeAmount = 0
  openTradeAmountBigNumber = BigNumber.from(0)
  openTradeHash?: string
  selectedMarket?: MarketEntity
  openTradeAmountOut?: number

  constructor(public root: RootStore) {
    makeAutoObservable(this, {}, { autoBind: true })
    this.subscribeOpenTradeAmountOut()
  }

  subscribeOpenTradeAmountOut(): void {
    reaction(
      () => ({ selectedMarket: this.selectedMarket, openTradeAmount: this.openTradeAmount }),
      async ({ openTradeAmount, selectedMarket }) => {
        if (!selectedMarket) {
          this.openTradeAmountOut = undefined
          return
        }
        if (openTradeAmount === 0) {
          this.openTradeAmountOut = 0
          return
        }

        this.openTradeAmountOut = undefined // clean up while new amountOut gets loaded
        const openTradeAmountOut = await this.quoteExactInput(selectedMarket)
        runInAction(() => {
          this.openTradeAmountOut = openTradeAmountOut
        })
      }
    )
  }

  openTradeUILoading(selectedMarket: MarketEntity): boolean {
    return selectedMarket[`${this.direction}TokenPrice`] === undefined
  }

  setOpenTradeAmountBigNumber(value: number): void {
    const { preCTTokenStore } = this.root
    this.openTradeAmountBigNumber = preCTTokenStore.parseUnits(`${value}`) ?? BigNumber.from(0)
  }

  setCloseTradeHash(hash?: string): void {
    this.closeTradeHash = hash
  }

  setDirection(direction: Direction, selectedMarket?: MarketEntity): void {
    this.direction = direction
    selectedMarket?.setSelectedPool(direction)
  }

  setSelectedMarket(market?: MarketEntity): void {
    this.selectedMarket = market
  }

  setOpenTradeAmount(amount: number | string): void {
    this.openTradeAmount = +amount
    this.setOpenTradeAmountBigNumber(+amount)
  }

  setOpenTradeHash(hash?: string): void {
    this.openTradeHash = hash
  }

  get valuation(): number | undefined {
    if (!this.selectedMarket || this.openTradeAmountOut === undefined) return undefined
    const { payoutRange, valuationRange } = this.selectedMarket
    if (!valuationRange || !payoutRange) return undefined

    const price = this.openTradeAmount / this.openTradeAmountOut
    const longTokenPrice = this.direction === 'long' ? price : 1 - price
    return calculateValuation({ longTokenPrice, payoutRange, valuationRange })
  }

  quoteExactInput = debounce(async (selectedMarket: MarketEntity): Promise<number | undefined> => {
    const selectedToken = selectedMarket[`${this.direction}Token`]
    const pool = selectedMarket[`${this.direction}Pool`]
    const state = pool?.poolState
    const fee = pool?.poolImmutables?.fee
    if (!fee || !selectedToken || !state || !this.openTradeAmount || !selectedToken.address) {
      return undefined
    }
    const tokenAddressFrom = this.root.preCTTokenStore.uniswapToken.address
    const tokenAddressTo = selectedToken.address
    const quoterContract = new ethers.Contract(
      UNISWAP_QUOTER_ADDRESS.mainnet ?? '', // all uniswap contracts has same address on all chains
      QuoterABI,
      this.root.web3Store.coreProvider
    )

    try {
      const sqrtPriceLimitX96 = 0 // The price limit of the pool that cannot be exceeded by the swap
      const result: BigNumber = await quoterContract.callStatic.quoteExactInputSingle(
        tokenAddressFrom,
        tokenAddressTo,
        fee,
        ethers.utils.parseEther(`${this.openTradeAmount}`),
        sqrtPriceLimitX96
      )
      const amountOut = +ethers.utils.formatEther(result)
      return amountOut
    } catch (e) {
      this.root.toastStore.errorToast('Error calculating output amount', e)
      return undefined
    }
  }, 400)

  // eslint-disable-next-line require-await
  async openTrade(selectedMarket: MarketEntity): Promise<{ success: boolean; error?: string }> {
    const selectedToken = selectedMarket[`${this.direction}Token`]
    const price = selectedMarket[`${this.direction}TokenPrice`]
    const fee = selectedMarket[`${this.direction}Pool`]?.poolImmutables?.fee
    const { swap } = this.root.swapStore
    const { uniswapToken } = this.root.preCTTokenStore
    if (
      !selectedToken?.address ||
      price === undefined ||
      fee === undefined ||
      this.openTradeAmountOut === undefined
    )
      return { success: false }

    this.setOpenTradeHash(undefined)
    return swap({
      fee,
      fromAmount: this.openTradeAmount,
      fromTokenAddress: uniswapToken.address,
      toAmount: this.openTradeAmountOut,
      toTokenAddress: selectedToken.address,
      type: TradeType.EXACT_INPUT,
      onHash: (hash) => this.setOpenTradeHash(hash),
    })
  }

  // eslint-disable-next-line require-await
  async closeTrade(
    token: Erc20Store,
    amount: number,
    tokensReceivable: number,
    selectedMarket: MarketEntity
  ): Promise<{ success: boolean; error?: string }> {
    this.setCloseTradeHash(undefined)

    const fee = selectedMarket[`${this.direction}Pool`]?.poolImmutables?.fee
    const { swap } = this.root.swapStore
    const { uniswapToken } = this.root.preCTTokenStore
    if (!token.address || !uniswapToken.address || fee === undefined)
      return { success: false, error: 'Please try again later.' }

    return swap({
      fee,
      fromAmount: amount,
      fromTokenAddress: token.address,
      toTokenAddress: uniswapToken.address,
      toAmount: tokensReceivable,
      type: TradeType.EXACT_INPUT,
      onHash: (hash) => this.setCloseTradeHash(hash),
    })
  }

  get tradeDisabled(): boolean {
    const { preCTTokenStore } = this.root
    const openTradeAmountBigNumber = preCTTokenStore.parseUnits(`${this.openTradeAmount}`)
    return openTradeAmountBigNumber && this.tradeMaxAmount
      ? openTradeAmountBigNumber.gt(this.tradeMaxAmount)
      : false
  }

  get tradeMaxAmount(): BigNumber | undefined {
    const { tokenBalanceRaw } = this.root.preCTTokenStore
    return tokenBalanceRaw
  }

  get tradeMaxAmountString(): string | undefined {
    const { preCTTokenStore } = this.root
    return this.tradeMaxAmount
      ? normalizeDecimalPrecision(preCTTokenStore.formatUnits(this.tradeMaxAmount))
      : undefined
  }
}
