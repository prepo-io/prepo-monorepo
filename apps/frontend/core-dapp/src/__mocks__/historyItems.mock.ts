import { HistoryItem } from '../features/history/history.types'

export const historyItemsMock: HistoryItem[] = [
  {
    event: {
      type: 'deposit',
    },
    amount: 10000,
    timestamp: 1639471218,
    asset: 'usdt',
  },
  {
    event: {
      type: 'withdraw',
    },
    amount: 10000,
    timestamp: 1639461218,
    asset: 'dai',
  },
  {
    event: {
      action: 'open',
      type: 'short',
    },
    amount: 2000,
    timestamp: 1639451218,
    asset: 'spacex',
  },
  {
    event: {
      action: 'add',
      type: 'liquidity',
    },
    amount: 78000,
    timestamp: 1639441218,
    asset: 'opensea',
  },
  {
    event: {
      action: 'close',
      type: 'long',
    },
    amount: 5000,
    timestamp: 1639431218,
    asset: 'zapper',
  },
]
