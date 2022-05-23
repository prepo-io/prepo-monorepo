import { makeObservable, reaction } from 'mobx'
import { ContractStore } from '@prepo-io/stores'
import { RootStore } from './RootStore'
import { ContractReturn } from './utils/class-utils'
import { formatCommonCost, sumCost } from './utils/cost.utils'
import { AcquireRPCostAbi as AcquireRPCost, AcquireRPCostAbi__factory } from '../../generated'
import { CommonCostProps } from '../types/cost.types'
import { SupportedContracts } from '../lib/supported-contracts'

type GetCost = AcquireRPCost['functions']['getCost']
export type GetCostArray = ContractReturn<GetCost>

export class AcquireRPCostContractStore extends ContractStore<RootStore, SupportedContracts> {
  constructor(root: RootStore) {
    super(root, 'ACQUIRE_RP_COST', AcquireRPCostAbi__factory)
    makeObservable(this, {})
    this.initContract()
  }

  initContract(): void {
    reaction(
      () => this.root.acquisitionRoyaleContractStore.acquireRPCostContract,
      (acquireRPCostContract) => acquireRPCostContract && this.updateAddress(acquireRPCostContract)
    )
  }

  getCost(...params: Parameters<GetCost>): ContractReturn<GetCost> {
    return this.call<GetCost>('getCost', params)
  }

  get costs(): CommonCostProps | undefined {
    return formatCommonCost(this.getCost(0, 0))
  }
  get acquireCost(): number | undefined {
    return sumCost(this.costs)
  }
}
