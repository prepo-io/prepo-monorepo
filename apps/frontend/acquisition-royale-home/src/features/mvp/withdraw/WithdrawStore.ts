import { ButtonProps } from 'antd'
import { makeAutoObservable } from 'mobx'
import { RootStore } from '../../../stores/RootStore'
import {
  INSUFFICIENT_RP,
  LOADING,
  makeRPComparison,
  makeRPCostBalance,
  WALLET_BALANCE,
} from '../../../utils/common-utils'
import { CostBalance } from '../ActionCard'
import { ComparisonProps } from '../StatsComparison'

export class WithdrawStore {
  constructor(public root: RootStore) {
    makeAutoObservable(this)
  }

  get withdrawButtonProps(): ButtonProps {
    const { balance } = this.root.runwayPointsContractStore
    const { signerActiveEnterprise, signerEnterprises } = this.root.signerStore
    const { withdrawAmount } = this.root.acquisitionRoyaleContractStore
    if (signerEnterprises && signerEnterprises.length === 0) {
      return { disabled: true, children: 'No owned Enterprise' }
    }
    if (!signerActiveEnterprise || balance === undefined) {
      return LOADING
    }
    if (!withdrawAmount) {
      return { disabled: true, children: 'Enter withdrawal amount' }
    }
    if (+withdrawAmount > signerActiveEnterprise.stats.rp) {
      return { disabled: true, children: INSUFFICIENT_RP }
    }
    return {
      children: `Withdraw ${withdrawAmount} RP from ${signerActiveEnterprise.name}`,
    }
  }

  get withdrawBalances(): CostBalance[] {
    const { signerActiveEnterprise } = this.root.signerStore
    return [makeRPCostBalance(signerActiveEnterprise?.stats.rp || 0)]
  }

  get withdrawComparisons(): ComparisonProps[] | undefined {
    const { balance } = this.root.runwayPointsContractStore
    const { signerActiveEnterprise } = this.root.signerStore
    const { withdrawAmount, withdrawalBurnPercentage } = this.root.acquisitionRoyaleContractStore
    if (
      !signerActiveEnterprise ||
      withdrawAmount === '' ||
      balance === undefined ||
      withdrawalBurnPercentage === undefined
    )
      return undefined

    const { rp } = signerActiveEnterprise.stats
    const newRp = rp - +withdrawAmount
    const newBalance = balance + +withdrawAmount * (1 - withdrawalBurnPercentage)

    return [
      {
        id: signerActiveEnterprise?.id,
        name: signerActiveEnterprise.name,
        stats: [makeRPComparison(newRp, rp)],
      },
      {
        // only purpose of this id is to provide a unique key to map
        // it can be any value as long as not conflicting with other values in this list
        id: signerActiveEnterprise?.id === 0 ? 1 : 0,
        name: WALLET_BALANCE,
        stats: [makeRPComparison(newBalance, balance)],
      },
    ]
  }
}
