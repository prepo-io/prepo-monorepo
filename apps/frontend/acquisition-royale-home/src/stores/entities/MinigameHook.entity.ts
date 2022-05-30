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
    return this.call<GetMinAcquireCount>('getMinAcquireCount', [])
  }

  private getMinCompeteCount(): ContractReturn<GetMinCompeteCount> {
    return this.call<GetMinCompeteCount>('getMinCompeteCount', [])
  }

  private getMinEnterpriseCount(): ContractReturn<GetMinEnterpriseCount> {
    return this.call<GetMinEnterpriseCount>('getMinEnterpriseCount', [])
  }

  private getMinMergeCount(): ContractReturn<GetMinMergeCount> {
    return this.call<GetMinMergeCount>('getMinMergeCount', [])
  }

  private getMinReviveCount(): ContractReturn<GetMinReviveCount> {
    return this.call<GetMinReviveCount>('getMinReviveCount', [])
  }

  private getMustBeRebranded(): ContractReturn<GetMustBeRebranded> {
    return this.call<GetMustBeRebranded>('getMustBeRebranded', [])
  }

  private getMustBeRenamed(): ContractReturn<GetMustBeRenamed> {
    return this.call<GetMustBeRenamed>('getMustBeRenamed', [])
  }

  get minAcquireCount(): number | undefined {
    return transformRawNumber(this.getMinAcquireCount())
  }

  get minCompeteCount(): number | undefined {
    return transformRawNumber(this.getMinCompeteCount())
  }

  get minEnterpriseCount(): number | undefined {
    return transformRawNumber(this.getMinEnterpriseCount())
  }

  get minMergeCount(): number | undefined {
    return transformRawNumber(this.getMinMergeCount())
  }

  get minReviveCount(): number | undefined {
    return transformRawNumber(this.getMinReviveCount())
  }

  get mustBeRebranded(): boolean | undefined {
    return this.getMustBeRebranded()?.[0]
  }

  get mustBeRenamed(): boolean | undefined {
    return this.getMustBeRenamed()?.[0]
  }
}
