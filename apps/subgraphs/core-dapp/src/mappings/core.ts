import { updateLongShortPrices, updatePosition } from './accounting'
import { Swap } from '../generated/types/templates/UniswapV3Pool/UniswapV3Pool'
import { Pool } from '../generated/types/schema'
import { Transfer } from '../generated/types/PrePOMarketFactory/CollateralToken'

export function handleLongShortTokenTransfer(event: Transfer): void {
  updatePosition(event.params.to, event.address, event.params.value)
}

export function handleUniswapV3Swap(event: Swap): void {
  const pool = Pool.load(event.address.toHexString())
  if (pool === null) return // swaps irrelevant to prePO

  updateLongShortPrices(event, pool)
}
