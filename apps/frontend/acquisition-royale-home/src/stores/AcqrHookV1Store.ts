import { ContractReturn, ContractStore } from '@prepo-io/stores'
import { makeObservable, reaction } from 'mobx'
import { RootStore } from './RootStore'
import { formatContractAddress } from './utils/common-utils'
import { AcqrHookV1Abi as AcqrHookV1, AcqrHookV1Abi__factory } from '../../generated'
import { SupportedContracts } from '../lib/supported-contracts'

type GetMoat = AcqrHookV1['functions']['getMoat']

export class AcqrHookV1Store extends ContractStore<RootStore, SupportedContracts> {
  constructor(public root: RootStore) {
    super(root, 'ACQR_HOOK_V1', AcqrHookV1Abi__factory)
    makeObservable(this, {})
    this.initContract()
  }

  initContract(): void {
    const disposer = reaction(
      () => this.root.acquisitionRoyaleContractStore.hook,
      (hookAddress) => {
        if (hookAddress === undefined) return
        this.updateAddress(hookAddress)
        disposer()
      }
    )
  }

  getMoat(...params: Parameters<GetMoat>): ContractReturn<GetMoat> {
    return this.call<GetMoat>('getMoat', params)
  }

  get moat(): string | undefined {
    return formatContractAddress(this.getMoat())
  }
}
