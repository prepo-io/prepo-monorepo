import { notification } from 'antd'
import { ethers, BigNumber } from 'ethers'
import { action, makeObservable, observable, runInAction } from 'mobx'
import { ContractStore } from '@prepo-io/stores'
import { RootStore } from './RootStore'
import { ContractReturn } from './utils/class-utils'
import { formatPassiveRpPerDay } from './utils/common-utils'
import {
  AcquisitionRoyaleAbi as AcquisitionRoyale,
  AcquisitionRoyaleAbi__factory,
} from '../../generated'
import { ImmunityPeriods, RawEnterprise } from '../types/enterprise.types'
import { PassiveRpPerDay } from '../types/common.types'
import { PERCENT_DENOMINATOR, TOTAL_POSSIBLE_ENTERPRISES } from '../lib/constants'
import { transformRawNumber } from '../utils/number-utils'
import { SupportedContracts } from '../lib/supported-contracts'
import { formatImmunityPeriods } from '../utils/enterprise-utils'

type CompeteAndAcquire = AcquisitionRoyale['functions']['competeAndAcquire']
type Deposit = AcquisitionRoyale['functions']['deposit']
type IsMinted = AcquisitionRoyale['functions']['isMinted']
type IsEnterpriseImmune = AcquisitionRoyale['functions']['isEnterpriseImmune']
type GetAdmin = AcquisitionRoyale['functions']['getAdmin']
type GetApproved = AcquisitionRoyale['functions']['getApproved']
type GetAuctionCount = AcquisitionRoyale['functions']['getAuctionCount']
type GetCompete = AcquisitionRoyale['functions']['getCompete']
type GetConsumables = AcquisitionRoyale['functions']['getConsumables']
type GetEnterprise = AcquisitionRoyale['functions']['getEnterprise']
type GetEnterpriseVirtualBalance = AcquisitionRoyale['functions']['getEnterpriseVirtualBalance']
type GetFreeCount = AcquisitionRoyale['functions']['getFreeCount']
type GetImmunityPeriods = AcquisitionRoyale['functions']['getImmunityPeriods']
type GetPassiveRpPerDay = AcquisitionRoyale['functions']['getPassiveRpPerDay']
type GetReservedCount = AcquisitionRoyale['functions']['getReservedCount']
type GetWithdrawalBurnPercentage = AcquisitionRoyale['functions']['getWithdrawalBurnPercentage']
type Merge = AcquisitionRoyale['functions']['merge']
type Compete = AcquisitionRoyale['functions']['compete']
type OwnerOf = AcquisitionRoyale['functions']['ownerOf']
type Revive = AcquisitionRoyale['functions']['revive']
type Rename = AcquisitionRoyale['functions']['rename']
type Rebrand = AcquisitionRoyale['functions']['rebrand']
type TotalSupply = AcquisitionRoyale['functions']['totalSupply']
type Withdraw = AcquisitionRoyale['functions']['withdraw']

export type EnterpriseArray = ContractReturn<GetEnterprise>
export type PassiveRpPerDayArray = ContractReturn<GetPassiveRpPerDay>
type BalanceOf = AcquisitionRoyale['functions']['balanceOf']
type TokenOfOwnerByIndex = AcquisitionRoyale['functions']['tokenOfOwnerByIndex']

export class AcquisitionRoyaleContractStore extends ContractStore<RootStore, SupportedContracts> {
  acquiring: boolean
  acquireKeepId?: number
  competeRp: string
  competing: boolean
  depositAmount: string
  depositing: boolean
  merging: boolean
  newName: string
  rebrandAddress: string
  rebranding: boolean
  renaming: boolean
  reviving: boolean
  withdrawAmount: string
  withdrawing: boolean

