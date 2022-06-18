import { updateLongShortPrices, updatePosition } from './accounting'
import {
  addBaseTokenTransactions,
  addCollateralTransactions,
  addLongShortTokenTransactions,
  addSwapTransactions,
} from './transaction'
import { Swap } from '../generated/types/templates/UniswapV3Pool/UniswapV3Pool'
import { Pool } from '../generated/types/schema'
import { Transfer as CollateralTokenTransfer } from '../generated/types/templates/CollateralToken/CollateralToken'
import { Transfer as LongShortTokenTransfer } from '../generated/types/templates/LongShortToken/LongShortToken'
import { Transfer as BaseTokenTransfer } from '../generated/types/templates/BaseToken/ERC20'

export function handleBaseTokenTransfer(event: BaseTokenTransfer): void {
  addBaseTokenTransactions(event)
}

export function handleCollateralTokenTransfer(event: CollateralTokenTransfer): void {
  addCollateralTransactions(event)
}

export function handleLongShortTokenTransfer(event: LongShortTokenTransfer): void {
  updatePosition(event.params.to, event.address, event.params.value)
  addLongShortTokenTransactions(event)
}

export function handleUniswapV3Swap(event: Swap): void {
  const pool = Pool.load(event.address.toHexString())
  if (pool === null) return // swaps irrelevant to prePO

  updateLongShortPrices(event, pool)
  addSwapTransactions(event, pool)
}
