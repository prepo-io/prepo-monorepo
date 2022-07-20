import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { TRANSACTION_SETTING } from '../../../lib/constants'
import { RootStore } from '../../../stores/RootStore'
import { validateNumber } from '../../../utils/number-utils'

export class StakeStore {
  currentStakingValue = TRANSACTION_SETTING.DEFAULT_AMOUNT
  showDelegate = true

  constructor(private root: RootStore) {
    makeAutoObservable(this, {}, { autoBind: true })
    this.subscribe()
  }

  get isCurrentStakingValueValid(): boolean {
    const balance = this.root.ppoTokenStore.tokenBalanceRaw ?? 0
    return Boolean(this.currentStakingValue) && this.currentStakingValue <= balance
  }

  setCurrentStakingValue(value?: number | string): void {
    this.currentStakingValue = validateNumber(value)
  }

  onDelegateShowChange(show: boolean): void {
    this.showDelegate = show
  }

  stake(): Promise<{
    success: boolean
    error?: string | undefined
  }> {
    const balance = this.getBalance()
    if (this.currentStakingValue > balance) {
      return Promise.resolve({ success: false })
    }
    return this.root.ppoStakingStore.stake(this.currentStakingValue)
  }

  private getBalance(): number {
    return this.root.ppoTokenStore?.tokenBalance ?? 0
  }

  private subscribe(): void {
    reaction(
      () => this.root.delegateStore.selectedDelegate,
      (delegate) => {
        runInAction(() => {
          if (!delegate) {
            this.showDelegate = false
          }
        })
      }
    )
  }
}
