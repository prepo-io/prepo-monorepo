import { SEC_IN_MS } from '@prepo-io/constants'
import { ButtonProps } from 'antd'
import { makeAutoObservable } from 'mobx'
import { RootStore } from '../../../stores/RootStore'
import {
  ENTERPRISE_IMMUNE,
  INSUFFICIENT_RP_FROM_WALLET,
  LOADING,
  makeAcquisitionComparison,
  makeImmunityComaprison,
  makeMoatLossMessage,
  makeRPComparison,
  makeRPCostBalanceEnterprise,
  makeRPCostBalanceWallet,
  makeRpPerDayComparison,
} from '../../../utils/common-utils'
import { formatNumberToNumber } from '../../../utils/number-utils'
import { CostBalance } from '../ActionCard'
import { ComparisonProps } from '../StatsComparison'

export class AcquireStore {
  constructor(public root: RootStore) {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  get acquireBalances(): CostBalance[] | undefined {
    const { signerActiveEnterprise } = this.root.signerStore
    const { balance } = this.root.runwayPointsContractStore
    if (!signerActiveEnterprise) return undefined
    const rpCostBalanceEnterprise = makeRPCostBalanceWallet(balance ?? 0)
    const rpCostBalanceWallet = makeRPCostBalanceEnterprise(
      signerActiveEnterprise.stats.rp.toString()
    )
    return [rpCostBalanceEnterprise, rpCostBalanceWallet]
  }

  get acquireButtonProps(): ButtonProps {
    const { acquireCost } = this.root.acquireRPCostContractStore
    const { balance } = this.root.runwayPointsContractStore
    const { rpRequiredForDamage } = this.root.competeV1ContractStore
    const { signerEnterprises, signerActiveEnterprise } = this.root.signerStore
    const { competitionActiveEnterprise } = this.root.competitionStore
    const { acquireKeepId } = this.root.acquisitionRoyaleContractStore

    if (signerEnterprises && signerEnterprises.length === 0)
      return { disabled: true, children: 'No owned Enterprise' }

    if (
      balance === undefined ||
      !signerActiveEnterprise ||
      acquireCost === undefined ||
      competitionActiveEnterprise?.hasMoat === undefined ||
      (competitionActiveEnterprise && rpRequiredForDamage === undefined)
    )
      return LOADING
    if (!competitionActiveEnterprise)
      return { disabled: true, children: "Select a competitor's Enterprise" }

    const { hasMoat } = competitionActiveEnterprise
    if (competitionActiveEnterprise.burned)
      return { disabled: true, children: 'Enterprise is burnt!' }
    if (hasMoat) return { disabled: true, children: 'Enterprise has Moat' }
    if (competitionActiveEnterprise.immune) return { disabled: true, children: ENTERPRISE_IMMUNE }
    if (balance < acquireCost) return { disabled: true, children: INSUFFICIENT_RP_FROM_WALLET }

    if (rpRequiredForDamage && signerActiveEnterprise.stats.rp < rpRequiredForDamage) {
      const formattedRpRequiredForDamage = formatNumberToNumber(rpRequiredForDamage)
      return {
        disabled: true,
        children: `${formattedRpRequiredForDamage} RP required for ${signerActiveEnterprise.name}`,
      }
    }
    if (acquireKeepId === undefined)
      return { disabled: true, children: 'Select an Enterprise to keep.' }

    const keepEnterprise =
      acquireKeepId === signerActiveEnterprise.id
        ? signerActiveEnterprise
        : competitionActiveEnterprise
    return { children: `Upgrade ${keepEnterprise.name}` }
  }

  get acquireComparisons(): ComparisonProps[] | undefined {
    const { moatImmunityPeriod, moatThreshold } = this.root.moatContractStore
    const { signerActiveEnterprise } = this.root.signerStore
    const { competitionActiveEnterprise } = this.root.competitionStore
    const { acquireKeepId, getNewRpPerDay, passiveRpPerDay, acquisitionImmunityPeriod } =
      this.root.acquisitionRoyaleContractStore
    const { rpRequiredForDamage } = this.root.competeV1ContractStore
    if (
      !signerActiveEnterprise ||
      !competitionActiveEnterprise ||
      acquireKeepId === undefined ||
      rpRequiredForDamage === undefined ||
      passiveRpPerDay === undefined ||
      acquisitionImmunityPeriod === undefined ||
      moatImmunityPeriod === undefined ||
      moatThreshold === undefined
    )
      return undefined

    const { hasMoat } = signerActiveEnterprise
    const { acquisitions, rp, rpPerDay } = signerActiveEnterprise.stats
    const signerRpAfter = rp - rpRequiredForDamage

    const moatMessage = []
    // if Enterprise has moat and is not in countdown state
    if (hasMoat && rp >= moatThreshold && signerRpAfter < moatThreshold) {
      moatMessage.push(makeMoatLossMessage(moatImmunityPeriod))
    }

    const signerNewRpPerDay = getNewRpPerDay(rpPerDay + passiveRpPerDay.acquisitions)
    const competitionNewRpPerDay = getNewRpPerDay(
      competitionActiveEnterprise.stats.rpPerDay + passiveRpPerDay.acquisitions
    )

    const oldImmunity =
      acquireKeepId === signerActiveEnterprise.id
        ? signerActiveEnterprise.immuneUntil
        : competitionActiveEnterprise.immuneUntil

    const immunityComparison = makeImmunityComaprison(
      acquisitionImmunityPeriod.mul(SEC_IN_MS),
      oldImmunity
    )

    const rpComparison = makeRPComparison(signerRpAfter, rp)
    return [
      {
        id: signerActiveEnterprise.id,
        name: signerActiveEnterprise.name,
        burned: acquireKeepId !== signerActiveEnterprise.id,
        stats: [
          rpComparison,
          makeAcquisitionComparison(acquisitions + 1, acquisitions),
          // don't show if it's the same (e.g. already at max)
          ...(signerNewRpPerDay !== rpPerDay
            ? [makeRpPerDayComparison(signerNewRpPerDay, rpPerDay)]
            : []),
          immunityComparison,
          ...moatMessage,
        ],
      },
      {
        id: competitionActiveEnterprise.id,
        name: competitionActiveEnterprise.name,
        burned: acquireKeepId !== competitionActiveEnterprise.id,
        stats: [
          rpComparison,
          makeAcquisitionComparison(
            competitionActiveEnterprise.stats.acquisitions + 1,
            competitionActiveEnterprise.stats.acquisitions
          ),
          // don't show if it's the same (e.g. already at max)
          ...(competitionNewRpPerDay !== rpPerDay
            ? [
                makeRpPerDayComparison(
                  competitionNewRpPerDay,
                  competitionActiveEnterprise.stats.rpPerDay
                ),
              ]
            : []),
          immunityComparison,
        ],
      },
    ]
  }

  get acquireCosts(): CostBalance[] | undefined {
    const { signerActiveEnterprise } = this.root.signerStore
    const { acquireCost } = this.root.acquireRPCostContractStore
    const { rpRequiredForDamage } = this.root.competeV1ContractStore
    // RP cost can be 0 when no competition is selected
    // but signerActiveEnterprise should not be undefined
    // hence we check signerActiveEnterprise although we're using competitionActiveEnterprise here
    if (!signerActiveEnterprise) return undefined
    const rpCostWallet = makeRPCostBalanceWallet(acquireCost || '0')
    const rpCostEnterprise = makeRPCostBalanceEnterprise(rpRequiredForDamage || '0')
    rpCostWallet.tooltip = 'Fixed RP cost per Acquisition.'
    rpCostEnterprise.tooltip = "RP cost to compete enemy Enterprise's RP to 0."
    return [rpCostWallet, rpCostEnterprise]
  }
}
