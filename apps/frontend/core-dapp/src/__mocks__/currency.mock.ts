import { dai, ppo, usdc, usdt, weth } from '../lib/supported-currencies'
import { Currency } from '../types/currency.types'

export const altCoins = [weth, ppo] as const
export const altCoinsMap = { weth, ppo }

export const stableCoins = [usdc, usdt, dai]
export const stableCoinsMap = {
  usdc,
  usdt,
  dai,
}

export const allCoins = [...stableCoins, ...altCoins]
export const allCoinsMap = {
  ...stableCoinsMap,
  ...altCoinsMap,
}

export const coinsMock: readonly Currency[] = [ppo, weth, usdc, usdt, dai] as const