  constructor(root: RootStore) {
    super(root, 'ACQUISITION_ROYALE', AcquisitionRoyaleAbi__factory)
    this.acquiring = false
    this.competing = false
    this.competeRp = ''
    this.depositAmount = ''
    this.depositing = false
    this.merging = false
    this.newName = ''
    this.rebrandAddress = ''
    this.rebranding = false
    this.renaming = false
    this.reviving = false
    this.withdrawAmount = ''
    this.withdrawing = false
    makeObservable(this, {
      acquire: action.bound,
      acquiring: observable,
      acquireKeepId: observable,
      compete: action.bound,
      competing: observable,
      competeRp: observable,
      deposit: action.bound,
      depositing: observable,
      depositAmount: observable,
      isMinted: observable,
      merge: action.bound,
      merging: observable,
      newName: observable,
      rebrandAddress: observable,
      rebrand: action.bound,
      rebranding: observable,
      rename: action.bound,
      renaming: observable,
      revive: action.bound,
      reviving: observable,
      setAcquireKeepId: action.bound,
      setCompeteRp: action.bound,
      setDepositAmount: action.bound,
      setNewName: action.bound,
      setRebrandAddress: action.bound,
      setWithdrawAmount: action.bound,
      withdraw: action.bound,
      withdrawAmount: observable,
      withdrawing: observable,
    })
  }

  // custom logic

  getEnterpriseImmunityUntil(rawEnterprise: RawEnterprise): number | undefined {
    if (
      this.acquisitionImmunityPeriod === undefined ||
      this.mergerImmunityPeriod === undefined ||
      this.revivalImmunityPeriod === undefined
    ) {
      return undefined
    }
    const { acquisitionImmunityStartTime, mergerImmunityStartTime, revivalImmunityStartTime } =
      rawEnterprise
    const acquisitionImmunityEnd = acquisitionImmunityStartTime
      .add(this.acquisitionImmunityPeriod)
      .toNumber()
    const mergerImmunityPeriodEnd = mergerImmunityStartTime
      .add(this.mergerImmunityPeriod)
      .toNumber()
    const revivalImmunityPeriodEnd = revivalImmunityStartTime
      .add(this.revivalImmunityPeriod)
      .toNumber()
    return Math.max(acquisitionImmunityEnd, mergerImmunityPeriodEnd, revivalImmunityPeriodEnd)
  }

  setAcquireKeepId(id?: number): void {
    this.acquireKeepId = id
  }

  setCompeteRp(rpToSpend: string): void {
    this.competeRp = rpToSpend
  }

  setDepositAmount(rpToDeposit: string): void {
    this.depositAmount = rpToDeposit
  }

  setNewName(input: string): void {
    this.newName = input
  }

  setRebrandAddress(input: string): void {
    this.rebrandAddress = input
  }

  setWithdrawAmount(rpToWithdraw: string): void {
    this.withdrawAmount = rpToWithdraw
  }

  // contract interaction

  balanceOf(...params: Parameters<BalanceOf>): ContractReturn<BalanceOf> {
    return this.call<BalanceOf>('balanceOf', params)
  }

  isEnterpriseImmune(
    ...params: Parameters<IsEnterpriseImmune>
  ): ContractReturn<IsEnterpriseImmune> {
    return this.call<IsEnterpriseImmune>('isEnterpriseImmune', params)
  }

  tokenOfOwnerByIndex(
    ...params: Parameters<TokenOfOwnerByIndex>
  ): ContractReturn<TokenOfOwnerByIndex> {
    return this.call<TokenOfOwnerByIndex>('tokenOfOwnerByIndex', params)
  }

  getAdmin(...params: Parameters<GetAdmin>): ContractReturn<GetAdmin> {
    return this.call<GetAdmin>('getAdmin', params)
  }

  getApproved(...params: Parameters<GetApproved>): ContractReturn<GetApproved> {
    return this.call<GetApproved>('getApproved', params)
  }

  getAuctionCount(...params: Parameters<GetAuctionCount>): ContractReturn<GetAuctionCount> {
    return this.call<GetAuctionCount>('getAuctionCount', params)
  }

  getCompete(...params: Parameters<GetCompete>): ContractReturn<GetCompete> {
    return this.call<GetCompete>('getCompete', params)
  }

