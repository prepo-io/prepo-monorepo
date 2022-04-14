import { ethers } from 'ethers'
import { PassiveRpPerDay } from '../../types/common.types'
import { RawEnterprise } from '../../types/enterprise.types'
import { PassiveRpPerDayArray } from '../AcquisitionRoyaleContractStore'

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
