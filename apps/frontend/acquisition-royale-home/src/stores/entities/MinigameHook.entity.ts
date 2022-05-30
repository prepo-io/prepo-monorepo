import { ContractReturn, ContractStore } from '@prepo-io/stores'
import { makeObservable } from 'mobx'
import { MinigameHookAbi__factory, MinigameHookAbi as MinigameHook } from '../../../generated'
import { SupportedMinigameContractName } from '../../lib/minigames-contracts'
import { SupportedContracts } from '../../lib/supported-contracts'
import { transformRawNumber } from '../../utils/number-utils'
import { RootStore } from '../RootStore'

type GetMinAcquireCount = MinigameHook['functions']['getMinAcquireCount']
type GetMinCompeteCount = MinigameHook['functions']['getMinCompeteCount']
type GetMinEnterpriseCount = MinigameHook['functions']['getMinEnterpriseCount']
type GetMinMergeCount = MinigameHook['functions']['getMinMergeCount']
type GetMinReviveCount = MinigameHook['functions']['getMinReviveCount']
type GetMustBeRebranded = MinigameHook['functions']['getMustBeRebranded']
type GetMustBeRenamed = MinigameHook['functions']['getMustBeRenamed']

export class MinigameHookStore extends ContractStore<RootStore, SupportedContracts> {
  constructor(root: RootStore, contractName: SupportedMinigameContractName) {
    super(root, contractName, MinigameHookAbi__factory)
    makeObservable(this, {})
  }

  private getMinAcquireCount(): ContractReturn<GetMinAcquireCount> {
    return this.call<GetMinAcquireCount>('getMinAcquireCount', [], { subscribe: false })
  }

  private getMinCompeteCount(): ContractReturn<GetMinCompeteCount> {
    return this.call<GetMinCompeteCount>('getMinCompeteCount', [], { subscribe: false })
  }

  private getMinEnterpriseCount(): ContractReturn<GetMinEnterpriseCount> {
    return this.call<GetMinEnterpriseCount>('getMinEnterpriseCount', [], { subscribe: false })
  }

  private getMinMergeCount(): ContractReturn<GetMinMergeCount> {
    return this.call<GetMinMergeCount>('getMinMergeCount', [], { subscribe: false })
  }

  private getMinReviveCount(): ContractReturn<GetMinReviveCount> {
    return this.call<GetMinReviveCount>('getMinReviveCount', [], { subscribe: false })
  }

  private getMustBeRebranded(): ContractReturn<GetMustBeRebranded> {
    return this.call<GetMustBeRebranded>('getMustBeRebranded', [], { subscribe: false })
  }

  private getMustBeRenamed(): ContractReturn<GetMustBeRenamed> {
    return this.call<GetMustBeRenamed>('getMustBeRenamed', [], { subscribe: false })
  }

  get minAcquireCount(): number {
    return transformRawNumber(this.getMinAcquireCount())
  }

  get minCompeteCount(): number {
    return transformRawNumber(this.getMinCompeteCount())
  }

  get minEnterpriseCount(): number {
    return transformRawNumber(this.getMinEnterpriseCount())
  }

  get minMergeCount(): number {
    return transformRawNumber(this.getMinMergeCount())
  }

  get minReviveCount(): number {
    return transformRawNumber(this.getMinReviveCount())
  }

  get mustBeRebranded(): boolean {
    return this.getMustBeRebranded()?.[0]
  }

  get mustBeRenamed(): boolean {
    return this.getMustBeRenamed()?.[0]
  }
}
