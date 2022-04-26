import { BigNumber } from 'ethers'
import { Enterprise, Enterprises, ImmunityPeriods, StatsKeyToName } from '../types/enterprise.types'

export const statsDisplayName: StatsKeyToName = {
  acquisitions: 'Acquisitions',
  competes: 'Competes',
  mergers: 'Mergers',
  rp: 'RP',
}

export const generateDummyArray = (length: number): number[] => {
  const arr = []
  for (let i = 0; i < length; i += 1) {
    arr.push(i)
  }
  return arr
}

export const isEnterpriseLoaded = (enterprise: Enterprise | undefined): boolean =>
  enterprise !== undefined &&
  enterprise.art !== undefined &&
  enterprise.burned !== undefined &&
  enterprise.immune !== undefined

export const isFirstEnterpriseLoaded = (enterprises: Enterprises | undefined): boolean => {
  if (enterprises !== undefined) {
    // only considered when all potientially undefined items are resolved
    const firstLoadedIndex = enterprises.findIndex(isEnterpriseLoaded)
    return firstLoadedIndex > -1
  }
  return false
}

export const formatImmunityPeriods = ([
  acquisitionImmunityPeriod,
  mergeImmunityPeriod,
  revivalImmunityPeriod,
]: [BigNumber, BigNumber, BigNumber]): ImmunityPeriods => ({
  acquisitionImmunityPeriod,
  mergeImmunityPeriod,
  revivalImmunityPeriod,
})
