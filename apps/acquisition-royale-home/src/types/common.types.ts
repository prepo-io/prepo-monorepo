import { BigNumber } from 'ethers'

export type PassiveRpPerDay = {
  max: number
  base: number
  acquisitions: number
  mergers: number
  raw: {
    max: BigNumber
    base: BigNumber
    acquisitions: BigNumber
    mergers: BigNumber
  }
}
