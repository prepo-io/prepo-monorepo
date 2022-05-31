import { BigNumber } from 'ethers'

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
  hasMoat: boolean
  id: number
  immune: boolean
  immuneUntil: number
  lastHadMoat: boolean
  moatCountdown: number
  moatUntil: number
  name: string
  ownerOf: string
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
