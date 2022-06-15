import { SupportedCurrencies } from './currency.types'

export type User = {
  balances: {
    [key in SupportedCurrencies]?: number
  }
}

export type Position = {
  id: string
  costBasis: number
  owner: string
  token: {
    id: string
  }
}

export type PositionCostBasis = {
  positions: Position[]
}
