import { Address, BigInt } from '@graphprotocol/graph-ts'

export interface UpdatePositionParameters {
  tokenAddress: Address
  ownerAddress: Address
  amount: BigInt
}
