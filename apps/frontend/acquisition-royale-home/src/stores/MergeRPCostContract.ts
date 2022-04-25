import { makeObservable, reaction } from 'mobx'
import { ContractStore } from '@prepo-io/stores'
import { RootStore } from './RootStore'
import { ContractReturn } from './utils/class-utils'
import { formatCommonCost } from './utils/cost.utils'
import { MergeCostAbi as MergeCost, MergeCostAbi__factory } from '../../generated'
import { CommonCostProps } from '../types/cost.types'
import { SupportedContracts } from '../lib/supported-contracts'

type GetCost = MergeCost['functions']['getCost']
export type GetCostArray = ContractReturn<GetCost>

export class MergeRPCostContractStore extends ContractStore<RootStore, SupportedContracts> {
  constructor(root: RootStore) {
    super(root, 'MERGE_RP_COST', MergeCostAbi__factory)
    makeObservable(this, {})
    this.initContract()
  }

  initContract(): void {
    reaction(
      () => this.root.acquisitionRoyaleContractStore.mergeRPCostContract,
      (mergeRPCostContract) => mergeRPCostContract && this.updateAddress(mergeRPCostContract)
    )
  }

  getCost(...params: Parameters<GetCost>): ContractReturn<GetCost> {
    return this.call<GetCost>('getCost', params)
  }

  get costs(): CommonCostProps | undefined {
    return formatCommonCost(this.getCost(0, 0))
  }

  get mergeCost(): number | undefined {
    return this.costs?.amountToBurn
  }
}
