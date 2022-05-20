import { ContractStore } from '@prepo-io/stores'
import { makeObservable, reaction } from 'mobx'
import { RootStore } from './RootStore'
import { SupportedContracts } from '../lib/supported-contracts'
import { MoatAbi__factory } from '../../generated'

export class MoatContractStore extends ContractStore<RootStore, SupportedContracts> {
  constructor(public root: RootStore) {
    super(root, 'MOAT', MoatAbi__factory)
    makeObservable(this, {})
    this.initContract()
  }

  initContract(): void {
    const disposer = reaction(
      () => this.root.acqrHookV1.moat,
      (moat) => {
        if (moat === undefined) return
        this.updateAddress(moat)
        disposer()
      }
    )
  }
}
