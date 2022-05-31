import { ContractReturn, ContractStore } from '@prepo-io/stores'
import { makeObservable } from 'mobx'
import {
  MinigameProRataAbi__factory,
  MinigameProRataAbi as MinigameProRata,
} from '../../../generated'
import { SupportedMinigameContractName } from '../../lib/minigames-contracts'
import { SupportedContracts } from '../../lib/supported-contracts'
import { transformRawEther, transformRawNumber } from '../../utils/number-utils'
import { RootStore } from '../RootStore'
import { formatContractAddress } from '../utils/common-utils'

type Action = MinigameProRata['functions']['action']
type GetActionHook = MinigameProRata['functions']['getActionHook']
type GetCurrActionCount = MinigameProRata['functions']['getCurrActionCount']
type GetPeriodLength = MinigameProRata['functions']['getPeriodLength']
type GetPrevActionCount = MinigameProRata['functions']['getPrevActionCount']
type GetRewardAmountPerPeriod = MinigameProRata['functions']['getRewardAmountPerPeriod']
type GetRewardToken = MinigameProRata['functions']['getRewardToken']
type GetTotalCurrActionCount = MinigameProRata['functions']['getTotalCurrActionCount']
type GetTotalPrevActionCount = MinigameProRata['functions']['getTotalPrevActionCount']
type GetUserActionLimitPerPeriod = MinigameProRata['functions']['getUserActionLimitPerPeriod']

export class MinigameProRataStore extends ContractStore<RootStore, SupportedContracts> {
  name: string
  constructor(root: RootStore, contractName: SupportedMinigameContractName, minigameName: string) {
    super(root, contractName, MinigameProRataAbi__factory)
    this.name = minigameName
    makeObservable(this, {})
  }

  private getActionHook(): ContractReturn<GetActionHook> {
    return this.call<GetActionHook>('getActionHook', [])
  }

  private getCurrActionCount(
    ...params: Parameters<GetCurrActionCount>
  ): ContractReturn<GetCurrActionCount> {
    return this.call<GetCurrActionCount>('getCurrActionCount', params)
  }

  private getPeriodLength(): ContractReturn<GetPeriodLength> {
    return this.call<GetPeriodLength>('getPeriodLength', [])
  }

  private getPrevActionCount(
    ...params: Parameters<GetPrevActionCount>
  ): ContractReturn<GetPrevActionCount> {
    return this.call<GetPrevActionCount>('getPrevActionCount', params)
  }

  private getRewardAmountPerPeriod(): ContractReturn<GetRewardAmountPerPeriod> {
    return this.call<GetRewardAmountPerPeriod>('getRewardAmountPerPeriod', [])
  }

  private getRewardToken(): ContractReturn<GetRewardToken> {
    return this.call<GetRewardToken>('getRewardToken', [])
  }

  private getTotalCurrActionCount(): ContractReturn<GetTotalCurrActionCount> {
    return this.call<GetTotalCurrActionCount>('getTotalCurrActionCount', [])
  }

  private getTotalPrevActionCount(): ContractReturn<GetTotalPrevActionCount> {
    return this.call<GetTotalPrevActionCount>('getTotalPrevActionCount', [])
  }

  private getUserActionLimitPerPeriod(): ContractReturn<GetUserActionLimitPerPeriod> {
    return this.call<GetUserActionLimitPerPeriod>('getUserActionLimitPerPeriod', [])
  }

  async action(onHash?: (string) => unknown): Promise<boolean> {
    try {
      const tx = await this.sendTransaction<Action>('action', [])
      if (onHash) onHash(tx.hash)
      await tx.wait()
      this.root.toastStore.successToast(`Completed ${this.name}`)
      return true
    } catch (error) {
      this.root.toastStore.errorToast(this.name, error)
      return false
    }
  }

  get actionHook(): string | undefined {
    return formatContractAddress(this.getActionHook())
  }

  get currActionCount(): number | undefined {
    const { address } = this.root.web3Store
    if (!address) return 0
    return transformRawNumber(this.getCurrActionCount(address))
  }

  get periodLength(): number | undefined {
    return transformRawNumber(this.getPeriodLength())
  }

  get prevActionCount(): number | undefined {
    const { address } = this.root.web3Store
    if (!address) return 0
    return transformRawNumber(this.getPrevActionCount(address))
  }

  get rewardAmountPerPeriod(): number | undefined {
    return transformRawEther(this.getRewardAmountPerPeriod())
  }

  get rewardToken(): string | undefined {
    return formatContractAddress(this.getRewardToken())
  }

  get totalCurrActionCount(): number | undefined {
    return transformRawNumber(this.getTotalCurrActionCount())
  }

  get totalPrevActionCount(): number | undefined {
    return transformRawNumber(this.getTotalPrevActionCount())
  }

  get userActionLimitPerPeriod(): number | undefined {
    return transformRawNumber(this.getUserActionLimitPerPeriod())
  }
}
