import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { CollateralToken, Transaction } from '../generated/types/schema'
import { Transfer as CollateralTokenTransfer } from '../generated/types/templates/CollateralToken/CollateralToken'
import { ACTIONS_RECEIVE, ACTIONS_SEND, EVENTS_TRANSFER } from '../utils/constants'

export function makeTransactionId(
  event: string,
  ownerAddress: string,
  transactionHash: string,
  logIndex: BigInt
): string {
  return `${event}-${ownerAddress}-${transactionHash}-${logIndex.toString()}`
}

export function makeTransaction(
  event: ethereum.Event,
  ownerAddress: Address,
  action: string
): Transaction {
  const contractAddress = event.address.toHexString()
  const hashString = event.transaction.hash.toHexString()
  const ownerAddressString = ownerAddress.toHexString()
  const id = makeTransactionId(action, ownerAddressString, hashString, event.transactionLogIndex)
  const transaction = new Transaction(id)

  transaction.action = action
  transaction.createdAtBlockNumber = event.block.number
  transaction.createdAtTimestamp = event.block.timestamp
  transaction.hash = hashString
  transaction.ownerAddress = ownerAddressString
  transaction.tokenAddress = contractAddress

  return transaction
}

export function addCollateralTransactions(event: CollateralTokenTransfer): void {
  const collateralToken = CollateralToken.load(event.address.toHexString())
  if (collateralToken === null) return

  const fromTransaction = makeTransaction(event, event.params.from, ACTIONS_SEND)
  const toTransaction = makeTransaction(event, event.params.to, ACTIONS_RECEIVE)

  const valueBD = event.params.value.toBigDecimal()

  fromTransaction.amount = valueBD
  fromTransaction.amountUSD = valueBD
  fromTransaction.baseTokenAddress = collateralToken.baseToken
  fromTransaction.event = EVENTS_TRANSFER
  fromTransaction.save()

  toTransaction.amount = valueBD
  toTransaction.amountUSD = valueBD
  toTransaction.baseTokenAddress = collateralToken.baseToken
  toTransaction.event = EVENTS_TRANSFER
  toTransaction.save()
}
