import { BigNumber } from 'ethers'
import { formatTimestamp } from './date-utils'
import { CostBalance } from '../features/mvp/ActionCard'
import { CompareItem } from '../features/mvp/StatsComparison'
import { Consumables } from '../types/consumables.type'

export const LOADING = { disabled: true, loading: true }
export const INSUFFICIENT_MATIC = 'Insufficient MATIC balance'

export const INSUFFICIENT_RP = 'Insufficient RP balance'
export const ENTERPRISE_IMMUNE = 'Enterprise currently has Immunity'

export const ENTERPRISES = 'Enterprises'
export const REBRAND_TOKENS = 'Rebrand Tokens'
export const RENAME_TOKENS = 'Rename Tokens'
export const REVIVE_TOKENS = 'Revive Tokens'
export const WALLET_BALANCE = 'Wallet Balance'

export const getCorrectConsumableBalance = (
  consumable: Consumables,
  {
    enterprisesBalance,
    rebrandBalance,
    renameBalance,
    reviveBalance,
  }: {
    enterprisesBalance?: number
    rebrandBalance?: number
    renameBalance?: number
    reviveBalance?: number
  }
): {
  name: string
  balance?: number
} => {
  switch (consumable) {
    case Consumables.RebrandToken:
      return { name: REBRAND_TOKENS, balance: rebrandBalance }
    case Consumables.RenameToken:
      return { name: RENAME_TOKENS, balance: renameBalance }
    case Consumables.ReviveToken:
      return { name: REVIVE_TOKENS, balance: reviveBalance }
    default:
      return { name: ENTERPRISES, balance: enterprisesBalance }
  }
}
// the purpose of using these makeSomething... is:
// - Better readability when we use them
// - Avoid typo in unit

export const makeMaticCostBalance = (value: number | string): CostBalance => ({
  amount: `${value}`,
  unit: 'MATIC',
})

export const makeRebrandCostBalance = (value: number | string): CostBalance => ({
  amount: `${value}`,
  unit: REBRAND_TOKENS,
})

export const makeRenameCostBalance = (value: number | string): CostBalance => ({
  amount: `${value}`,
  unit: RENAME_TOKENS,
})

export const makeReviveCostBalance = (value: number | string): CostBalance => ({
  amount: `${value}`,
  unit: REVIVE_TOKENS,
})

export const makeRPCostBalance = (value: number | string): CostBalance => ({
  amount: `${value}`,
  unit: 'RP',
})

export const makeAcquisitionComparison = (after: number, before: number): CompareItem => ({
  after,
  before,
  unit: 'Acquisitions',
})

export const makeMergersComparison = (after: number, before: number): CompareItem => ({
  after,
  before,
  unit: 'Mergers',
})

export const makeRPComparison = (after: number, before: number): CompareItem => ({
  after,
  before,
  unit: 'RP',
})

export const makeImmunityRemoved = (): CompareItem => ({
  label: 'Any immunity of your Enterprise will be removed.',
  labelColor: 'error',
})

export const makeImmunityComaprison = (immunityPeriod: BigNumber, before: number): CompareItem => {
  if (immunityPeriod.toNumber() === 0) {
    return makeImmunityRemoved()
  }

  const now = new Date().getTime()
  const after = immunityPeriod.toNumber() + now
  return {
    after,
    before,
    hideBefore: before < now,
    label: 'Immune until ',
    formatAfter: formatTimestamp,
    formatBefore: formatTimestamp,
  }
}

export const makeRpPerDayComparison = (after: number, before: number): CompareItem => ({
  after,
  before,
  unit: 'RP/Day',
})
