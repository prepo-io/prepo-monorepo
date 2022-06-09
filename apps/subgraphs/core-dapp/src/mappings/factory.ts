import { Address } from '@graphprotocol/graph-ts'
import { MarketAdded } from '../types/PrePOMarketFactory/PrePOMarketFactory'
import { Market, Pool, Token } from '../types/schema'
import {
  PrePOMarket as PrePOMarketTemplate,
  LongShortToken as LongShortTokenTemplate,
} from '../types/templates'
import { MarketCreated } from '../types/templates/PrePOMarket/PrePOMarket'
import { PoolCreated } from '../types/UniswapV3PoolFactory/UniswapV3PoolFactory'
import { COLLATERAL_TOKEN_ADDRESS, ZERO_BD } from '../utils/constants'
import { fetchTokenDecimals } from '../utils/LongShortToken'

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

  const token0Collateral = event.params.token0.equals(Address.fromString(COLLATERAL_TOKEN_ADDRESS))
  const token1Collateral = event.params.token1.equals(Address.fromString(COLLATERAL_TOKEN_ADDRESS))

  // irrelevant pools
  if (!token0Collateral && !token1Collateral) return
  const longShortTokenAddress = token0Collateral ? token1Address : token0Address
  const longShortToken = Token.load(longShortTokenAddress)

  // non long short token pool
  if (longShortToken === null) return
  const poolAddress = event.params.pool.toHexString()
  const pool = new Pool(poolAddress)
  pool.token = longShortToken.id
  pool.token0 = token0Address
  pool.token1 = token1Address
  pool.createdAtBlockNumber = event.block.number
  pool.createdAtTimestamp = event.block.timestamp

  pool.save()
  longShortToken.save()
}
