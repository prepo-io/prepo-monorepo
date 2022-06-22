import { BigDecimal } from '@graphprotocol/graph-ts'
import {
  ACTIONS_RECEIVE,
  ACTIONS_SEND,
  EVENTS_TRANSFER,
  HistoricalEventTypes,
  ONE_BI,
  ZERO_ADDRESS,
} from './constants'
import { CollateralToken, HistoricalEvent, Transaction } from '../generated/types/schema'

function getTransactionsForHistoricalEvent(
  historicalEvent: HistoricalEvent
): (Transaction | null)[] {
  return historicalEvent.transactions.map<Transaction | null>((id) => Transaction.load(id))
}

/**
 * Deposit flow conditions:
 * 1. Owner received collateral tokens
 * 2. Owner sent base token
 * 3. CollateralTokenContract received base token
 * 4. Collateral tokens sent to owner are minted from zero address
 */
export function isDeposit(historicalEvent: HistoricalEvent): boolean {
  const transactions = getTransactionsForHistoricalEvent(historicalEvent)
  let hasReceiveCollateralToken = false
  let hasSendBaseToken = false
  let userInputAmount: BigDecimal = historicalEvent.amount
  let userInputAmountUSD: BigDecimal = historicalEvent.amountUSD
  let receivedCollateral: string | null = null
  if (historicalEvent.txCount.le(ONE_BI)) return false
  for (let i = 0; i < transactions.length; i++) {
    const transaction = transactions[i]
    if (transaction !== null && transaction.event == EVENTS_TRANSFER) {
      // this transaction is about receiving collateral token
      if (
        !hasReceiveCollateralToken &&
        transaction.action == ACTIONS_RECEIVE &&
        transaction.collateralToken !== null
      ) {
        const mintedFromZeroAddress = transaction.senderAddress == ZERO_ADDRESS
        const recipientIsOwner = transaction.recipientAddress == transaction.ownerAddress
        hasReceiveCollateralToken = mintedFromZeroAddress && recipientIsOwner
        receivedCollateral = transaction.collateralToken
      }

      // this transaction is about sending base token
      if (
        !hasSendBaseToken &&
        transaction.action == ACTIONS_SEND &&
        transaction.baseToken !== null
      ) {
        const senderIsOwner = transaction.senderAddress == transaction.ownerAddress
        const recipientIsCollateralToken =
          CollateralToken.load(transaction.recipientAddress) !== null
        hasSendBaseToken = senderIsOwner && recipientIsCollateralToken
        if (hasSendBaseToken) {
          userInputAmount = transaction.amount
          userInputAmountUSD = transaction.amountUSD
          receivedCollateral = transaction.recipientAddress
        }
      }
    }
  }

  const valid = hasReceiveCollateralToken && hasSendBaseToken && receivedCollateral !== null
  if (valid) {
    historicalEvent.event = new HistoricalEventTypes().deposit
    historicalEvent.amount = userInputAmount
    historicalEvent.amountUSD = userInputAmountUSD
    historicalEvent.collateralToken = receivedCollateral
    historicalEvent.save()
  }
  return valid
}

/**
 * Withdraw flow conditions:
 * 1. Owner sent collateral tokens (burnt only - to zero address)
 * 2. Owner received base token (sent from collateral token contract)
 * 3. CollateralTokenContract sent baseToken to owner
 * 4. BurnAddress received collateralToken
 */
export function isWithdraw(historicalEvent: HistoricalEvent): boolean {
  const transactions = getTransactionsForHistoricalEvent(historicalEvent)

  let hasReceiveBaseToken = false
  let hasSendCollateralToken = false
  let userInputAmount: BigDecimal = historicalEvent.amount
  let userInputAmountUSD: BigDecimal = historicalEvent.amountUSD
  let sentCollateral: string | null = null
  for (let i = 0; i < transactions.length; i++) {
    const transaction = transactions[i]
    if (transaction !== null && transaction.event == EVENTS_TRANSFER) {
      // this transaction is about receiving baseToken
      if (
        !hasReceiveBaseToken &&
        transaction.action == ACTIONS_RECEIVE &&
        transaction.baseToken !== null
      ) {
        const sentFromCollateral = CollateralToken.load(transaction.senderAddress) !== null
        const recipientIsOwner = transaction.recipientAddress == transaction.ownerAddress
        hasReceiveBaseToken = sentFromCollateral && recipientIsOwner
        if (hasReceiveBaseToken) {
          sentCollateral = transaction.senderAddress
        }
      }

      if (
        !hasSendCollateralToken &&
        transaction.action == ACTIONS_SEND &&
        transaction.collateralToken !== null
      ) {
        const collateralTokenBurnt = transaction.recipientAddress == ZERO_ADDRESS
        const senderIsOwner = transaction.senderAddress == transaction.ownerAddress
        hasSendCollateralToken = collateralTokenBurnt && senderIsOwner

        if (hasSendCollateralToken) {
          userInputAmount = transaction.amount
          userInputAmountUSD = transaction.amountUSD
          sentCollateral = transaction.collateralToken
        }
      }
    }
  }

  const valid = hasReceiveBaseToken && hasSendCollateralToken && sentCollateral !== null
  if (valid) {
    historicalEvent.event = new HistoricalEventTypes().withdraw
    historicalEvent.amount = userInputAmount
    historicalEvent.amountUSD = userInputAmountUSD
    historicalEvent.collateralToken = sentCollateral
    historicalEvent.save()
  }
  return valid
}
