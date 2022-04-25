import { ethers } from 'ethers'
import { CommonCostProps } from '../../types/cost.types'
import { GetCostArray } from '../MergeRPCostContract'

export const formatCommonCost = (raw: GetCostArray): CommonCostProps | undefined => {
  if (!raw) return undefined
  return {
    amountToRecipient: +ethers.utils.formatEther(raw[0]),
    amountToTreasury: +ethers.utils.formatEther(raw[1]),
    amountToBurn: +ethers.utils.formatEther(raw[2]),
    raw: {
      amountToRecipient: raw[0],
      amountToTreasury: raw[1],
      amountToBurn: raw[2],
    },
  }
}

export const sumCost = (commonCost: CommonCostProps | undefined): number | undefined => {
  if (commonCost === undefined) return undefined
  return commonCost.amountToBurn + commonCost.amountToRecipient + commonCost.amountToTreasury
}