  getConsumables(...params: Parameters<GetConsumables>): ContractReturn<GetConsumables> {
    return this.call<GetConsumables>('getConsumables', params)
  }

  getEnterprise(...params: Parameters<GetEnterprise>): ContractReturn<GetEnterprise> {
    return this.call<GetEnterprise>('getEnterprise', params)
  }

  getEnterpriseVirtualBalance(
    ...params: Parameters<GetEnterpriseVirtualBalance>
  ): ContractReturn<GetEnterpriseVirtualBalance> {
    return this.call<GetEnterpriseVirtualBalance>('getEnterpriseVirtualBalance', params)
  }

  getFreeCount(...params: Parameters<GetFreeCount>): ContractReturn<GetFreeCount> {
    return this.call<GetFreeCount>('getFreeCount', params)
  }

  getImmunityPeriods(
    ...params: Parameters<GetImmunityPeriods>
  ): ContractReturn<GetImmunityPeriods> {
    return this.call<GetImmunityPeriods>('getImmunityPeriods', params)
  }

  getPassiveRpPerday(
    ...params: Parameters<GetPassiveRpPerDay>
  ): ContractReturn<GetPassiveRpPerDay> {
    return this.call<GetPassiveRpPerDay>('getPassiveRpPerDay', params)
  }

  getReservedCount(...params: Parameters<GetReservedCount>): ContractReturn<GetReservedCount> {
    return this.call<GetReservedCount>('getReservedCount', params)
  }

  getTotalSupply(...params: Parameters<TotalSupply>): ContractReturn<TotalSupply> {
    return this.call<TotalSupply>('totalSupply', params)
  }

  getWithdrawalBurnPercentage(
    ...params: Parameters<GetWithdrawalBurnPercentage>
  ): ContractReturn<GetWithdrawalBurnPercentage> {
    return this.call<GetWithdrawalBurnPercentage>('getWithdrawalBurnPercentage', params)
  }

  isMinted(...params: Parameters<IsMinted>): ContractReturn<IsMinted> {
    return this.call<IsMinted>('isMinted', params)
  }

  ownerOf(...params: Parameters<OwnerOf>): ContractReturn<OwnerOf> {
    return this.call<OwnerOf>('ownerOf', params)
  }

  // write contract

  async acquire(): Promise<boolean | undefined> {
    const { competitionActiveEnterprise, signerActiveEnterprise } = this.root.enterprisesStore
    if (
      this.acquireKeepId !== undefined &&
      competitionActiveEnterprise !== undefined &&
      signerActiveEnterprise !== undefined &&
      this.root.acquireCostContractStore.acquireCost !== undefined
    ) {
      try {
        this.acquiring = true
        const burnId =
          this.acquireKeepId === signerActiveEnterprise.id
            ? competitionActiveEnterprise.id
            : signerActiveEnterprise.id
        const value = ethers.utils.parseEther(`${this.root.acquireCostContractStore.acquireCost}`)
        const tx = await this.sendTransaction<CompeteAndAcquire>(
          'competeAndAcquire',
          [signerActiveEnterprise.id, competitionActiveEnterprise.id, burnId],
          { value }
        )
        await tx.wait()

        runInAction(() => {
          this.root.enterprisesStore.setSignerEnterpriseActiveId(this.acquireKeepId)
          this.root.enterprisesStore.setCompetitionEnterpriseActiveId(undefined)
          this.root.enterprisesStore.searchCompetition('')
        })
        return true
      } catch (error) {
        this.root.toastStore.errorToast('acquire', error)
        return false
      } finally {
        runInAction(() => {
          this.acquiring = false
        })
      }
    }
    return undefined
  }

