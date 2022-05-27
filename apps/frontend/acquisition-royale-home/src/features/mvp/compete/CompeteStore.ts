import { ButtonProps } from 'antd'
import { makeAutoObservable } from 'mobx'
import { RootStore } from '../../../stores/RootStore'
import {
  ENTERPRISE_IMMUNE,
  INSUFFICIENT_RP,
  LOADING,
  makeImmunityRemoved,
  makeMoatLossMessage,
  makeRPComparison,
  makeRPCostBalance,
} from '../../../utils/common-utils'
import { CostBalance } from '../ActionCard'
import { ComparisonProps } from '../StatsComparison'

export class CompeteStore {
  constructor(public root: RootStore) {
    makeAutoObservable(this, {})
  }

  get competeButtonProps(): ButtonProps {
    const { signerActiveEnterprise, signerEnterprises } = this.root.signerStore
    const { competitionActiveEnterprise } = this.root.competitionStore
    const { competeRp } = this.root.acquisitionRoyaleContractStore
    const { damage } = this.root.competeV1ContractStore

    if (signerEnterprises && signerEnterprises.length === 0) {
      return { disabled: true, children: 'No owned Enterprise' }
    }
    if (!signerActiveEnterprise || damage === undefined) {
      return LOADING
    }
    if (!competitionActiveEnterprise) {
      return { disabled: true, children: "Select a competitor's Enterprise" }
    }
    if (competitionActiveEnterprise.burned) {
      return { disabled: true, children: 'Enterprise is burnt!' }
    }
    if (competitionActiveEnterprise.immune) {
      return { disabled: true, children: ENTERPRISE_IMMUNE }
    }
    if (!competeRp) {
      return { disabled: true, children: 'Enter compete amount' }
    }
    if (+competeRp > signerActiveEnterprise.stats.rp) {
      return { disabled: true, children: INSUFFICIENT_RP }
    }
    return {
      children: `Attack ${competitionActiveEnterprise.name} with ${competeRp} RP`,
    }
  }

  get competeBalances(): CostBalance[] {
    const { signerActiveEnterprise } = this.root.signerStore
    return [makeRPCostBalance(signerActiveEnterprise?.stats.rp || 0)]
  }

  get competeCosts(): CostBalance[] {
    const { competeRp } = this.root.acquisitionRoyaleContractStore
    return [makeRPCostBalance(competeRp || 0)]
  }

  get competeComparisons(): ComparisonProps[] | undefined {
    const { moatThreshold, moatImmunityPeriod } = this.root.moatContractStore
    const { signerActiveEnterprise } = this.root.signerStore
    const { competitionActiveEnterprise } = this.root.competitionStore
    const { competeRp } = this.root.acquisitionRoyaleContractStore
    const { damage } = this.root.competeV1ContractStore
    if (!signerActiveEnterprise || !competitionActiveEnterprise || damage === undefined)
      return undefined

    const { rp: signerRp } = signerActiveEnterprise.stats
    const { rp: targetRp } = competitionActiveEnterprise.stats

    const signerRpAfter = signerRp - +competeRp
    let targetRpAfter = competitionActiveEnterprise.stats.rp - damage
    targetRpAfter = Math.max(targetRpAfter, 0)
    const signerMoat = []
    if (signerRp >= moatThreshold && signerRpAfter < moatThreshold)
      signerMoat.push(makeMoatLossMessage(moatImmunityPeriod))

    const targetMoat = []
    if (targetRp >= moatThreshold && targetRpAfter < moatThreshold)
      targetMoat.push(makeMoatLossMessage(moatImmunityPeriod))

    const immunity = []
    if (signerActiveEnterprise.immune) immunity.push(makeImmunityRemoved())

    return [
      {
        id: signerActiveEnterprise.id,
        name: signerActiveEnterprise.name,
        stats: [makeRPComparison(signerRpAfter, signerRp), ...immunity, ...signerMoat],
      },
      {
        id: competitionActiveEnterprise.id,
        name: competitionActiveEnterprise.name,
        stats: [makeRPComparison(targetRpAfter, targetRp), ...targetMoat],
      },
    ]
  }
}
