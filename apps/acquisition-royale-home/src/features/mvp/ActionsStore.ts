import { ButtonProps } from 'antd'
import { ethers } from 'ethers'
import { CostBalance } from './ActionCard'
import { ComparisonProps } from './StatsComparison'
import { RootStore } from '../../stores/RootStore'
import {
  ENTERPRISE_IMMUNE,
  INSUFFICIENT_MATIC,
  INSUFFICIENT_RP,
  makeAcquisitionComparison,
  makeImmunityComaprison,
  makeImmunityRemoved,
  makeMaticCostBalance,
  makeMergersComparison,
  makeRebrandCostBalance,
  makeRenameCostBalance,
  makeReviveCostBalance,
  makeRPComparison,
  makeRPCostBalance,
  makeRpPerDayComparison,
  REBRAND_TOKENS,
  RENAME_TOKENS,
  REVIVE_TOKENS,
  WALLET_BALANCE,
  LOADING,
} from '../../utils/common-utils'
import { formatNumberToNumber } from '../../utils/number-utils'
import { tasks } from '../../lib/intern'
import { SEC_IN_MS } from '../../lib/constants'
import { formatPeriod } from '../../utils/date-utils'

export class ActionsStore {
  root: RootStore
  constructor(root: RootStore) {
    this.root = root
  }

  // custom logic ...

  // make sure rpPerDay does not exceed max rpPerDay
  generateNewRpPerDay(newRpPerDay: number): number {
    const { passiveRpPerDay } = this.root.acquisitionRoyaleContractStore
    if (!passiveRpPerDay) return newRpPerDay
    return newRpPerDay > passiveRpPerDay.max ? passiveRpPerDay.max : newRpPerDay
  }

