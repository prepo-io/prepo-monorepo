import { makeObservable, observable, runInAction, computed, action } from 'mobx'
import { BigNumber, utils } from 'ethers'
import { parseEther } from 'ethers/lib/utils'
import { UNLIMITED_AMOUNT_APPROVAL } from 'prepo-constants'
import { ContractReturn, ContractStore, Factory } from '@prepo-io/stores'
import { RootStore } from '../RootStore'
import { SupportedContracts, SupportedContractsNames } from '../../lib/contract.types'
import { Erc20Abi, Erc20Abi__factory } from '../../../generated/typechain'
import { balanceToNumber, normalizeDecimalPrecision } from '../../utils/number-utils'
import { supportedContracts } from '../../lib/supported-contracts'

type TokenSymbol = Erc20Abi['functions']['symbol']
type BalanceOf = Erc20Abi['functions']['balanceOf']
type Decimals = Erc20Abi['functions']['decimals']
type Allowance = Erc20Abi['functions']['allowance']
type Approve = Erc20Abi['functions']['approve']
type Transfer = Erc20Abi['functions']['transfer']

type Constructor = {
  root: RootStore
  tokenName: SupportedContractsNames
  symbolOverride?: string
  factory?: Factory
}

export class Erc20Store extends ContractStore<RootStore, SupportedContracts> {
  approving = false
  checkingForAllowance = true
  symbolOverride?: string
  transferHash: string | undefined
  transferring = false

  constructor({ root, tokenName, symbolOverride, factory }: Constructor) {
    super(root, tokenName, factory ?? (Erc20Abi__factory as unknown as Factory))
    if (symbolOverride) this.symbolOverride = symbolOverride
    makeObservable(this, {
      allowance: observable,
      approve: action.bound,
      approving: observable,
      balanceOf: observable,
      balanceOfSigner: computed,
      checkingForAllowance: observable,
      decimals: observable,
      decimalsNumber: computed,
      needsToAllowTokens: observable,
      signerAllowance: observable,
      signerNeedsMoreTokens: observable,
      symbol: observable,
      transfer: action.bound,
      transferHash: observable,
      transferring: observable,
      unlockPermanently: action.bound,
      unlockThisTimeOnly: action.bound,
      formatUnits: observable,
      parseUnits: observable,
    })
  }

  // contract read methods

  allowance(...params: Parameters<Allowance>): ContractReturn<Allowance> {
    return this.call<Allowance>('allowance', params)
  }

  balanceOf(...params: Parameters<BalanceOf>): ContractReturn<BalanceOf> {
    return this.call<BalanceOf>('balanceOf', params)
  }

  decimals(): ContractReturn<Decimals> {
    return this.call<Decimals>('decimals', [], { subscribe: false })
  }

  symbol(): ContractReturn<TokenSymbol> {
    return this.call<TokenSymbol>('symbol', [], { subscribe: false })
  }

  // contract write methods

  async approve(...params: Parameters<Approve>): Promise<boolean> {
    try {
      this.approving = true
      const { wait } = await this.sendTransaction<Approve>('approve', params)
      await wait()
      return true
    } catch (e: unknown) {
      this.root.toastStore.errorToast('Approval error', e)
      return false
    } finally {
      runInAction(() => {
        this.approving = false
      })
    }
  }

  async transfer(...params: Parameters<Transfer>): Promise<boolean> {
    try {
      this.transferring = true
      this.transferHash = undefined
      const { hash, wait } = await this.sendTransaction<Transfer>('transfer', params)
      runInAction(() => {
        this.transferHash = hash
      })
      await wait()
      return true
    } catch (error) {
      this.root.toastStore.errorToast(`Error calling transfer`, error)
      return false
    } finally {
      runInAction(() => {
        this.transferring = false
      })
    }
  }

  async unlockPermanently(
    spenderContractName: SupportedContractsNames = 'UNISWAP_SWAP_ROUTER',
    notification: string | undefined = undefined
  ): Promise<void> {
    const contractAddresses = supportedContracts[spenderContractName]
    if (!contractAddresses) {
      this.root.captureError(new Error(`Contract address not found for ${spenderContractName}`))
      this.root.toastStore.errorToast(
        'Failed to unlock token.',
        new Error('Something went wrong. Please try again later.')
      )
      return
    }

    const approved = await this.approve(
      contractAddresses[this.root.web3Store.network.name] ?? '',
      UNLIMITED_AMOUNT_APPROVAL
    )
    if (approved) {
      this.root.toastStore.successToast(
        notification ?? `Approved ${this.symbolOverride} permanently.`
      )
    }
  }