  async compete(): Promise<boolean | undefined> {
    const { signerActiveEnterprise, competitionActiveEnterprise } = this.root.enterprisesStore
    if (signerActiveEnterprise !== undefined && competitionActiveEnterprise !== undefined) {
      try {
        this.competing = true
        const tx = await this.sendTransaction<Compete>('compete', [
          signerActiveEnterprise.id,
          competitionActiveEnterprise.id,
          ethers.utils.parseEther(this.competeRp),
        ])
        await tx.wait()
        return true
      } catch (error) {
        this.root.toastStore.errorToast('compete', error)
        return false
      } finally {
        runInAction(() => {
          this.competing = false
        })
      }
    }
    return undefined
  }

  async deposit(): Promise<boolean | undefined> {
    const { signerActiveEnterprise } = this.root.enterprisesStore
    if (
      signerActiveEnterprise !== undefined &&
      this.depositAmount &&
      !Number.isNaN(+this.depositAmount)
    ) {
      try {
        this.depositing = true
        const tx = await this.sendTransaction<Deposit>('deposit', [
          signerActiveEnterprise.id,
          ethers.utils.parseEther(this.depositAmount),
        ])
        await tx.wait()
        runInAction(() => {
          this.depositAmount = ''
        })
        return true
      } catch (error) {
        this.root.toastStore.errorToast('deposit', error)
        return false
      } finally {
        runInAction(() => {
          this.depositing = false
        })
      }
    }
    return undefined
  }

  async merge(): Promise<boolean | undefined> {
    const { signerActiveEnterprise, mergeTargetEnterprise } = this.root.enterprisesStore
    if (
      signerActiveEnterprise !== undefined &&
      mergeTargetEnterprise !== undefined &&
      this.root.mergeCostContractStore.mergeCost !== undefined
    ) {
      try {
        this.merging = true
        const value = this.root.mergeCostContractStore.mergeCost.raw.amountToTreasury
        const tx = await this.sendTransaction<Merge>(
          'merge',
          [signerActiveEnterprise.id, mergeTargetEnterprise.id, mergeTargetEnterprise.id],
          { value }
        )
        await tx.wait()
        this.root.enterprisesStore.setMergeTargetId(undefined)
        return true
      } catch (error) {
        this.root.toastStore.errorToast('merge', error)
      } finally {
        runInAction(() => {
          this.merging = false
        })
      }
    }
    return false
  }

  async rename(): Promise<boolean | undefined> {
    const { signerActiveEnterprise } = this.root.enterprisesStore
    try {
      if (this.newName.length > 0 && signerActiveEnterprise !== undefined) {
        this.renaming = true
        const tx = await this.sendTransaction<Rename>('rename', [
          signerActiveEnterprise.id,
          this.newName,
        ])
        await tx.wait()
        runInAction(() => {
          this.newName = ''
        })
        return true
      }
    } catch (error) {
      this.root.toastStore.errorToast('rename', error)
    } finally {
      runInAction(() => {
        this.renaming = false
      })
    }
    return false
  }

  async revive(): Promise<boolean | undefined> {
    try {
      const { competitionActiveEnterprise } = this.root.enterprisesStore
      if (competitionActiveEnterprise !== undefined) {
        if (!competitionActiveEnterprise.burned) {
          notification.error({ message: 'Cannot revive, enterprise is active!' })
          return false
        }
        this.reviving = true
        const tx = await this.sendTransaction<Revive>('revive', [competitionActiveEnterprise.id])
        await tx.wait()
        notification.success({
          message: `${competitionActiveEnterprise.name} is now yours! 🎉`,
        })
        runInAction(() => {
          this.root.enterprisesStore.setCompetitionEnterpriseActiveId(undefined)
          this.root.enterprisesStore.searchCompetition('')
        })
        return true
      }
    } catch (error) {
      this.root.toastStore.errorToast('revive', error)
    } finally {
      runInAction(() => {
        this.reviving = false
      })
    }
    return false
  }

