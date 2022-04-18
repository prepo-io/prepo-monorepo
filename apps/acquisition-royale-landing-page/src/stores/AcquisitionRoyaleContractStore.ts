import { autorun, makeAutoObservable, runInAction } from 'mobx'
import fromUnixTime from 'date-fns/fromUnixTime'
import { BigNumber, providers, utils } from 'ethers'
import { RootStore } from './RootStore'
import {
  fetch,
  ContractStore,
  ContractReturnType,
  ContractGetterReturnType,
  ContractGetterReturnTypeArray,
  ContractReturnTypeArray,
} from './utils/class-utils'
import { AcquisitionroyaleAbi, AcquisitionroyaleAbi__factory } from '../../generated/typechain'
import { getExternalContractAddress } from '../lib/external-contracts'
import { formatNumber, percentageDecimalToBase10 } from '../utils/number-utils'
import { handleError } from '../utils/exception-handling'

const { formatUnits } = utils

export type FoundingStatus = 'completed' | 'ongoing' | 'upcoming'

type GetMaxFree = AcquisitionroyaleAbi['functions']['getMaxFree']
type GetMaxAuctioned = AcquisitionroyaleAbi['functions']['getMaxAuctioned']
type GetFreeCount = AcquisitionroyaleAbi['functions']['getFreeCount']
type GetAuctionCount = AcquisitionroyaleAbi['functions']['getAuctionCount']
type GetAuctionPrice = AcquisitionroyaleAbi['functions']['getAuctionPrice']
type GetFoundingPriceAndTime = AcquisitionroyaleAbi['functions']['getFoundingPriceAndTime']
type GetFoundedEnterprises = AcquisitionroyaleAbi['functions']['balanceOf']
type HasFoundedFree = AcquisitionroyaleAbi['functions']['hasFoundedFree']
type GetGameStartTime = AcquisitionroyaleAbi['functions']['getGameStartTime']

type Functions = keyof AcquisitionroyaleAbi['functions']
type Storage = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key in Functions]?: any
}

export class AcquisitionRoyaleContractStore implements ContractStore {
  root: RootStore
  reference = 'acquisitionRoyaleContractStore'
  address?: string
  foundingEnterprise = false
  contract?: AcquisitionroyaleAbi
  abi = AcquisitionroyaleAbi__factory.abi
  storage: Storage = {}
  currentTime: Date

  constructor(root: RootStore) {
    this.root = root
    makeAutoObservable(this, { abi: false })
    this.initContract()
    this.currentTime = new Date()
    this.setTimeInterval()
  }

  setTimeInterval(): void {
    setInterval(() => {
      runInAction(() => {
        this.currentTime = new Date()
      })
    }, 1000)
  }

  initContract(): void {
    autorun(() => {
      const network = this.root.web3Store.network.name
      const address = getExternalContractAddress('ACQUISITION_ROYALE', network)
      if (typeof address === 'undefined')
        throw Error(`no address for ${this.reference} on ${network}`)
      runInAction(() => {
        this.address = address
        this.contract = AcquisitionroyaleAbi__factory.connect(
          this.address,
          this.root.web3Store.coreProvider
        )
      })
    })
  }

  // Checks the signer wallet, then creates a writable contract hooked up with it
  async createWriteContract(): Promise<AcquisitionroyaleAbi> {
    await this.root.web3Store.checkSigner()
    const writeContract = AcquisitionroyaleAbi__factory.connect(
      this.address as string,
      this.root.web3Store.signer as providers.JsonRpcSigner
    )
    return writeContract
  }

  async foundAuctioned(quantity: number): Promise<boolean> {
    const [, auctionPrice] = this.getAuctionPrice()
    if (!auctionPrice) throw Error('auctionPrice unexpectedly not defined')
    try {
      const writeContract = await this.createWriteContract()

      // Override defaults
      const otherOptions = { value: auctionPrice.mul(quantity) }
      const gasEstimate = await writeContract.estimateGas.foundAuctioned(quantity, otherOptions)
      const gasOptions: { gasLimit: BigNumber; gasPrice?: BigNumber; type: number } = {
        gasLimit: gasEstimate.mul(2),
        type: 0,
      }
      const options = { ...gasOptions, ...otherOptions }

      if (this.root.web3Store.network.gasPrice !== undefined)
        options.gasPrice = this.root.web3Store.network.gasPrice

      const tx = await writeContract.foundAuctioned(quantity, options)
      runInAction(() => {
        this.foundingEnterprise = true
      })
      await this.root.web3Store.coreProvider.waitForTransaction(tx.hash)
      return true
    } catch (e) {
      handleError('foundAuctioned', e)
      return false
    } finally {
      runInAction(() => {
        this.foundingEnterprise = false
      })
    }
  }

  getMaxFree(): ContractGetterReturnType<GetMaxFree> {
    return fetch<Parameters<GetMaxFree>, ContractReturnType<GetMaxFree>>(this, 'getMaxFree', [])
  }

  getGameStartTime(): ContractGetterReturnType<GetMaxFree> {
    return fetch<Parameters<GetGameStartTime>, ContractReturnType<GetMaxFree>>(
      this,
      'getGameStartTime',
      []
    )
  }

  getFoundedEnterprises(address: string): ContractGetterReturnType<GetFoundedEnterprises> {
    return fetch<Parameters<GetFoundedEnterprises>, ContractReturnType<GetFoundedEnterprises>>(
      this,
      'balanceOf',
      [address]
    )
  }

  getMaxAuctioned(): ContractGetterReturnType<GetMaxAuctioned> {
    return fetch<Parameters<GetMaxAuctioned>, ContractReturnType<GetMaxAuctioned>>(
      this,
      'getMaxAuctioned',
      []
    )
  }

