import { BigInt } from '@graphprotocol/graph-ts'
import {
  CollateralValidityChanged,
  MarketAdded,
} from '../types/PrePOMarketFactory/PrePOMarketFactory'
import { Market, Pool, Token, ValidCollateralToken } from '../types/schema'
import {
  PrePOMarket as PrePOMarketTemplate,
  LongShortToken as LongShortTokenTemplate,
  UniswapV3Pool as UniswapV3PoolTemplate,
} from '../types/templates'
import { MarketCreated } from '../types/templates/PrePOMarket/PrePOMarket'
import { PoolCreated } from '../types/UniswapV3PoolFactory/UniswapV3PoolFactory'
import { ZERO_BD, ZERO_BI } from '../utils/constants'
import { fetchTokenDecimals } from '../utils/LongShortToken'
import { CollateralToken } from '../types/PrePOMarketFactory/CollateralToken'

export function handleCollateralValidityChanged(event: CollateralValidityChanged): void {
  const collateralAddress = event.params.collateral.toHexString()
  let collateral = ValidCollateralToken.load(collateralAddress)
  if (event.params.allowed && collateral === null) {
    const collateralContract = CollateralToken.bind(event.params.collateral)
    const decimalsResult = collateralContract.try_decimals()
    const symbolResult = collateralContract.try_symbol()
    const nameResult = collateralContract.try_name()
    if (!decimalsResult.reverted && !symbolResult.reverted && !nameResult.reverted) {
      collateral = new ValidCollateralToken(collateralAddress)
      collateral.decimals = BigInt.fromI32(decimalsResult.value)
      collateral.name = nameResult.value
      collateral.symbol = symbolResult.value
      collateral.save()
    }
  }
}

export function handleMarketAdded(event: MarketAdded): void {
  PrePOMarketTemplate.create(event.params.market)
}

export function handleMarketCreated(event: MarketCreated): void {
  const marketAddress = event.address.toHexString()
  const longTokenAddress = event.params.longToken.toHexString()
  const shortTokenAddress = event.params.shortToken.toHexString()

  const longToken = new Token(longTokenAddress)
  longToken.market = marketAddress
  longToken.decimals = fetchTokenDecimals(event.params.longToken)
  longToken.priceUSD = ZERO_BD

  const shortToken = new Token(shortTokenAddress)
  shortToken.market = marketAddress
  shortToken.decimals = fetchTokenDecimals(event.params.shortToken)
  shortToken.priceUSD = ZERO_BD

  // start tracking transfer event of theses tokens
  LongShortTokenTemplate.create(event.params.longToken)
  LongShortTokenTemplate.create(event.params.shortToken)

  const market = new Market(marketAddress)
  market.longToken = longTokenAddress
  market.shortToken = shortTokenAddress
  market.ceilingLongPrice = event.params.ceilingLongPrice
  market.ceilingValuation = event.params.ceilingValuation
  market.expiryTime = event.params.expiryTime
  market.floorLongPrice = event.params.floorLongPrice
  market.floorValuation = event.params.floorValuation
  market.mintingFee = event.params.mintingFee
  market.redemptionFee = event.params.redemptionFee
  market.createdAtBlockNumber = event.block.number
  market.createdAtTimestamp = event.block.timestamp
  longToken.save()
  shortToken.save()
  market.save()
}

export function handlePoolCreated(event: PoolCreated): void {
  const token0Address = event.params.token0.toHexString()
  const token1Address = event.params.token1.toHexString()
  const token0 = Token.load(token0Address)
  const token1 = Token.load(token1Address)

  // irrelevant pools
  if (token0 === null && token1 === null) return
  const longShortTokenAddress = token0 === null ? token1Address : token0Address
  const longShortToken = Token.load(longShortTokenAddress)

  // non long short token pool
  if (longShortToken === null) return
  const poolAddress = event.params.pool.toHexString()
  const pool = new Pool(poolAddress)
  pool.token = longShortToken.id
  pool.token0 = token0Address
  pool.token1 = token1Address
  pool.token0Price = ZERO_BD
  pool.token1Price = ZERO_BD
  pool.sqrtPriceX96 = ZERO_BI
  pool.createdAtBlockNumber = event.block.number
  pool.createdAtTimestamp = event.block.timestamp

  UniswapV3PoolTemplate.create(event.params.pool)
  pool.save()
  longShortToken.save()
}
