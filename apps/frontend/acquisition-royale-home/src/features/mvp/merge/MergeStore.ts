import { SEC_IN_MS } from '@prepo-io/constants'
import { ButtonProps } from 'antd'
import { makeAutoObservable } from 'mobx'
import { RootStore } from '../../../stores/RootStore'
import {
  INSUFFICIENT_RP,
  LOADING,
  makeImmunityComaprison,
  makeMergersComparison,
  makeMoatGainMessage,
  makeMoatRecoverMessage,
  makeRPComparison,
  makeRPCostBalanceWallet,
  makeRpPerDayComparison,
} from '../../../utils/common-utils'
import { formatNumberToNumber } from '../../../utils/number-utils'
import { CostBalance } from '../ActionCard'
import { ComparisonProps } from '../StatsComparison'

export class MergeStore {
  constructor(public root: RootStore) {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  get mergeBalances(): CostBalance[] {
    const { balance } = this.root.runwayPointsContractStore
    return [makeRPCostBalanceWallet(balance ?? 0)]
  }

  get mergeButtonProps(): ButtonProps {
    const { balance } = this.root.runwayPointsContractStore
    const { mergeCost } = this.root.mergeRPCostContractStore
    const { mergeTargetEnterprise, signerActiveEnterprise, signerEnterprises } =
      this.root.signerStore
    if (signerEnterprises && signerEnterprises.length === 0)
      return { disabled: true, children: 'No owned Enterprise' }

    if (
      balance === undefined ||
      mergeCost === undefined ||
      signerEnterprises === undefined ||
      !signerActiveEnterprise
    )
      return LOADING
    if (mergeCost >= +balance) return { disabled: true, children: INSUFFICIENT_RP }
    if (!mergeTargetEnterprise) return { disabled: true, children: 'Select an enterprise' }

    return {
      children: `Upgrade ${signerActiveEnterprise.name} for ${mergeCost} RP`,
    }
  }

  get mergeComparisons(): ComparisonProps[] | undefined {
    const { moatThreshold } = this.root.moatContractStore
    const { mergeTargetEnterprise, signerActiveEnterprise } = this.root.signerStore
    const { getNewRpPerDay, mergerImmunityPeriod, passiveRpPerDay } =
      this.root.acquisitionRoyaleContractStore
    if (
      !mergeTargetEnterprise ||
      !signerActiveEnterprise ||
      passiveRpPerDay === undefined ||
      mergerImmunityPeriod === undefined ||
      moatThreshold === undefined
    ) {
      return undefined
    }
    const { hasMoat } = signerActiveEnterprise
    const { mergers, rp, rpPerDay } = signerActiveEnterprise.stats
    const { rp: targetRp } = mergeTargetEnterprise.stats

    const formattedRp = formatNumberToNumber(rp)
    const newRp = formatNumberToNumber(rp + targetRp)
    if (newRp === undefined || formattedRp === undefined) return undefined

    const newRpPerDay = getNewRpPerDay(rpPerDay + passiveRpPerDay.mergers)
    const immunityComparisons = makeImmunityComaprison(
      mergerImmunityPeriod.mul(SEC_IN_MS),
      signerActiveEnterprise.immuneUntil
    )
    const moatComparison = []
    if (newRp >= moatThreshold) {
      if (!hasMoat) {
        moatComparison.push(makeMoatGainMessage())
        // in recovery state if hasMoat but current RP is below threshold
      } else if (rp < moatThreshold) {
        moatComparison.push(makeMoatRecoverMessage())
      }
    }

    return [
      {
        id: signerActiveEnterprise.id,
        name: signerActiveEnterprise.name,
        stats: [
          makeRPComparison(newRp, formattedRp),
          makeMergersComparison(mergers + 1, mergers),
          // don't show if it's the same (e.g. already at max)
          ...(newRpPerDay !== rpPerDay ? [makeRpPerDayComparison(newRpPerDay, rpPerDay)] : []),
          immunityComparisons,
          ...moatComparison,
        ],
      },
      {
        id: mergeTargetEnterprise.id,
        name: mergeTargetEnterprise.name,
        burned: true,
      },
    ]
  }

  get mergeCosts(): CostBalance[] {
    const { mergeCost } = this.root.mergeRPCostContractStore
    const mergeRPCostObject = makeRPCostBalanceWallet(mergeCost || 0)
    mergeRPCostObject.tooltip = 'Fixed RP cost per Merger.'
    return [mergeRPCostObject]
  }
}