  getFreeCount(): ContractGetterReturnType<GetFreeCount> {
    return fetch<Parameters<GetFreeCount>, ContractReturnType<GetFreeCount>>(
      this,
      'getFreeCount',
      []
    )
  }

  getAuctionCount(): ContractGetterReturnType<GetAuctionCount> {
    return fetch<Parameters<GetAuctionCount>, ContractReturnType<GetAuctionCount>>(
      this,
      'getAuctionCount',
      []
    )
  }

  getAuctionPrice(): ContractGetterReturnType<GetAuctionPrice> {
    return fetch<Parameters<GetAuctionPrice>, ContractReturnType<GetAuctionPrice>>(
      this,
      'getAuctionPrice',
      []
    )
  }

  getFoundingPriceAndTime(): ContractGetterReturnTypeArray<GetFoundingPriceAndTime> {
    return fetch<
      Parameters<GetFoundingPriceAndTime>,
      ContractReturnTypeArray<GetFoundingPriceAndTime>
    >(this, 'getFoundingPriceAndTime', [])
  }

  hasFoundedFree(address: string): ContractGetterReturnType<HasFoundedFree> {
    return fetch<Parameters<HasFoundedFree>, ContractReturnType<HasFoundedFree>>(
      this,
      'hasFoundedFree',
      [address]
    )
  }

  get formattedAuctionPrice(): string | undefined {
    const [, auctionPrice] = this.getAuctionPrice()
    if (!auctionPrice) return undefined
    const { decimals } = this.root.web3Store.network.nativeCurrency
    return formatNumber(formatUnits(auctionPrice.toString(), decimals), {
      maximumFractionDigits: 0,
    })
  }

  get signerHasFoundedFree(): boolean | undefined {
    const { address } = this.root.web3Store.signerState
    if (!address) return undefined
    const [loading, result] = this.hasFoundedFree(address)
    if (loading === undefined || result === undefined) return undefined
    return result
  }

  get foundedEnterprises(): number | undefined {
    const userAddress = this.root.web3Store.signerState.address
    if (!userAddress) return undefined
    const [loadingFoundedEnterprises, balance] = this.getFoundedEnterprises(userAddress)
    if (loadingFoundedEnterprises || !balance) return undefined

    return balance.toNumber()
  }

  get gameStartTime(): Date | undefined {
    const [loadingGameStartTime, gameStartTimeMsString] = this.getGameStartTime()
    if (loadingGameStartTime || !gameStartTimeMsString) return undefined
    const timestamp = gameStartTimeMsString.toNumber()
    const gameStartTime = fromUnixTime(timestamp)

    return gameStartTime
  }

  get foundingStartTime(): Date | undefined {
    const [loadingFoundingPriceAndTime, foundingPriceAndTime] = this.getFoundingPriceAndTime()
    if (loadingFoundingPriceAndTime || !foundingPriceAndTime) return undefined

    const [, , startTime] = foundingPriceAndTime
    const timestamp = startTime.toNumber()
    const foundingStartTime = fromUnixTime(timestamp)
    return foundingStartTime
  }

  get foundingEndTime(): Date | undefined {
    const [loadingFoundingPriceAndTime, foundingPriceAndTime] = this.getFoundingPriceAndTime()
    if (loadingFoundingPriceAndTime || !foundingPriceAndTime) return undefined

    const [, , , endTime] = foundingPriceAndTime
    const timestamp = endTime.toNumber()
    const foundingEndTime = fromUnixTime(timestamp)

    return foundingEndTime
  }

  get remainingAuctionEnterprises(): number | undefined {
    const [, auctionCount] = this.getAuctionCount()
    const [, maxAuctioned] = this.getMaxAuctioned()
    if (auctionCount === undefined || maxAuctioned === undefined) return undefined

    return maxAuctioned.toNumber() - auctionCount.toNumber()
  }

  get remainingEnterprises(): number | undefined {
    const [, freeCount] = this.getFreeCount()
    const [, auctionCount] = this.getAuctionCount()
    const totalAmount = this.totalAmountEnterprises
    if (freeCount === undefined || auctionCount === undefined || totalAmount === undefined)
      return undefined

    return totalAmount - (freeCount.toNumber() + auctionCount.toNumber())
  }

  get totalAmountEnterprises(): number | undefined {
    const [, maxFree] = this.getMaxFree()
    const [, maxAuctioned] = this.getMaxAuctioned()
    if (!maxFree || !maxAuctioned) return undefined
    return maxFree.toNumber() + maxAuctioned.toNumber()
  }

  get percentageFounded(): number | undefined {
    if (this.remainingEnterprises !== undefined && this.totalAmountEnterprises !== undefined) {
      const totalFounded = this.totalAmountEnterprises - this.remainingEnterprises
      const percentageFounded = totalFounded / this.totalAmountEnterprises
      return percentageDecimalToBase10(percentageFounded)
    }

    return undefined
  }

  get gameStarted(): boolean {
    if (!this.gameStartTime) return false
    return this.currentTime.getTime() > this.gameStartTime.getTime()
  }

  get foundingStatus(): FoundingStatus | undefined {
    if (this.foundingStartTime !== undefined && this.foundingEndTime !== undefined) {
      let foundingStatus: FoundingStatus
      if (this.currentTime.getTime() > this.foundingEndTime.getTime()) {
        foundingStatus = 'completed'
      } else if (
        this.currentTime.getTime() <= this.foundingEndTime.getTime() &&
        this.currentTime.getTime() > this.foundingStartTime.getTime()
      ) {
        foundingStatus = 'ongoing'
      } else {
        foundingStatus = 'upcoming'
      }
      return foundingStatus
    }

    return undefined
  }
}
