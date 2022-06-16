import { BigInt } from '@graphprotocol/graph-ts'

export function makeTransactionId(
  event: string,
  ownerAddress: string,
  transactionHash: string,
  logIndex: BigInt
): string {
  return `${event}-${ownerAddress}-${transactionHash}-${logIndex.toString()}`
}
