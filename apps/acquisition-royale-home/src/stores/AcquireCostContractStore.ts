import { makeObservable } from 'mobx'
import { ContractStore } from '@prepo-io/stores'
import { RootStore } from './RootStore'
import { ContractReturn } from './utils/class-utils'
import { formatCommonCost, sumCost } from './utils/cost.utils'
import { AcquireCostAbi as AcquireCost, AcquireCostAbi__factory } from '../../generated'
import { CommonCostProps } from '../types/cost.types'
import { SupportedContracts } from '../lib/supported-contracts'

type GetCost = AcquireCost['functions']['getCost']
export type GetCostArray = ContractReturn<GetCost>

export class AcquireCostContractStore extends ContractStore<RootStore, SupportedContracts> {
  constructor(root: RootStore) {
    super(root, 'ACQUIRE_COST', AcquireCostAbi__factory)
    makeObservable(this, {})
  }

  getCost(...params: Parameters<GetCost>): ContractReturn<GetCost> {
    return this.call<GetCost>('getCost', params)
  }

  get acquireCost(): number | undefined {
    return sumCost(formatCommonCost(this.getCost(0, 0)))
  }

  get acquireCostBreakdown(): CommonCostProps | undefined {
    return formatCommonCost(this.getCost(0, 0))
  }
}
