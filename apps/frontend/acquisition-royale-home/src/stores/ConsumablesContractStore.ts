import { autorun, makeObservable } from 'mobx'
import { ContractStore } from '@prepo-io/stores'
import { RootStore } from './RootStore'
import { ContractReturn } from './utils/class-utils'
import { ConsumablesAbi as Consumables, ConsumablesAbi__factory } from '../../generated'
import { consumablesTokenId } from '../utils/consumables-utils'
import { Consumables as ConsumablesType } from '../types/consumables.type'
import { SupportedContracts } from '../lib/supported-contracts'

type BalanceOf = Consumables['functions']['balanceOf']

export class ConsumablesContractStore extends ContractStore<RootStore, SupportedContracts> {
  constructor(root: RootStore) {
    super(root, 'CONSUMABLES', ConsumablesAbi__factory)
    makeObservable(this, {})
    autorun(() => {
      const { consumablesAddress } = this.root.acquisitionRoyaleContractStore
      if (consumablesAddress !== undefined && consumablesAddress !== this.contract?.address) {
        this.updateAddress(consumablesAddress)
      }
    })
  }

  balanceOf(...params: Parameters<BalanceOf>): ContractReturn<BalanceOf> {
    return this.call<BalanceOf>('balanceOf', params)
  }

  getSignerBalance(id: number): number | undefined {
    const { address } = this.root.web3Store
    if (address === undefined) return undefined
    const rawBalance = this.balanceOf(address, id)
    if (rawBalance?.[0] === undefined) return undefined
    return rawBalance[0].toNumber()
  }

  get rebrandBalance(): number | undefined {
    return this.getSignerBalance(consumablesTokenId[ConsumablesType.RebrandToken])
  }

  get renameBalance(): number | undefined {
    return this.getSignerBalance(consumablesTokenId[ConsumablesType.RenameToken])
  }

  get reviveBalance(): number | undefined {
    return this.getSignerBalance(consumablesTokenId[ConsumablesType.ReviveToken])
  }
}
