import { ButtonProps } from 'antd'
import { makeAutoObservable } from 'mobx'
import { RootStore } from '../../../stores/RootStore'
import {
  INSUFFICIENT_RP,
  LOADING,
  makeMoatGainMessage,
  makeMoatRecoverMessage,
  makeRPComparison,
  makeRPCostBalance,
} from '../../../utils/common-utils'
import { CostBalance } from '../ActionCard'
import { ComparisonProps } from '../StatsComparison'

export class DepositStore {
  constructor(public root: RootStore) {
    makeAutoObservable(this, {})
  }

  get depositButtonProps(): ButtonProps {
    const { balance } = this.root.runwayPointsContractStore
    const { signerEnterprises, signerActiveEnterprise } = this.root.signerStore
    const { depositAmount } = this.root.acquisitionRoyaleContractStore
    if (signerEnterprises && signerEnterprises.length === 0) {
      return { disabled: true, children: 'No owned Enterprise' }
    }
    if (!signerActiveEnterprise || balance === undefined) {
      return LOADING
    }
    if (!depositAmount) {
      return { disabled: true, children: 'Enter deposit amount' }
    }
    if (+depositAmount > balance) {
      return { disabled: true, children: INSUFFICIENT_RP }
    }
    return {
      children: `Deposit ${depositAmount} RP into ${signerActiveEnterprise.name}`,
    }
  }

  get depositBalances(): CostBalance[] {
    const { balance } = this.root.runwayPointsContractStore
    return [makeRPCostBalance(balance || 0)]
  }

  get depositComparisons(): ComparisonProps[] | undefined {
    const { moatThreshold } = this.root.moatContractStore
    const { signerActiveEnterprise } = this.root.signerStore
    const { depositAmount } = this.root.acquisitionRoyaleContractStore
    if (!signerActiveEnterprise || depositAmount === '' || moatThreshold === undefined)
      return undefined
    const { hasMoat } = signerActiveEnterprise
    const { rp } = signerActiveEnterprise.stats
    const newRp = rp + +depositAmount

    const moatComparison = []
    if (newRp >= moatThreshold) {
      if (!hasMoat) {
        moatComparison.push(makeMoatGainMessage())
        // recovery state = rp < threshold && moatUntil is in the future
        // hasMoat = rp > threshold || moatUntil is in the future
        // which bring us to: moatUntil is in the future = rp < moatThreshold && hasMoat
        // so if rp < moatThreshold && hasMoat, moatUntil is in the future && rp < threshold
      } else if (rp < moatThreshold) {
        moatComparison.push(makeMoatRecoverMessage())
      }
    }

    return [
      {
        id: signerActiveEnterprise?.id,
        name: signerActiveEnterprise.name,
        stats: [makeRPComparison(newRp, rp), ...moatComparison],
      },
    ]
  }
}
