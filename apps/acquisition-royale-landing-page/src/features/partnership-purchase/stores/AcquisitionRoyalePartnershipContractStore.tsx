import { autorun, makeAutoObservable, runInAction } from 'mobx'
import { BigNumber, providers, utils } from 'ethers'

import { getExternalContractAddress } from '../../../lib/external-contracts'
import { formatNumber } from '../../../utils/number-utils'
import { handleError } from '../../../utils/exception-handling'
import { RootStore } from '../../../stores/RootStore'
import {
  fetch,
  ContractStore,
  ContractReturnType,
  ContractGetterReturnType,
} from '../../../stores/utils/class-utils'
import {
  AcquisitionRoyalePartnershipAbi,
  AcquisitionRoyalePartnershipAbi__factory,
} from '../../../../generated/typechain'

const { formatUnits } = utils

export type FoundingStatus = 'completed' | 'ongoing' | 'upcoming'

type GetCounter = AcquisitionRoyalePartnershipAbi['functions']['getCounter']
type GetPartnerId = AcquisitionRoyalePartnershipAbi['functions']['getPartnerId']
type GetPartnerPrice = AcquisitionRoyalePartnershipAbi['functions']['getPartnerPrice']
type GetFoundedNFTs = AcquisitionRoyalePartnershipAbi['functions']['balanceOf']

type Functions = keyof AcquisitionRoyalePartnershipAbi['functions']
type Storage = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key in Functions]?: any
}

export class AcquisitionRoyalePartnershipContractStore implements ContractStore {
  root: RootStore
  reference = 'acquisitionRoyalePartnershipContractStore'
  address?: string
  purchasingNFT = false
  contract?: AcquisitionRoyalePartnershipAbi
  abi = AcquisitionRoyalePartnershipAbi__factory.abi
  partnerTokenAddress: string | undefined
  storage: Storage = {}

  constructor(root: RootStore) {
    this.root = root
    makeAutoObservable(this, { abi: false })
    this.initContract()
  }

  initContract(): void {
    autorun(() => {
      const network = this.root.web3Store.network.name
      const address = getExternalContractAddress('ACQUISITION_ROYALE_PARTNERSHIP', network)
      if (typeof address === 'undefined')
        throw Error(`no address for ${this.reference} on ${network}`)

      runInAction(() => {
        this.address = address
        this.contract = AcquisitionRoyalePartnershipAbi__factory.connect(
          this.address,
          this.root.web3Store.coreProvider
        )
      })
    })
  }

  // Checks the signer wallet, then creates a writable contract hooked up with it
  async createWriteContract(): Promise<AcquisitionRoyalePartnershipAbi> {
    await this.root.web3Store.checkSigner()
    const writeContract = AcquisitionRoyalePartnershipAbi__factory.connect(
      this.address as string,
      this.root.web3Store.signer as providers.JsonRpcSigner
    )
    return writeContract
  }

  async purchase(quantity: number): Promise<boolean> {
    if (!this.partnerTokenAddress) return false
    const { partnerTokenAddress } = this
    const [, auctionPrice] = this.getPartnerPrice(partnerTokenAddress)
    if (!auctionPrice) throw Error('auctionPrice unexpectedly not defined')
    try {
      const writeContract = await this.createWriteContract()

      const gasEstimate = await writeContract.estimateGas.purchase(partnerTokenAddress, quantity)
      const gasOptions: { gasLimit: BigNumber; gasPrice?: BigNumber } = {
        gasLimit: gasEstimate.mul(2),
      }
      const options = { ...gasOptions }

      if (this.root.web3Store.network.gasPrice !== undefined)
        options.gasPrice = this.root.web3Store.network.gasPrice

      const tx = await writeContract.purchase(partnerTokenAddress, quantity)
      runInAction(() => {
        this.purchasingNFT = true
      })
      await this.root.web3Store.coreProvider.waitForTransaction(tx.hash)
      return true
    } catch (e) {
      handleError('foundAuctioned', e)
      return false
    } finally {
      runInAction(() => {
        this.purchasingNFT = false
      })
    }
  }

  getCounter(): ContractGetterReturnType<GetCounter> {
    return fetch<Parameters<GetCounter>, ContractReturnType<GetCounter>>(this, 'getCounter', [])
  }

  getFoundedNFTs(address: string, partnerId: BigNumber): ContractGetterReturnType<GetFoundedNFTs> {
    return fetch<Parameters<GetFoundedNFTs>, ContractReturnType<GetFoundedNFTs>>(
      this,
      'balanceOf',
      [address, partnerId]
    )
  }

  getPartnerPrice(partnerTokenAddress: string): ContractGetterReturnType<GetPartnerPrice> {
    return fetch<Parameters<GetPartnerPrice>, ContractReturnType<GetPartnerPrice>>(
      this,
      'getPartnerPrice',
      [partnerTokenAddress]
    )
  }

  getPartnerId(partnerTokenAddress: string): ContractGetterReturnType<GetPartnerId> {
    return fetch<Parameters<GetPartnerId>, ContractReturnType<GetPartnerId>>(this, 'getPartnerId', [
      partnerTokenAddress,
    ])
  }

  get formattedAuctionPrice(): string | undefined {
    if (!this.partnerTokenAddress) return undefined
    const [, auctionPrice] = this.getPartnerPrice(this.partnerTokenAddress)
    if (!auctionPrice) return undefined
    const { decimals } = this.root.web3Store.network.nativeCurrency
    return formatNumber(formatUnits(auctionPrice.toString(), decimals), {
      maximumFractionDigits: 0,
    })
  }

  get signerNftBalance(): number | undefined {
    if (!this.partnerTokenAddress) return undefined
    const [, partnerId] = this.getPartnerId(this.partnerTokenAddress)
    const signerAddress = this.root.web3Store.signerState.address
    if (!signerAddress || !partnerId) return undefined
    const [loadingFoundedNFTs, balance] = this.getFoundedNFTs(signerAddress, partnerId)
    if (loadingFoundedNFTs || !balance) return undefined

    return balance.toNumber()
  }

  get remainingNFTs(): number | undefined {
    if (!this.address || !this.partnerTokenAddress) return undefined
    const [, partnerId] = this.getPartnerId(this.partnerTokenAddress)
    if (!partnerId) return undefined
    const [, remainingNFTsOnPartner] = this.getFoundedNFTs(this.address, partnerId)

    return remainingNFTsOnPartner?.toNumber()
  }

  get partnerPrice(): BigNumber | undefined {
    if (!this.partnerTokenAddress) return undefined
    const [, partnerAuctionPrice] = this.getPartnerPrice(this.partnerTokenAddress)
    if (!partnerAuctionPrice) return undefined
    return partnerAuctionPrice
  }

  setPartnerTokenAddress(partnerTokenAddress: string): void {
    this.partnerTokenAddress = partnerTokenAddress
  }
}