  async rebrand(): Promise<boolean | undefined> {
    const { signerActiveEnterprise } = this.root.enterprisesStore
    try {
      if (signerActiveEnterprise) {
        if (!ethers.utils.isAddress(this.rebrandAddress)) {
          notification.error({ message: 'Not a valid address!' })
          return false
        }
        this.rebranding = true
        const tx = await this.sendTransaction<Rebrand>('rebrand', [
          signerActiveEnterprise.id,
          this.rebrandAddress,
        ])
        await tx.wait()
        return true
      }
    } catch (error) {
      this.root.toastStore.errorToast('rebrand', error)
      return false
    } finally {
      runInAction(() => {
        this.rebranding = false
      })
    }
    return false
  }

  async withdraw(): Promise<boolean | undefined> {
    const { signerActiveEnterprise } = this.root.enterprisesStore
    if (
      signerActiveEnterprise !== undefined &&
      this.withdrawAmount &&
      !Number.isNaN(+this.withdrawAmount)
    ) {
      try {
        this.withdrawing = true
        const tx = await this.sendTransaction<Withdraw>('withdraw', [
          signerActiveEnterprise.id,
          ethers.utils.parseEther(this.withdrawAmount),
        ])
        await tx.wait()
        runInAction(() => {
          this.withdrawAmount = ''
        })
        return true
      } catch (error) {
        this.root.toastStore.errorToast('withdraw', error)
        return false
      } finally {
        runInAction(() => {
          this.withdrawing = false
        })
      }
    }

    return undefined
  }

  get acquisitionImmunityPeriod(): BigNumber | undefined {
    return this.immunityPeriods?.acquisitionImmunityPeriod
  }

  get adminAddress(): string | undefined {
    const rawAdmin = this.getAdmin()
    if (rawAdmin?.[0] === undefined) return undefined
    return rawAdmin[0]
  }

  get auctionCount(): number | undefined {
    return transformRawNumber(this.getAuctionCount())
  }

  get burntCount(): number | undefined {
    if (this.totalMinted === undefined || this.totalSupply === undefined) return undefined
    return this.totalMinted - this.totalSupply
  }

  get competeAddress(): string | undefined {
    const rawAddress = this.getCompete()
    if (rawAddress?.[0] === undefined) return undefined
    return rawAddress[0]
  }

  get consumablesAddress(): string | undefined {
    const rawConsumablesAddress = this.getConsumables()
    if (rawConsumablesAddress?.[0] === undefined) return undefined
    return rawConsumablesAddress[0]
  }

  get freeCount(): number | undefined {
    return transformRawNumber(this.getFreeCount())
  }

  get immunityPeriods(): ImmunityPeriods | undefined {
    const immunityPeriods = this.getImmunityPeriods()
    if (immunityPeriods === undefined) return undefined
    return formatImmunityPeriods(immunityPeriods)
  }

  get mergerImmunityPeriod(): BigNumber | undefined {
    return this.immunityPeriods?.mergeImmunityPeriod
  }

  get passiveRpPerDay(): PassiveRpPerDay | undefined {
    return formatPassiveRpPerDay(this.getPassiveRpPerday())
  }

  get remainingEnterprises(): number | undefined {
    if (this.burntCount === undefined) return undefined
    return TOTAL_POSSIBLE_ENTERPRISES - this.burntCount
  }

  get reservedCount(): number | undefined {
    return transformRawNumber(this.getReservedCount())
  }

  get revivalImmunityPeriod(): BigNumber | undefined {
    return this.immunityPeriods?.revivalImmunityPeriod
  }

  get totalMinted(): number | undefined {
    if (
      this.auctionCount === undefined ||
      this.freeCount === undefined ||
      this.reservedCount === undefined
    )
      return undefined
    return this.auctionCount + this.freeCount + this.reservedCount
  }

  get totalSupply(): number | undefined {
    return transformRawNumber(this.getTotalSupply())
  }

  get withdrawalBurnPercentage(): number | undefined {
    const rawWithdrawalBurnPercentage = this.getWithdrawalBurnPercentage()
    if (!rawWithdrawalBurnPercentage) return undefined
    return rawWithdrawalBurnPercentage[0].toNumber() / PERCENT_DENOMINATOR
  }
}
