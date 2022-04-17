import { runInAction, makeAutoObservable } from 'mobx'
import Onboard from 'bnc-onboard'
import { BigNumber, providers } from 'ethers'
// eslint-disable-next-line import/no-unresolved
import { API as OnboardType } from 'bnc-onboard/dist/src/interfaces'
import { RootStore } from './RootStore'
import { createFallbackProvider, getOnboardConfig } from './utils/web3-store-utils'
import { isBrowser, MINIMUM_BALANCE, Network, NETWORKS } from '../lib/constants'
import config from '../lib/config'
import { SupportedExternalContractsNames } from '../lib/contract.types'
import { handleError } from '../utils/exception-handling'
import { externalContracts } from '../lib/external-contracts'

type SignerState = {
  address: string | undefined
  balance: BigNumber | undefined
}

export class Web3Store {
  root: RootStore
  network: Network = NETWORKS[config.NETWORK]
  blockNumber: number | undefined = undefined
  coreProvider = createFallbackProvider(NETWORKS[config.NETWORK])
  signer: providers.JsonRpcSigner | undefined = undefined
  signerState: SignerState = {
    address: undefined,
    balance: undefined,
  }
  onboard: OnboardType | undefined = undefined

  constructor(root: RootStore) {
    this.root = root
    makeAutoObservable(this)

    this.init()
  }

  init(): void {
    if (!isBrowser) return
    const previouslySelectedWallet = window.localStorage.getItem('selectedWallet')
    if (previouslySelectedWallet) {
      this.connect(previouslySelectedWallet)
    }
    this.coreProvider.on('block', this.handleNewBlock.bind(this))
  }

  handleNewBlock(n: number): void {
    try {
      this.blockNumber = n
      // Refresh any block-specific values below
      this.refreshSignerBalance()
      this.root.multicallStore.call()
    } catch (error) {
      handleError('Error handling new block', error)
    }
  }

  getContractAddress = (contract: SupportedExternalContractsNames): string | undefined => {
    const externalContract = externalContracts[contract]
    if (externalContract) {
      return externalContract[this.network.name]
    }
    return undefined
  }

  get lowBalance(): boolean | undefined {
    if (this.signerState.balance === undefined) return undefined
    return this.signerState.balance.lte(MINIMUM_BALANCE)
  }

  async refreshSignerBalance(): Promise<void> {
    try {
      if (!this.signerState.address) return
      const balance = await this.coreProvider.getBalance(this.signerState.address)
      runInAction(() => {
        this.signerState.balance = balance
      })
    } catch (error) {
      handleError('Error refreshing wallet balance', error)
    }
  }

  checkSigner(): Promise<boolean | void> {
    if (!this.onboard) return Promise.resolve()
    const { network } = this.onboard.getState()
    if (network !== NETWORKS[config.NETWORK].chainId) {
      return this.onboard.walletCheck()
    }
    return Promise.resolve()
  }

  async refreshSignerAddress(): Promise<void> {
    try {
      if (!this.signer) return
      const address = await this.signer.getAddress()
      runInAction(() => {
        this.signerState.address = address
      })
      this.refreshSignerBalance()
    } catch (error) {
      window.localStorage.removeItem('selectedWallet')
      handleError('Error fetching signer address', error)
    }
  }

  async connect(walletName?: string): Promise<void> {
    try {
      if (this.onboard) this.onboard = undefined

      // Create new onboard instance with desired config
      const onboard = Onboard({
        subscriptions: {
          address: () => {
            this.refreshSignerAddress()
          },
        },
        ...getOnboardConfig(this.network.chainId),
      })
      if (walletName) {
        await onboard.walletSelect(walletName)
      } else {
        await onboard.walletSelect()
      }
      let state = onboard.getState()
      if (!state.wallet.name) {
        // User exited wallet selection
        this.disconnect()
        return
      }
      await onboard.walletCheck()
      state = onboard.getState()
      if (!state.address || !state.wallet.name) {
        // Something went wrong connecting the wallet
        handleError('Wallet connection cancelled', new Error('cancelled'))
        this.disconnect()
        return
      }

      // Onboard wallet connection successful
      runInAction(() => {
        this.onboard = onboard
      })
      const { provider } = state.wallet
      const signer = new providers.Web3Provider(provider).getSigner()

      runInAction(async () => {
        this.signer = signer
        await this.refreshSignerAddress()
        this.refreshSignerBalance()
      })
    } catch (error) {
      window.localStorage.removeItem('selectedWallet')
      handleError('Error connecting wallet', error)
    }
  }

  setNetwork(network: Network): void {
    const sameNetwork = network.chainId === this.network.chainId
    if (sameNetwork) return
    this.disconnect()
    this.network = network
    this.coreProvider = createFallbackProvider(network)
    this.init()
  }

  disconnect(): void {
    this.signer = undefined
    this.signerState = {
      address: undefined,
      balance: undefined,
    }
    window.localStorage.removeItem('selectedWallet')
  }
}
