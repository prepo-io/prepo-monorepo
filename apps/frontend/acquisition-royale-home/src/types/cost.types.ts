import { BigNumber } from 'ethers'
import { IconName } from '../components/icon/icon.types'

export type CostName = 'matic' | 'rp'

export type CostDisplayProps = {
  iconName?: IconName
  name: string
}

export type CostProps = {
  balance: number
  cost: number
}

export type Costs = Partial<Record<CostName, CostProps>>
export type CostsDisplayDataType = Record<CostName, CostDisplayProps>

export type CommonCostProps = {
  amountToRecipient: number
  amountToTreasury: number
  amountToBurn: number
  raw: {
    amountToRecipient: BigNumber
    amountToTreasury: BigNumber
    amountToBurn: BigNumber
  }
}
