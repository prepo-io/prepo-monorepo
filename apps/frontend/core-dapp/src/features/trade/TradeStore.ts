import { BigNumber, ethers } from 'ethers'
import { makeAutoObservable } from 'mobx'
import QuoterABI from '../../../abi/uniswapV3Quoter.abi.json'
import { UNISWAP_QUOTER_ADDRESS } from '../../lib/external-contracts'
import { Erc20Store } from '../../stores/entities/Erc20.entity'
import { MarketEntity } from '../../stores/entities/MarketEntity'
import { RootStore } from '../../stores/RootStore'
import { TradeType } from '../../stores/SwapStore'
import { normalizeDecimalPrecision } from '../../utils/number-utils'

export type Direction = 'long' | 'short'

const DEFAULT_DIRECTION = 'long'

export class TradeStore {
  closeTradeHash?: string
  direction: Direction = DEFAULT_DIRECTION
  openTradeAmount = 0
  openTradeAmountBigNumber = BigNumber.from(0)
  openTradeHash?: string
  amountOut?: number

  constructor(public root: RootStore) {
    makeAutoObservable(this, {}, { autoBind: true })
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

  setOpenTradeAmount(amount: number | string): void {
    this.openTradeAmount = +amount
    this.setOpenTradeAmountBigNumber(+amount)
  }

  setOpenTradeHash(hash?: string): void {
    this.openTradeHash = hash
  }

  setAmountOut(value: number): void {
    this.amountOut = value
  }

  async quoteExactInput(selectedMarket: MarketEntity): Promise<number | null> {
    const selectedToken = selectedMarket?.[`${this.direction}Token`]
    const pool = selectedMarket?.[`${this.direction}Pool`]
    const state = pool?.poolState
    const fee = pool?.poolImmutables?.fee
    if (!fee || !selectedToken || !state || !this.openTradeAmount) {
      return null
    }
    const tokenAddressFrom = this.root.preCTTokenStore.uniswapToken.address
    const tokenAddressTo = selectedToken.address ?? ''
    const quoterContract = new ethers.Contract(
      UNISWAP_QUOTER_ADDRESS.mainnet ?? '', // all uniswap contracts has same address on all chains
      QuoterABI,
      this.root.web3Store.coreProvider
    )
    const func: ethers.ContractFunction<BigNumber> = quoterContract.callStatic.quoteExactInputSingle
    try {
      const result = await func(tokenAddressFrom, tokenAddressTo, fee, this.openTradeAmount, 0)
      this.amountOut = result.toNumber()
      return this.amountOut
    } catch (e) {
      this.amountOut = undefined
      this.root.toastStore.errorToast('Error calculating output amount', e)
      return null
    }
  }

  // eslint-disable-next-line require-await
  async openTrade(selectedMarket: MarketEntity): Promise<{ success: boolean; error?: string }> {
    const selectedToken = selectedMarket[`${this.direction}Token`]
    const price = selectedMarket[`${this.direction}TokenPrice`]
    const fee = selectedMarket[`${this.direction}Pool`]?.poolImmutables?.fee
    const { swap } = this.root.swapStore
    const { uniswapToken } = this.root.preCTTokenStore
    if (!selectedToken?.address || price === undefined || fee === undefined)
      return { success: false }

    this.setOpenTradeHash(undefined)
    if (this.amountOut === undefined) return { success: false }

    return swap({
      fee,
      fromAmount: this.openTradeAmount,
      fromTokenAddress: uniswapToken.address,
      toAmount: this.amountOut,
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
