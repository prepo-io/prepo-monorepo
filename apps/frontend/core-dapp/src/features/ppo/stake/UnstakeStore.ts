import { CheckboxChangeEvent } from 'antd/lib/checkbox'
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
    return Boolean(this.currentUnstakingValue) // TODO: add staked value check
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

  withdraw(): void {
    console.log(this)
  }
}