  // action props ...
  get acquireButtonProps(): ButtonProps {
    const { acquireCost } = this.root.acquireCostContractStore
    const { rpRequiredForDamage } = this.root.competeV1ContractStore
    const { signerEnterprises, signerActiveEnterprise, competitionActiveEnterprise } =
      this.root.enterprisesStore
    const { acquireKeepId } = this.root.acquisitionRoyaleContractStore
    const { formattedBalance } = this.root.web3Store

    if (signerEnterprises && signerEnterprises.length === 0) {
      return { disabled: true, children: 'No owned Enterprise' }
    }
    if (!signerActiveEnterprise || acquireCost === undefined) {
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
    if (+formattedBalance < acquireCost) {
      return { disabled: true, children: INSUFFICIENT_MATIC }
    }
    if (
      rpRequiredForDamage !== undefined &&
      signerActiveEnterprise.stats.rp < rpRequiredForDamage
    ) {
      const formattedRpRequiredForDamage = formatNumberToNumber(rpRequiredForDamage)
      return { disabled: true, children: `${formattedRpRequiredForDamage} RP required` }
    }
    if (acquireKeepId === undefined) {
      return { disabled: true, children: 'Select an Enterprise to keep.' }
    }
    const keepEnterprise =
      acquireKeepId === signerActiveEnterprise.id
        ? signerActiveEnterprise
        : competitionActiveEnterprise
    return { children: `Upgrade ${keepEnterprise.name}` }
  }

  get competeButtonProps(): ButtonProps {
    const { competitionActiveEnterprise, signerActiveEnterprise, signerEnterprises } =
      this.root.enterprisesStore
    const { competeRp } = this.root.acquisitionRoyaleContractStore

    if (signerEnterprises && signerEnterprises.length === 0) {
      return { disabled: true, children: 'No owned Enterprise' }
    }
    if (!signerActiveEnterprise) {
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

  get depositButtonProps(): ButtonProps {
    const { balance } = this.root.runwayPointsContractStore
    const { signerEnterprises, signerActiveEnterprise } = this.root.enterprisesStore
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

  get internButtonProps(): ButtonProps {
    const { doingTask, randomTaskIndex } = this.root.internStore
    const {
      claimDelay,
      globalRpClaimedToday,
      globalRpLimitPerDay,
      lastClaimTime,
      lastTask,
      rpPerInternPerDay,
      rpBalance,
      tasksCompletedToday,
      tasksPerDay,
    } = this.root.internContractStore
    if (
      claimDelay === undefined ||
      globalRpClaimedToday === undefined ||
      globalRpLimitPerDay === undefined ||
      lastClaimTime === undefined ||
      rpBalance === undefined ||
      rpPerInternPerDay === undefined ||
      tasksCompletedToday === undefined ||
      tasksPerDay === undefined ||
      doingTask
    ) {
      return LOADING
    }
    if (tasksCompletedToday >= tasksPerDay) {
      return { disabled: true, children: `Daily RP already claimed.` }
    }
    if (globalRpClaimedToday + rpPerInternPerDay > globalRpLimitPerDay) {
      return { disabled: true, children: `Today’s RP has been claimed. Be quicker tomorrow!` }
    }
    const now = new Date().getTime()
    const nextClaimableTime = (lastClaimTime + claimDelay) * SEC_IN_MS
    if (now < nextClaimableTime) {
      return {
        disabled: true,
        children: `Too soon to claim! Come back in ${formatPeriod(nextClaimableTime, {
          withSec: true,
        })}`,
      }
    }
    if (rpBalance < rpPerInternPerDay) {
      return { disabled: true, children: 'Out of RP! Check back later!' }
    }
    let claimMessage = ''
    const task = tasks[randomTaskIndex]
    if (lastTask) {
      claimMessage = ` + claim ${rpPerInternPerDay} RP`
    }
    return { children: `${task} (${tasksCompletedToday + 1}/${tasksPerDay})${claimMessage}` }
  }

  get mergeButtonProps(): ButtonProps {
    const { formattedBalance } = this.root.web3Store
    const { mergeCost } = this.root.mergeCostContractStore
    const { mergeTargetEnterprise, signerActiveEnterprise, signerEnterprises } =
      this.root.enterprisesStore
    if (signerEnterprises && signerEnterprises.length === 0) {
      return { disabled: true, children: 'No owned Enterprise' }
    }
    if (mergeCost === undefined || signerEnterprises === undefined || !signerActiveEnterprise)
      return LOADING
    if (mergeCost.amountToTreasury >= +formattedBalance) {
      return { disabled: true, children: INSUFFICIENT_MATIC }
    }
    if (!mergeTargetEnterprise) {
      return { disabled: true, children: 'Select an enterprise' }
    }
    return {
      children: `Upgrade ${signerActiveEnterprise.name} for ${mergeCost.amountToTreasury} MATIC`,
    }
  }

  get rebrandButtonProps(): ButtonProps {
    const { signerActiveEnterprise, signerEnterprises } = this.root.enterprisesStore
    const { rebrandAddress } = this.root.acquisitionRoyaleContractStore
    const { rebrandBalance } = this.root.consumablesContractStore
    if (signerEnterprises && signerEnterprises.length === 0) {
      return { disabled: true, children: 'No owned Enterprise' }
    }
    if (
      rebrandBalance === undefined ||
      signerEnterprises === undefined ||
      !signerActiveEnterprise
    ) {
      return LOADING
    }
    if (rebrandBalance <= 0) {
      return { disabled: true, children: `Don't have Rebrand Token` }
    }
    if (!ethers.utils.isAddress(rebrandAddress)) {
      return { disabled: true, children: 'Enter Branding address' }
    }
    return { children: `Rebrand ${signerActiveEnterprise.name}` }
  }

  get renameButtonProps(): ButtonProps {
    const { signerActiveEnterprise, signerEnterprises } = this.root.enterprisesStore
    const { newName } = this.root.acquisitionRoyaleContractStore
    const { renameBalance } = this.root.consumablesContractStore
    if (signerEnterprises && signerEnterprises.length === 0) {
      return { disabled: true, children: 'No owned Enterprise' }
    }
    if (signerEnterprises === undefined || renameBalance === undefined || !signerActiveEnterprise) {
      return LOADING
    }
    if (renameBalance <= 0) {
      return { disabled: true, children: `Don't have Rename Token` }
    }
    if (newName.length <= 0) {
      return { disabled: true, children: 'Enter a new name' }
    }
    return {
      children: `Rename ${signerActiveEnterprise.name}`,
    }
  }

  get reviveButtonProps(): ButtonProps {
    const { competitionActiveEnterprise } = this.root.enterprisesStore
    const { reviveBalance } = this.root.consumablesContractStore
    if (reviveBalance === undefined) {
      return LOADING
    }
    if (competitionActiveEnterprise === undefined) {
      return { disabled: true, children: 'Select a burnt enterprise' }
    }
    if (!competitionActiveEnterprise.burned) {
      return { disabled: true, children: 'Enterprise is active' }
    }
    if (reviveBalance <= 0) {
      return { disabled: true, children: `Don't have Revive Token` }
    }
    return { children: `Revive and own ${competitionActiveEnterprise.name}` }
  }

  get withdrawButtonProps(): ButtonProps {
    const { balance } = this.root.runwayPointsContractStore
    const { signerActiveEnterprise, signerEnterprises } = this.root.enterprisesStore
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

  // balances ...
  get acquireBalances(): CostBalance[] | undefined {
    const { signerActiveEnterprise } = this.root.enterprisesStore
    const { formattedBalance } = this.root.web3Store
    if (!signerActiveEnterprise) return undefined
    const maticBalance = makeMaticCostBalance(formattedBalance)
    const rpBalance = makeRPCostBalance(signerActiveEnterprise.stats.rp.toString())
    return [maticBalance, rpBalance]
  }

  get competeBalances(): CostBalance[] {
    const { signerActiveEnterprise } = this.root.enterprisesStore
    return [makeRPCostBalance(signerActiveEnterprise?.stats.rp || 0)]
  }

  get depositBalances(): CostBalance[] {
    const { balance } = this.root.runwayPointsContractStore
    return [makeRPCostBalance(balance || 0)]
  }

  get mergeBalances(): CostBalance[] {
    const { formattedBalance } = this.root.web3Store
    return [makeMaticCostBalance(formattedBalance)]
  }

  get rebrandBalances(): CostBalance[] | undefined {
    const { rebrandBalance } = this.root.consumablesContractStore
    if (rebrandBalance === undefined) return undefined
    return [makeRebrandCostBalance(rebrandBalance)]
  }

  get renameBalances(): CostBalance[] | undefined {
    const { renameBalance } = this.root.consumablesContractStore
    if (renameBalance === undefined) return undefined
    return [makeRenameCostBalance(renameBalance)]
  }

  get reviveBalances(): CostBalance[] | undefined {
    const { reviveBalance } = this.root.consumablesContractStore
    if (reviveBalance === undefined) return undefined
    return [makeReviveCostBalance(reviveBalance)]
  }

  get withdrawBalances(): CostBalance[] {
    const { balance } = this.root.runwayPointsContractStore
    return [makeRPCostBalance(balance || 0)]
  }

  // costs ...
  get acquireCosts(): CostBalance[] | undefined {
    const { signerActiveEnterprise } = this.root.enterprisesStore
    const { acquireCost, acquireCostBreakdown } = this.root.acquireCostContractStore
    const { rpRequiredForDamage } = this.root.competeV1ContractStore
    // RP cost can be 0 when no competition is selected
    // but signerActiveEnterprise should not be undefined
    // hence we check signerActiveEnterprise although we're using competitionActiveEnterprise here
    if (!signerActiveEnterprise) return undefined
    const maticCost = makeMaticCostBalance(acquireCost || '0')
    if (acquireCostBreakdown) {
      maticCost.breakdown = []
      if (acquireCostBreakdown.amountToTreasury) {
        maticCost.breakdown?.push({
          amount: `${acquireCostBreakdown.amountToTreasury}`,
          unit: 'MATIC ',
          label: 'to treasury.',
        })
      }
      if (acquireCostBreakdown.amountToRecipient) {
        maticCost.breakdown?.push({
          amount: `${acquireCostBreakdown.amountToRecipient}`,
          unit: 'MATIC',
          label: 'to acquired competitor.',
        })
      }
      if (acquireCostBreakdown.amountToBurn) {
        maticCost.breakdown?.push({
          amount: `${acquireCostBreakdown.amountToBurn}`,
          unit: 'MATIC',
          label: 'burnt.',
        })
      }
    }
    const rpCost = makeRPCostBalance(rpRequiredForDamage || '0')
    return [maticCost, rpCost]
  }

  get competeCosts(): CostBalance[] {
    const { competeRp } = this.root.acquisitionRoyaleContractStore
    return [makeRPCostBalance(competeRp || 0)]
  }

  get mergeCosts(): CostBalance[] {
    const { mergeCost } = this.root.mergeCostContractStore
    return [makeMaticCostBalance(mergeCost?.amountToTreasury || 0)]
  }

  get rebrandCosts(): CostBalance[] | undefined {
    const { rebrandBalance } = this.root.consumablesContractStore
    if (rebrandBalance === undefined) return undefined
    return [makeRebrandCostBalance(1)]
  }

  get renameCosts(): CostBalance[] | undefined {
    const { renameBalance } = this.root.consumablesContractStore
    if (renameBalance === undefined) return undefined
    return [makeRenameCostBalance(1)]
  }

  get reviveCosts(): CostBalance[] | undefined {
    const { reviveBalance } = this.root.consumablesContractStore
    if (reviveBalance === undefined) return undefined
    return [makeReviveCostBalance(1)]
  }

  // stats comparisons ...
  get acquireComparisons(): ComparisonProps[] | undefined {
    const { competitionActiveEnterprise, signerActiveEnterprise } = this.root.enterprisesStore
    const { acquireKeepId, passiveRpPerDay, acquisitionImmunityPeriod } =
      this.root.acquisitionRoyaleContractStore
    const { rpRequiredForDamage } = this.root.competeV1ContractStore
    if (
      !signerActiveEnterprise ||
      !competitionActiveEnterprise ||
      acquireKeepId === undefined ||
      rpRequiredForDamage === undefined ||
      passiveRpPerDay === undefined ||
      acquisitionImmunityPeriod === undefined
    ) {
      return undefined
    }
    const formattedSignerRpAfter = formatNumberToNumber(
      signerActiveEnterprise.stats.rp - rpRequiredForDamage
    )
    const formattedSignerRpBefore = formatNumberToNumber(signerActiveEnterprise.stats.rp)
    if (formattedSignerRpAfter === undefined || formattedSignerRpBefore === undefined) {
      return undefined
    }
    const { acquisitions, rpPerDay } = signerActiveEnterprise.stats
    const signerNewRpPerDay = this.generateNewRpPerDay(rpPerDay + passiveRpPerDay.acquisitions)
    const competitionNewRpPerDay = this.generateNewRpPerDay(
      competitionActiveEnterprise.stats.rpPerDay + passiveRpPerDay.acquisitions
    )

    const oldImmunity =
      acquireKeepId === signerActiveEnterprise.id
        ? signerActiveEnterprise.immuneUntil
        : competitionActiveEnterprise.immuneUntil

    const immunityComparison = makeImmunityComaprison(
      // timestamp from smart contract is in seconds, hence pointing to 1970 as of now
      // we need to multiply 1000 to match normal javascript getTime which is in miliseconds
      acquisitionImmunityPeriod.mul(SEC_IN_MS),
      oldImmunity
    )

    const rpComparison = makeRPComparison(formattedSignerRpAfter, formattedSignerRpBefore)
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

  get competeComparisons(): ComparisonProps[] | undefined {
    const { signerActiveEnterprise, competitionActiveEnterprise } = this.root.enterprisesStore
    const { competeRp } = this.root.acquisitionRoyaleContractStore
    const { damage } = this.root.competeV1ContractStore
    if (!signerActiveEnterprise || !competitionActiveEnterprise || damage === undefined)
      return undefined
    const formattedSignerAfter = formatNumberToNumber(signerActiveEnterprise.stats.rp - +competeRp)
    const formattedSignerBefore = formatNumberToNumber(signerActiveEnterprise.stats.rp)
    const formattedTargetAfter = formatNumberToNumber(competitionActiveEnterprise.stats.rp - damage)
    const formattedTargetBefore = formatNumberToNumber(competitionActiveEnterprise.stats.rp)
    if (
      formattedSignerAfter === undefined ||
      formattedSignerBefore === undefined ||
      formattedTargetAfter === undefined ||
      formattedTargetBefore === undefined
    ) {
      return undefined
    }

    return [
      {
        id: signerActiveEnterprise.id,
        name: signerActiveEnterprise.name,
        stats: [
          makeRPComparison(formattedSignerAfter, formattedSignerBefore),
          ...(signerActiveEnterprise.immune ? [makeImmunityRemoved()] : []),
        ],
      },
      {
        id: competitionActiveEnterprise.id,
        name: competitionActiveEnterprise.name,
        stats: [makeRPComparison(formattedTargetAfter, formattedTargetBefore)],
      },
    ]
  }

  get depositComparisons(): ComparisonProps[] | undefined {
    const { signerActiveEnterprise } = this.root.enterprisesStore
    const { depositAmount } = this.root.acquisitionRoyaleContractStore
    if (!signerActiveEnterprise || depositAmount === '') return undefined
    const formattedRpBefore = formatNumberToNumber(signerActiveEnterprise.stats.rp)
    const formattedRpAfter = formatNumberToNumber(signerActiveEnterprise.stats.rp + +depositAmount)
    if (formattedRpAfter === undefined || formattedRpBefore === undefined) return undefined
    return [
      {
        id: signerActiveEnterprise?.id,
        name: signerActiveEnterprise.name,
        stats: [makeRPComparison(formattedRpAfter, formattedRpBefore)],
      },
    ]
  }

  get mergeComparisons(): ComparisonProps[] | undefined {
    const { mergeTargetEnterprise, signerActiveEnterprise } = this.root.enterprisesStore
    const { mergerImmunityPeriod, passiveRpPerDay } = this.root.acquisitionRoyaleContractStore
    if (
      !mergeTargetEnterprise ||
      !signerActiveEnterprise ||
      !passiveRpPerDay ||
      !mergerImmunityPeriod
    ) {
      return undefined
    }
    const { mergers, rp, rpPerDay } = signerActiveEnterprise.stats
    const { rp: targetRp } = mergeTargetEnterprise.stats

    const formattedRp = formatNumberToNumber(rp)
    const newRp = formatNumberToNumber(rp + targetRp)
    if (newRp === undefined || formattedRp === undefined) {
      return undefined
    }
    const newRpPerDay = this.generateNewRpPerDay(rpPerDay + passiveRpPerDay.mergers)
    const immunityComparisons = makeImmunityComaprison(
      mergerImmunityPeriod.mul(SEC_IN_MS),
      signerActiveEnterprise.immuneUntil
    )
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
        ],
      },
      {
        id: mergeTargetEnterprise.id,
        name: mergeTargetEnterprise.name,
        burned: true,
      },
    ]
  }

  get rebrandComparisons(): ComparisonProps[] | undefined {
    const { rebrandBalance } = this.root.consumablesContractStore
    if (rebrandBalance === undefined || rebrandBalance <= 0) {
      return undefined
    }
    return [
      {
        id: 0,
        name: REBRAND_TOKENS,
        stats: [{ after: rebrandBalance - 1, before: rebrandBalance }],
      },
    ]
  }

  get renameComparisons(): ComparisonProps[] | undefined {
    const { renameBalance } = this.root.consumablesContractStore
    if (renameBalance === undefined || renameBalance <= 0) {
      return undefined
    }
    return [
      {
        id: 0,
        name: RENAME_TOKENS,
        stats: [{ after: renameBalance - 1, before: renameBalance }],
      },
    ]
  }

  get reviveComparisons(): ComparisonProps[] | undefined {
    const { reviveBalance } = this.root.consumablesContractStore
    if (reviveBalance === undefined || reviveBalance <= 0) {
      return undefined
    }
    return [
      {
        id: 0,
        name: REVIVE_TOKENS,
        stats: [{ after: reviveBalance - 1, before: reviveBalance }],
      },
    ]
  }

  get withdrawComparisons(): ComparisonProps[] | undefined {
    const { balance } = this.root.runwayPointsContractStore
    const { signerActiveEnterprise } = this.root.enterprisesStore
    const { withdrawAmount, withdrawalBurnPercentage } = this.root.acquisitionRoyaleContractStore
    if (
      !signerActiveEnterprise ||
      withdrawAmount === '' ||
      balance === undefined ||
      withdrawalBurnPercentage === undefined
    )
      return undefined
    const formattedRpBefore = formatNumberToNumber(signerActiveEnterprise.stats.rp)
    const formattedRpAfter = formatNumberToNumber(signerActiveEnterprise.stats.rp - +withdrawAmount)
    const formattedWalletRpAfter = formatNumberToNumber(
      balance + +withdrawAmount * (1 - withdrawalBurnPercentage)
    )
    const formattedWalletRpBefore = formatNumberToNumber(balance)
    if (
      formattedRpAfter === undefined ||
      formattedRpBefore === undefined ||
      formattedWalletRpAfter === undefined ||
      formattedWalletRpBefore === undefined
    )
      return undefined
    return [
      {
        id: signerActiveEnterprise?.id,
        name: signerActiveEnterprise.name,
        stats: [makeRPComparison(formattedRpAfter, formattedRpBefore)],
      },
      {
        // only purpose of this id is to provide a unique key to map
        // it can be any value as long as not conflicting with other values in this list
        id: signerActiveEnterprise?.id === 0 ? 1 : 0,
        name: WALLET_BALANCE,
        stats: [makeRPComparison(formattedWalletRpAfter, formattedWalletRpBefore)],
      },
    ]
  }
}
