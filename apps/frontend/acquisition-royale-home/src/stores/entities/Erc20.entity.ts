/* eslint-disable no-console */
import { action, makeObservable, observable, runInAction, computed } from 'mobx'
import { utils } from 'ethers'
import { ContractStore, Factory } from '@prepo-io/stores'
import { RootStore } from '../RootStore'
import { ContractReturn } from '../utils/class-utils'
import {
  getContractAddress,
  SupportedContracts,
  SupportedErc20Token,
} from '../../lib/supported-contracts'
import { Erc20Abi, Erc20Abi__factory } from '../../../generated'

type TokenSymbol = Erc20Abi['functions']['symbol']
type BalanceOf = Erc20Abi['functions']['balanceOf']
type Decimals = Erc20Abi['functions']['decimals']
type Allowance = Erc20Abi['functions']['allowance']
type Approve = Erc20Abi['functions']['approve']
type Transfer = Erc20Abi['functions']['transfer']

export class Erc20Store extends ContractStore<RootStore, SupportedContracts> {
  transferring = false
  transferHash: string | undefined
  approving = false
  symbolOverride?: string

  constructor(root: RootStore, tokenName: SupportedErc20Token, symbolOverride?: string) {
    super(root, tokenName, Erc20Abi__factory as unknown as Factory)
    if (symbolOverride) this.symbolOverride = symbolOverride
    makeObservable(this, {
      transferring: observable,
      transferHash: observable,
      approving: observable,
      initContract: action,
      symbol: observable,
      decimals: observable,
      allowance: observable,
      balanceOf: observable,
      approve: observable,
      formattedSignerBalance: computed,
      transfer: observable,
    })
    this.initContract(tokenName)
  }

  initContract(tokenName: SupportedErc20Token): void {
    const network = this.root.web3Store.network.name
    const address = getContractAddress(tokenName, network)
    if (typeof address === 'undefined') throw Error(`no address set for ${tokenName} on ${network}`)
    this.address = address
    this.contract = this.factory.connect(this.address, this.root.web3Store.coreProvider)
  }

  symbol(): ContractReturn<TokenSymbol> {
    return this.call<TokenSymbol>('symbol', [], { subscribe: false })
  }

  decimals(): ContractReturn<Decimals> {
    return this.call<Decimals>('decimals', [], { subscribe: false })
  }

  allowance(...params: Parameters<Allowance>): ContractReturn<Allowance> {
    return this.call<Allowance>('allowance', params)
  }

  balanceOf(...params: Parameters<BalanceOf>): ContractReturn<BalanceOf> {
    return this.call<BalanceOf>('balanceOf', params)
  }

  async transfer(...params: Parameters<Transfer>): Promise<boolean> {
    try {
      runInAction(() => {
        this.transferring = true
      })
      const { hash, wait } = await this.sendTransaction<Transfer>('transfer', params)
      runInAction(() => {
        this.transferHash = hash
      })
      await wait()
      return true
    } catch (error) {
      this.root.uiStore.errorToast(`Error calling transfer`, error)
      return false
    } finally {
      runInAction(() => {
        this.transferring = false
      })
    }
  }

  get symbolString(): string | undefined {
    const symbolRes = this.symbol()
    if (symbolRes === undefined) return undefined
    return symbolRes[0]
  }

  get decimalsString(): string | undefined {
    const decimalsRes = this.decimals()
    if (decimalsRes === undefined) return undefined
    return decimalsRes[0].toString()
  }

  get formattedSignerBalance(): string | undefined {
    const { address } = this.root.web3Store.signerState
    if (!address) return undefined
    const decimalsRes = this.decimals()
    const balanceRes = this.balanceOf(address)
    if (decimalsRes === undefined || balanceRes === undefined) return undefined
    const [decimals] = decimalsRes
    const [balance] = balanceRes
    return utils.formatUnits(balance, decimals)
  }

  async approve(...params: Parameters<Approve>): Promise<void> {
    try {
      runInAction(() => {
        this.approving = true
      })
      const { wait } = await this.sendTransaction<Approve>('approve', params)
      await wait()
    } catch (e) {
      this.root.uiStore.errorToast('Approval error', e)
    } finally {
      runInAction(() => {
        this.approving = false
      })
    }
  }
}
