import { ethers } from 'ethers'
import { action, makeObservable } from 'mobx'
import { ContractStore, SendTransactionReturn } from '@prepo-io/stores'
import { RootStore } from './RootStore'
import { ContractReturn } from './utils/class-utils'
import { RunwayPointsAbi as RunwayPoints, RunwayPointsAbi__factory } from '../../generated'
import { SupportedContracts } from '../lib/supported-contracts'

type Allowance = RunwayPoints['functions']['allowance']
type Approve = RunwayPoints['functions']['approve']
type BalanceOf = RunwayPoints['functions']['balanceOf']

export class RunwayPointsContractStore extends ContractStore<RootStore, SupportedContracts> {
  constructor(root: RootStore) {
    super(root, 'RUNWAY_POINTS', RunwayPointsAbi__factory)
    makeObservable(this, {
      approve: action.bound,
    })
  }

  allowance(...params: Parameters<Allowance>): ContractReturn<Allowance> {
    return this.call<Allowance>('allowance', params)
  }

  balanceOf(...params: Parameters<BalanceOf>): ContractReturn<BalanceOf> {
    return this.call<BalanceOf>('balanceOf', params)
  }

  approve(...params: Parameters<Approve>): Promise<SendTransactionReturn> {
    return this.sendTransaction('approve', params)
  }

  get balance(): number | undefined {
    const { address } = this.root.web3Store
    if (address === undefined) return undefined
    const rawBalance = this.balanceOf(address)
    if (!rawBalance) return undefined
    return +ethers.utils.formatEther(rawBalance[0])
  }
}
