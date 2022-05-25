import { IconName } from '@prepo-io/ui'

export type HistoryEventItemType = 'deposit' | 'withdraw' | 'short' | 'long' | 'liquidity'
export type HistoryEventActionType = 'open' | 'close' | 'add'
export type HistoryEventType = {
  type: HistoryEventItemType
  action?: HistoryEventActionType
}
export type HistoryItem = {
  event: HistoryEventType
  amount: number
  timestamp: number
  asset: IconName // Either market or Currency
}
