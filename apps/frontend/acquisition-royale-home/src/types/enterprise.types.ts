import { BigNumber } from 'ethers'

// TODO: sycn with team to understand what kinds of stats should be in comparison chart
// these keys should be same as they are on smart contract abi
export type EnterpriseStatsName = 'rp' | 'competes' | 'acquisitions' | 'mergers'

export type StatsKeyToName = Partial<Record<EnterpriseStatsName, string>>

export type StatsProps = Partial<Record<EnterpriseStatsName, string | number>>

export type EnterpriseProps = {
  id: number
  name: string
  stats?: StatsProps
}

export type ImmunityPeriods = {
  acquisitionImmunityPeriod: BigNumber
  mergeImmunityPeriod: BigNumber
  revivalImmunityPeriod: BigNumber
}

export type RawEnterprise = {
  name: string
  rp: BigNumber
  lastRpUpdateTime: BigNumber
  acquisitionImmunityStartTime: BigNumber
  mergerImmunityStartTime: BigNumber
  revivalImmunityStartTime: BigNumber
  competes: BigNumber
  acquisitions: BigNumber
  mergers: BigNumber
  branding: string
  fundraiseRpTotal: BigNumber
  fundraiseWethTotal: BigNumber
  damageDealt: BigNumber
  damageTaken: BigNumber
  renames: BigNumber
  rebrands: BigNumber
  revives: BigNumber
}

export type Art = {
  name: string
  description: string
  image: string
}

export type EnterpriseBasic = {
  burned: boolean
  ownerOf: string
  id: number
  immune: boolean
  immuneUntil: number
  name: string
  raw: RawEnterprise
  stats: {
    rpPerDay: number
    acquisitions: number
    competes: number
    mergers: number
    rp: number
  }
}

export type EnterpriseDetails = {
  art?: Art
}

export type Enterprise = EnterpriseBasic & EnterpriseDetails

export type UseEnterprise = {
  enterprises: Enterprise[] | undefined
}

export type Enterprises = Enterprise[]
