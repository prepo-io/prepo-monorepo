import { updatePosition } from './accounting'
import { updateLongShortPrices } from './pricing'
import {
  addCollateralTransactions,
  addLongShortTokenTransactions,
  addSwapTransactions,
} from './transaction'
import { Swap } from '../generated/types/templates/UniswapV3Pool/UniswapV3Pool'
import { Transfer as CollateralTokenTransfer } from '../generated/types/templates/CollateralToken/CollateralToken'
import { Transfer as LongShortTokenTransfer } from '../generated/types/templates/LongShortToken/LongShortToken'
import { Pool } from '../generated/types/schema'

export function handleCollateralTokenTransfer(event: CollateralTokenTransfer): void {
  addCollateralTransactions(event)
}

export function handleLongShortTokenTransfer(event: LongShortTokenTransfer): void {
  updatePosition(event.params.to, event.address, event.params.value)
  addLongShortTokenTransactions(event)
}

export function handleUniswapV3Swap(event: Swap): void {
  const pool = Pool.load(event.address.toHexString())
  if (pool === null) return // irrelevant pool to prePO

  updateLongShortPrices(event, pool)
  addSwapTransactions(event, pool)
}
