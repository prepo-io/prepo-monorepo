import { Address, BigInt } from '@graphprotocol/graph-ts'
import { DEFAULT_LONG_SHORT_DECIMALS } from './constants'
import { LongShortToken } from '../generated/types/templates/LongShortToken/LongShortToken'

export function fetchTokenDecimals(tokenAddress: Address): BigInt {
  const contract = LongShortToken.bind(tokenAddress)
  const result = contract.try_decimals()
  if (result.reverted) return BigInt.fromI32(DEFAULT_LONG_SHORT_DECIMALS)
  return BigInt.fromI32(result.value)
}
