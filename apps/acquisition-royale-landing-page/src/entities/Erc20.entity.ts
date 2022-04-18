import { autorun, makeAutoObservable, runInAction } from 'mobx'
import { BigNumber, providers } from 'ethers'
import { Erc20Abi, Erc20Abi__factory } from '../../generated/typechain'
import { getExternalContractAddress, SupportedTokensContracts } from '../lib/external-contracts'
import { RootStore } from '../stores/RootStore'
import {
  fetch,
  ContractStore,
  ContractReturnType,
  ContractGetterReturnType,
} from '../stores/utils/class-utils'
import { handleError } from '../utils/exception-handling'
import { PartnertshipTokensContracts } from '../features/partnership-purchase/partnertship-contracts'

type TokenSymbol = Erc20Abi['functions']['symbol']
type BalanceOf = Erc20Abi['functions']['balanceOf']
type Decimals = Erc20Abi['functions']['decimals']
type Allowance = Erc20Abi['functions']['allowance']

type Functions = keyof Erc20Abi['functions']
type Storage = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key in Functions]?: any
}

export class Erc20Entity implements ContractStore {
  root: RootStore
  reference: string
  address?: string
  contract?: Erc20Abi
  approving = false
  abi = Erc20Abi__factory.abi
  storage: Storage = {}
  symbolOverride?: string

  constructor(root: RootStore, reference: string) {
    this.root = root
    this.reference = reference
    makeAutoObservable(this, { abi: false })
  }

  initContract(
    tokenContract: SupportedTokensContracts | PartnertshipTokensContracts,
    symbolOverride?: string
  ): void {
    if (symbolOverride) this.symbolOverride = symbolOverride

    autorun(() => {
      const network = this.root.web3Store.network.name
      const address = getExternalContractAddress(tokenContract, network)
      if (typeof address === 'undefined')
        throw Error(`no address for ${this.reference} on ${network}`)
      runInAction(() => {
        this.address = address
        this.contract = Erc20Abi__factory.connect(this.address, this.root.web3Store.coreProvider)
      })
    })
  }

  // Checks the signer wallet, then creates a writable contract hooked up with it
  async createWriteContract(): Promise<Erc20Abi> {
    await this.root.web3Store.checkSigner()
    const writeContract = Erc20Abi__factory.connect(
      this.address as string,
      this.root.web3Store.signer as providers.JsonRpcSigner
    )
    return writeContract
  }

  allowance(
    tokenOwnerAddress: string,
    spenderContractAddress: string
  ): ContractGetterReturnType<Allowance> {
    return fetch<Parameters<Allowance>, ContractReturnType<Allowance>>(this, 'allowance', [
      tokenOwnerAddress,
      spenderContractAddress,
    ])
  }

  symbol(): ContractGetterReturnType<TokenSymbol> {
    if (this.symbolOverride) return [false, this.symbolOverride]
    return fetch<Parameters<TokenSymbol>, ContractReturnType<TokenSymbol>>(this, 'symbol', [], {
      subscribe: false,
    })
  }

  balanceOf(address: string): ContractGetterReturnType<BalanceOf> {
    return fetch<Parameters<BalanceOf>, ContractReturnType<BalanceOf>>(this, 'balanceOf', [address])
  }

  decimals(): ContractGetterReturnType<Decimals> {
    return fetch<Parameters<Decimals>, ContractReturnType<Decimals>>(this, 'decimals', [], {
      subscribe: false,
    })
  }

  signerAllowance(spenderAddress: string): BigNumber | undefined {
    const { address: signerAddress } = this.root.web3Store.signerState
    if (!signerAddress) return undefined
    const [loading, result] = this.allowance(signerAddress, spenderAddress)
    if (loading === undefined || result === undefined) return undefined
    return result
  }

  get balanceOfSigner(): BigNumber | undefined {
    const { address } = this.root.web3Store.signerState
    if (!address) return undefined
    const [loading, result] = this.balanceOf(address)
    if (loading === undefined || result === undefined) return undefined
    return result
  }

  async approve(address: string, amount: string): Promise<void> {
    const writeContract = await this.createWriteContract()
    try {
      // Safe gas overrides (in boilerplate will abstract this)
      const gasEstimate = await writeContract.estimateGas.approve(address, amount)
      const options: { gasLimit: BigNumber; gasPrice?: BigNumber } = {
        gasLimit: gasEstimate.mul(2),
      }
      if (this.root.web3Store.network.gasPrice !== undefined)
        options.gasPrice = this.root.web3Store.network.gasPrice

      const tx = await writeContract.approve(address, amount, options)
      runInAction(() => {
        this.approving = true
      })
      await this.root.web3Store.coreProvider.waitForTransaction(tx.hash)
    } catch (e) {
      handleError('approve', e)
    } finally {
      runInAction(() => {
        this.approving = false
      })
    }
  }

  needsToAllowTokens(
    address: string | undefined,
    amount: BigNumber | undefined
  ): boolean | undefined {
    if (!amount) return undefined
    if (!address) return undefined
    const allowance = this.signerAllowance(address)
    if (allowance === undefined || amount === undefined) return undefined
    return allowance.lt(amount)
  }

  signerNeedsMoreTokens(amount: BigNumber | undefined): boolean | undefined {
    if (!amount) return undefined
    if (!this.balanceOfSigner) return undefined
    return this.balanceOfSigner?.lt(amount)
  }

  get decimalsNumber(): number | undefined {
    const { address } = this.root.web3Store.signerState
    if (!address) return undefined
    const [loading, result] = this.decimals()
    if (loading === undefined || result === undefined) return undefined
    return result
  }
}
