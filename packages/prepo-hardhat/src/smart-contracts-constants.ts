import { BigNumber, utils } from 'ethers'

const { formatBytes32String } = utils

const MAX_UINT64 = BigNumber.from(2).pow(64).sub(1)
const MAX_INT64 = BigNumber.from(2).pow(63).sub(1)
const MIN_INT64 = BigNumber.from(2).pow(63).mul(-1)
const MAX_UINT128 = BigNumber.from(2).pow(128).sub(1)
const ZERO = BigNumber.from(0)
const ONE = BigNumber.from(1)
const ZERO_HASH = formatBytes32String('')
const ONE_WEEK = BigNumber.from(60 * 60 * 24 * 7)

export const constants = {
  MAX_UINT64,
  MAX_INT64,
  MIN_INT64,
  MAX_UINT128,
  ZERO,
  ONE,
  ZERO_HASH,
  ONE_WEEK,
}
