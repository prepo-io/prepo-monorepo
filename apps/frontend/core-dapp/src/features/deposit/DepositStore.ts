import { BigNumber } from 'ethers'
import { makeAutoObservable } from 'mobx'
import { RootStore } from '../../stores/RootStore'
import { normalizeDecimalPrecision } from '../../utils/number-utils'

export class DepositStore {
  depositAmount = 0

  constructor(public root: RootStore) {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  setDepositAmount(amount: number | string): void {
    this.depositAmount = +amount
  }

  // eslint-disable-next-line require-await
  async deposit(amount: number): Promise<{
    success: boolean
    error?: string | undefined
  }> {
    const { baseTokenStore } = this.root
    const { deposit } = this.root.preCTTokenStore
    const depositAmount = baseTokenStore.parseUnits(`${amount}`)
    if (depositAmount) {
      return deposit(depositAmount)
    }
    return { success: false, error: 'Invalid deposit amount' }
  }

  get depositDisabled(): boolean {
    const { baseTokenStore } = this.root
    const depositAmountBigNumber = baseTokenStore.parseUnits(`${this.depositAmount}`)
    if (depositAmountBigNumber && this.depositMaxAmount) {
      return depositAmountBigNumber.gt(this.depositMaxAmount)
    }
    return false
  }

  get depositMaxAmount(): BigNumber | undefined {
    const { tokenBalanceRaw } = this.root.baseTokenStore
    return tokenBalanceRaw
  }

  get depositMaxAmountString(): string | undefined {
    const { baseTokenStore } = this.root
    return this.depositMaxAmount
      ? normalizeDecimalPrecision(baseTokenStore.formatUnits(this.depositMaxAmount))
      : undefined
  }
}
