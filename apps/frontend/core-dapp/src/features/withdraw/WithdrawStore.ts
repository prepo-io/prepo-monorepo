import { BigNumber } from 'ethers'
import { parseEther } from 'ethers/lib/utils'
import { makeAutoObservable } from 'mobx'
import { FEE_DENOMINATOR } from '../../lib/constants'
import { RootStore } from '../../stores/RootStore'
import { getContractCall, transformBigNumber } from '../../stores/utils/web3-store-utils'
import { normalizeDecimalPrecision, validateNumber } from '../../utils/number-utils'

export class WithdrawStore {
  donationPercentage: number
  withdrawalAmount = 0

  constructor(public root: RootStore) {
    this.donationPercentage = 0
    makeAutoObservable(this, {}, { autoBind: true })
  }

  setDonationPercentage(percentage: number): void {
    this.donationPercentage = percentage
  }

  setWithdrawalAmount(amount: number | string): void {
    this.withdrawalAmount = validateNumber(amount)
  }

  // eslint-disable-next-line require-await
  async withdraw(amount: number): Promise<{
    success: boolean
    error?: string | undefined
  }> {
    const { preCTTokenStore } = this.root
    const amountToWithdraw = preCTTokenStore.parseUnits(`${amount}`)
    return amountToWithdraw ? preCTTokenStore.withdraw(amountToWithdraw) : { success: false }
  }

  get donationAmount(): number {
    return (this.withdrawalAmount * this.donationPercentage) / 100
  }

  get withdrawalDisabled(): boolean {
    const { preCTTokenStore } = this.root
    const withdrawalAmountBigNumber = preCTTokenStore.parseUnits(`${this.withdrawalAmount}`)
    if (!this.withdrawalMaxAmount || !withdrawalAmountBigNumber || this.withdrawalAmount === 0)
      return true

    return withdrawalAmountBigNumber?.gt(this.withdrawalMaxAmount)
  }

  get withdrawalFees(): BigNumber {
    const { redemptionFee } = this.root.preCTTokenStore
    return parseEther(`${this.withdrawalAmount}`)
      .mul(redemptionFee || 0)
      .div(FEE_DENOMINATOR)
  }

  get withdrawalMaxAmount(): BigNumber | undefined {
    const { tokenBalanceRaw } = this.root.preCTTokenStore
    return tokenBalanceRaw
  }

  get withdrawalMaxAmountString(): string | undefined {
    const { preCTTokenStore } = this.root
    return this.withdrawalMaxAmount
      ? normalizeDecimalPrecision(preCTTokenStore.formatUnits(this.withdrawalMaxAmount))
      : undefined
  }

  get withdrawalReceivedAmount(): string | undefined {
    const { preCTTokenStore } = this.root
    const { redemptionFee } = preCTTokenStore
    const sharesForAmount = transformBigNumber(
      preCTTokenStore.getSharesForAmount(parseEther(`${this.withdrawalAmount}`))
    )
    if (sharesForAmount === undefined || redemptionFee === undefined) return undefined
    const amountForShares = getContractCall(
      preCTTokenStore.getAmountForShares(parseEther(`${sharesForAmount}`))
    )

    if (amountForShares === undefined) return undefined
    const donationAmountBigNumber = parseEther(`${this.donationAmount}`)
    const amountBeforeFee = amountForShares.sub(donationAmountBigNumber)
    return preCTTokenStore.formatUnits(amountBeforeFee.sub(this.withdrawalFees))
  }

  get withdrawUILoading(): boolean {
    const { withdrawing } = this.root.preCTTokenStore
    return withdrawing || this.withdrawalReceivedAmount === undefined
  }
}