  async unlockThisTimeOnly(
    amount: number,
    spenderContractName: SupportedContractsNames = 'UNISWAP_SWAP_ROUTER',
    notification: string | undefined = undefined
  ): Promise<void> {
    const contractAddresses = supportedContracts[spenderContractName]
    if (!contractAddresses) {
      this.root.captureError(new Error(`Contract address not found for ${spenderContractName}`))
      this.root.toastStore.errorToast(
        'Failed to unlock token.',
        new Error('Something went wrong. Please try again later.')
      )
      return
    }
    const approved = await this.approve(
      contractAddresses[this.root.web3Store.network.name] ?? '',
      parseEther(`${amount}`)
    )
    if (approved) {
      this.root.toastStore.successToast(
        notification ?? `Approved ${amount} ${this.symbolOverride}.`
      )
    }
  }

  get balanceOfSigner(): BigNumber | undefined {
    const { address } = this.root.web3Store.signerState
    if (!address) return undefined
    const balanceRes = this.balanceOf(address)
    if (balanceRes === undefined) return undefined
    const [balance] = balanceRes
    return balance
  }

  get decimalsNumber(): number | undefined {
    const { address } = this.root.web3Store.signerState
    if (!address) return undefined
    const decimalsRes = this.decimals()
    if (decimalsRes === undefined) return undefined
    const [decimals] = decimalsRes
    return decimals
  }

  get decimalsString(): string | undefined {
    const decimalsRes = this.decimals()
    if (decimalsRes === undefined) return undefined
    const [decimals] = decimalsRes
    return decimals.toString()
  }

  get symbolString(): string | undefined {
    const symbolRes = this.symbol()
    if (symbolRes === undefined) return undefined
    return symbolRes[0]
  }

  // we should return undefined when data is not available
  // so we can at least handle loading state instead of showing 0
  // which can be inaccurate information
  /**
   * Old way of getting tokenBalance as number
   * This should be migrated to use tokenBalanceRaw
   * @deprecated since tokenBalanceRaw is introduced
   */
  get tokenBalance(): number | undefined {
    return this.balanceOfSigner ? balanceToNumber(this.balanceOfSigner) : undefined
  }
  get tokenBalanceRaw(): BigNumber | undefined {
    return this.balanceOfSigner ? this.balanceOfSigner : undefined
  }

  /**
   * Returns the tokenBalance as string
   * Decimal precision will be normalized with the amount configured in the application
   * @returns string
   */
  get tokenBalanceFormat(): string | undefined {
    return this.tokenBalanceRaw && this.formatUnits(this.tokenBalanceRaw)
      ? normalizeDecimalPrecision(this.formatUnits(this.tokenBalanceRaw))
      : undefined
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

  needToAllowFor(
    amount: number | undefined,
    spenderContractName: SupportedContractsNames = 'UNISWAP_SWAP_ROUTER'
  ): boolean | undefined {
    const contractAddresses = supportedContracts[spenderContractName]
    if (!contractAddresses) return undefined
    return this.needsToAllowTokens(
      contractAddresses[this.root.web3Store.network.name],
      parseEther(`${amount}`)
    )
  }

  signerAllowance(spenderAddress: string): BigNumber | undefined {
    this.checkingForAllowance = true
    const { address: signerAddress } = this.root.web3Store.signerState
    if (!signerAddress) return undefined
    const allowanceRes = this.allowance(signerAddress, spenderAddress)
    if (allowanceRes === undefined) return undefined
    const [allowance] = allowanceRes
    this.checkingForAllowance = false
    return allowance
  }

  signerNeedsMoreTokens(amount: BigNumber | undefined): boolean | undefined {
    if (!amount) return undefined
    if (!this.balanceOfSigner) return undefined
    return this.balanceOfSigner?.lt(amount)
  }

  formatUnits(value: BigNumber): string | undefined {
    const decimalsCall = this.decimals()
    if (decimalsCall === undefined) return undefined
    const [decimals] = decimalsCall
    return utils.formatUnits(value.toString(), decimals)
  }

  parseUnits(value: string): BigNumber | undefined {
    const decimalsCall = this.decimals()
    if (decimalsCall === undefined) return undefined
    const [decimals] = decimalsCall
    return utils.parseUnits(value, decimals)
  }
}
