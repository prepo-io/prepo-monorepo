import { ethers } from 'ethers'
import { CostContracts, PassiveRpPerDay } from '../../types/common.types'
import { RawEnterprise } from '../../types/enterprise.types'
import { CostContractsArray, PassiveRpPerDayArray } from '../AcquisitionRoyaleContractStore'

export const formatContractAddress = (rawAddress: [string] | undefined): string | undefined => {
  if (rawAddress === undefined) return undefined
  return rawAddress[0]
}

export const formatCostContracts = (data?: CostContractsArray): CostContracts | undefined => {
  if (!data) return undefined
  return {
    acquireCost: data[0],
    mergeCost: data[1],
    acquireRpCost: data[2],
    mergeRpCost: data[3],
    acquireRpReward: data[4],
  }
}
export const formatPassiveRpPerDay = (data: PassiveRpPerDayArray): PassiveRpPerDay | undefined => {
  if (!data) return undefined
  const max = data[0]
  const base = data[1]
  const acquisitions = data[2]
  const mergers = data[3]
  return {
    max: +ethers.utils.formatEther(max),
    base: +ethers.utils.formatEther(base),
    acquisitions: +ethers.utils.formatEther(acquisitions),
    mergers: +ethers.utils.formatEther(mergers),
    raw: { max, base, acquisitions, mergers },
  }
}

export const calculateRpPerDay = (
  { raw }: PassiveRpPerDay,
  { acquisitions, mergers }: RawEnterprise
): number => {
  let rpPerDay = raw.base.add(raw.acquisitions.mul(acquisitions)).add(raw.mergers.mul(mergers))
  rpPerDay = raw.max.gt(rpPerDay) ? rpPerDay : raw.max
  return +ethers.utils.formatEther(rpPerDay)
}
