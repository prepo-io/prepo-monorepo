import { Market, SupportedMarketID } from '../types/market.types'

const prefakestock: Market = {
  address: 'PREFAKESTOCK_MARKET_ADDRESS',
  iconName: 'prefakestock',
  name: 'preFakeStock',
  type: 'preIPO',
  companyName: 'preFakeStock',
  urlId: 'prefakestock',
  long: {
    tokenAddress: 'PREFAKESTOCK_LONG_TOKEN',
    poolAddress: 'PREFAKESTOCK_LONG_POOL',
  },
  short: {
    tokenAddress: 'PREFAKESTOCK_SHORT_TOKEN',
    poolAddress: 'PREFAKESTOCK_SHORT_POOL',
  },
  static: {
    valuationRange: [15000000000, 45000000000],
  },
}

const prefaketoken: Market = {
  address: 'PREFAKETOKEN_MARKET_ADDRESS',
  iconName: 'prefaketoken',
  name: 'preFakeToken',
  type: 'preICO',
  companyName: 'preMarketName',
  urlId: 'prefaketoken',
  long: {
    tokenAddress: 'PREFAKETOKEN_LONG_TOKEN',
    poolAddress: 'PREFAKETOKEN_LONG_POOL',
  },
  short: {
    tokenAddress: 'PREFAKETOKEN_SHORT_TOKEN',
    poolAddress: 'PREFAKETOKEN_SHORT_POOL',
  },
  static: {
    valuationRange: [1000000000, 5000000000],
  },
}

export const markets = [prefakestock, prefaketoken]
export const marketsMap: { [key in SupportedMarketID]: Market } = { prefakestock, prefaketoken }
