import { runInAction, makeAutoObservable, autorun } from 'mobx'
import Onboard from 'bnc-onboard'
import { BigNumber, ethers } from 'ethers'
// eslint-disable-next-line import/no-unresolved
import { API as OnboardType } from 'bnc-onboard/dist/src/interfaces'
import { RootStore } from './RootStore'
import { createFallbackProvider, getOnboardConfig } from './utils/web3-store-utils'
import { TransactionReceipt } from './utils/class-utils'
import { Network, DEFAULT_NETWORK, IS_BROWSER } from '../lib/constants'

export type SignerState = {
  address: string | undefined
  balance: BigNumber | undefined
}

export class Web3Store {
  root: RootStore
  network: Network = DEFAULT_NETWORK
  blockNumber: number | undefined = undefined
  coreProvider = createFallbackProvider(DEFAULT_NETWORK)
  signer: ethers.providers.JsonRpcSigner | undefined = undefined
  signerState: SignerState = {
    address: undefined,
    balance: undefined,
  }
  onboard: OnboardType | undefined = undefined

  constructor(root: RootStore) {
    this.root = root
    makeAutoObservable(this, {}, { autoBind: true })

    this.init()
  }

  init(): void {
    if (!IS_BROWSER) return

    // If user has connected before, connect to their previous wallet
    const previouslySelectedWallet = window.localStorage.getItem('selectedWallet')
    if (previouslySelectedWallet) {
      this.connect(previouslySelectedWallet)
    }

    // Init event listeners
    this.coreProvider.on('block', this.handleNewBlock.bind(this))

    // Refetch state immediately when tab switches from inactive to active
    // (check multicallStore exists so we don't exec this on mount)
    autorun(() => {
      if (!this.root.browserStore.tabIsInactive && this.root.multicallStore) {
        this.refreshChainState()
      }
    })
  }

  handleNewBlock(n: number): void {
    if (this.root.browserStore.tabIsInactive) return
    try {
      this.blockNumber = n
      this.refreshChainState()
    } catch (error) {
      this.root.uiStore.errorToast('Error handling new block', error)
    }
  }

  wait(hash: string): Promise<TransactionReceipt> {
    return this.coreProvider.waitForTransaction(hash)
  }

  refreshChainState(): void {
    this.refreshSignerBalance()
    this.root.multicallStore.call()
  }

  async refreshSignerBalance(): Promise<void> {
    try {
      if (!this.signerState.address) return
      const balance = await this.coreProvider.getBalance(this.signerState.address)
      runInAction(() => {
        this.signerState.balance = balance
      })
    } catch (error) {
      this.root.uiStore.errorToast('Error refreshing wallet balance', error)
    }
  }

  async refreshSignerAddress(): Promise<void> {
    try {
      if (!this.signer) return
      const address = await this.signer.getAddress()
      runInAction(() => {
        this.signerState.address = address
      })
    } catch (error) {
      window.localStorage.removeItem('selectedWallet')
      this.root.uiStore.errorToast('Error fetching signer address', error)
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
            this.refreshSignerBalance()
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
        this.root.uiStore.errorToast(
          'Wallet connection cancelled',
          Error(`Something went wrong connecting ${state.wallet.name}`)
        )
        this.disconnect()
        return
      }

      // Onboard wallet connection successful
      window.localStorage.setItem('selectedWallet', state.wallet.name)
      runInAction(() => {
        this.onboard = onboard
      })
      const { provider } = state.wallet
      const signer = new ethers.providers.Web3Provider(provider).getSigner()
      runInAction(async () => {
        this.signer = signer
        await this.refreshSignerAddress()
        this.refreshSignerBalance()
      })
    } catch (error) {
      window.localStorage.removeItem('selectedWallet')
      this.root.uiStore.errorToast('Error connecting wallet', error)
    }
  }

  disconnect(): void {
    this.signer = undefined
    this.signerState = {
      address: undefined,
      balance: undefined,
    }
    window.localStorage.removeItem('selectedWallet')
  }

  checkSigner(): Promise<boolean | void> {
    if (!this.onboard) return Promise.resolve()
    const { network } = this.onboard.getState()
    if (network !== DEFAULT_NETWORK.chainId) {
      return this.onboard.walletCheck()
    }
    return Promise.resolve()
  }

  get address(): string | undefined {
    return this.signerState.address
  }

  get connected(): boolean {
    return Boolean(this.signerState.address)
  }

  get formattedBalance(): string {
    return ethers.utils.formatEther(this.signerState.balance || 0)
  }

  get wrongNetwork(): boolean {
    return DEFAULT_NETWORK.chainId !== this.network.chainId
  }
}
