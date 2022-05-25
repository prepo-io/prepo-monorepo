import { SupportedCurrencies } from './currency.types'

export type User = {
  balances: {
    [key in SupportedCurrencies]?: number
  }
}
