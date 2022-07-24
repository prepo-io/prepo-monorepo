import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { BigNumber } from 'ethers'
import { makeAutoObservable } from 'mobx'
import { TRANSACTION_SETTING } from '../../../lib/constants'
import { RootStore } from '../../../stores/RootStore'
import { validateNumber } from '../../../utils/number-utils'

const FEE_MOCK = 7.5

export class UnstakeStore {
  confirm = false
  currentUnstakingValue = TRANSACTION_SETTING.DEFAULT_AMOUNT
  fee = FEE_MOCK

  get isCurrentUnstakingValueValid(): boolean {
    const stakedPPO = this.root.ppoStakingStore.balanceData?.raw
    if (!stakedPPO) return false
    return (
      BigNumber.from(stakedPPO).toNumber() >= this.currentUnstakingValue &&
      this.currentUnstakingValue !== 0
    )
  }

  constructor(private root: RootStore) {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  setConfirm({ target: { checked } }: CheckboxChangeEvent): void {
    this.confirm = checked
  }

  setCurrentUnstakingValue(value: number | string): void {
    this.currentUnstakingValue = validateNumber(+value) // TODO: compare with staked value from SC
  }

  startCooldown(): Promise<{
    success: boolean
    error?: string | undefined
  }> {
    const balance = this.getBalance()
    if (this.currentUnstakingValue > balance) {
      return Promise.resolve({ success: false })
    }
    return this.root.ppoStakingStore.startCooldown(this.currentUnstakingValue)
  }

  private getBalance(): number {
    const raw = this.root.ppoStakingStore.balanceData?.raw
    return raw ? BigNumber.from(raw).toNumber() : 0
  }

  withdraw = (
    immediate: boolean
  ): Promise<{
    success: boolean
    error?: string | undefined
  }> => this.root.ppoStakingStore.withdraw(this.currentUnstakingValue, immediate)
}
