import { makeObservable } from 'mobx'
import { ContractStore } from '@prepo-io/stores'
import { RootStore } from './RootStore'
import { ContractReturn } from './utils/class-utils'
import { formatCommonCost } from './utils/cost.utils'
import { MergeCostAbi as MergeCost, MergeCostAbi__factory } from '../../generated'
import { CommonCostProps } from '../types/cost.types'
import { SupportedContracts } from '../lib/supported-contracts'

type GetCost = MergeCost['functions']['getCost']
export type GetCostArray = ContractReturn<GetCost>

export class MergeCostContractStore extends ContractStore<RootStore, SupportedContracts> {
  constructor(root: RootStore) {
    super(root, 'MERGE_COST', MergeCostAbi__factory)
    makeObservable(this, {})
  }

  getCost(...params: Parameters<GetCost>): ContractReturn<GetCost> {
    return this.call<GetCost>('getCost', params)
  }

  get mergeCost(): CommonCostProps | undefined {
    return formatCommonCost(this.getCost(0, 0))
  }
}
