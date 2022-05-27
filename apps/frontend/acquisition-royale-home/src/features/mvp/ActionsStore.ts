import { ButtonProps } from 'antd'
import { ethers } from 'ethers'
import { CostBalance } from './ActionCard'
import { ComparisonProps } from './StatsComparison'
import { RootStore } from '../../stores/RootStore'
import {
  makeRebrandCostBalance,
  makeRenameCostBalance,
  makeReviveCostBalance,
  REBRAND_TOKENS,
  RENAME_TOKENS,
  REVIVE_TOKENS,
  LOADING,
} from '../../utils/common-utils'
import { tasks } from '../../lib/intern'
import { SEC_IN_MS } from '../../lib/constants'
import { formatPeriod } from '../../utils/date-utils'

export class ActionsStore {
  root: RootStore
  constructor(root: RootStore) {
    this.root = root
  }

  // action props ...

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

  get rebrandButtonProps(): ButtonProps {
    const { signerActiveEnterprise, signerEnterprises } = this.root.signerStore
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
    const { signerActiveEnterprise, signerEnterprises } = this.root.signerStore
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
    const { competitionActiveEnterprise } = this.root.competitionStore
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

  // balances ...

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

  // costs ...

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
}
