import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { CollateralToken, Pool, Token, Transaction } from '../generated/types/schema'
import { Transfer as CollateralTokenTransfer } from '../generated/types/templates/CollateralToken/CollateralToken'
import { Transfer as LongShortTokenTransfer } from '../generated/types/templates/LongShortToken/LongShortToken'
import {
  ACTIONS_CLOSE,
  ACTIONS_OPEN,
  ACTIONS_RECEIVE,
  ACTIONS_SEND,
  EVENTS_SWAP,
  EVENTS_TRANSFER,
  ZERO_BD,
} from '../utils/constants'
import { Swap } from '../generated/types/templates/UniswapV3Pool/UniswapV3Pool'

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

export function addLongShortTokenTransactions(event: LongShortTokenTransfer): void {
  const longShortToken = Token.load(event.address.toHexString())
  if (longShortToken === null) return

  const fromTransaction = makeTransaction(event, event.params.from, ACTIONS_SEND)
  const toTransaction = makeTransaction(event, event.params.to, ACTIONS_RECEIVE)

  const valueBD = event.params.value.toBigDecimal()
  const valueUSD = longShortToken.priceUSD.times(valueBD)

  fromTransaction.amount = valueBD
  fromTransaction.amountUSD = valueUSD
  fromTransaction.event = EVENTS_TRANSFER
  fromTransaction.market = longShortToken.market
  fromTransaction.save()

  toTransaction.amount = valueBD
  toTransaction.amountUSD = valueUSD
  toTransaction.event = EVENTS_TRANSFER
  toTransaction.market = longShortToken.market
  toTransaction.save()
}

export function addSwapTransactions(event: Swap, pool: Pool): void {
  const token = Token.load(pool.token)
  if (token === null) return // impossible

  const amount0BD = event.params.amount0.toBigDecimal()
  const amount1BD = event.params.amount1.toBigDecimal()

  const longShortTokenIsToken0 = pool.token === pool.token0

  const collateralAmountBD = longShortTokenIsToken0 ? amount1BD : amount0BD
  const longShortTokenAmountBD = longShortTokenIsToken0 ? amount0BD : amount1BD

  const closing = collateralAmountBD.lt(ZERO_BD)

  const transaction = makeTransaction(
    event,
    event.params.sender,
    closing ? ACTIONS_CLOSE : ACTIONS_OPEN
  )

  const amountBD = closing ? collateralAmountBD : longShortTokenAmountBD
  const amountUSD = closing ? token.priceUSD.times(longShortTokenAmountBD) : collateralAmountBD

  transaction.amount = amountBD
  transaction.amountUSD = amountUSD
  transaction.event = EVENTS_SWAP
  transaction.pool = pool.id
  transaction.tokenAddress = pool.token

  transaction.save()
}
