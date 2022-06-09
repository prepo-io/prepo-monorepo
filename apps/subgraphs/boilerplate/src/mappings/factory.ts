import { MarketAdded } from '../types/PrePOMarketFactory/PrePOMarketFactory'
import { DeployedMarket, Market, Token } from '../types/schema'
import { PrePOMarket as PrePOMarketTemplate } from '../types/templates'
import { MarketCreated } from '../types/templates/PrePOMarket/PrePOMarket'

export function handleMarketAdded(event: MarketAdded): void {
  const deployedMarket = new DeployedMarket(event.params.market.toHexString())
  deployedMarket.longShortHash = event.params.longShortHash.toHexString()
  deployedMarket.market = event.params.market.toHexString()
  PrePOMarketTemplate.create(event.params.market)
  deployedMarket.save()
}

export function handleMarketCreated(event: MarketCreated): void {
  const marketAddress = event.address.toHexString()
  const longTokenAddress = event.params.longToken.toHexString()
  const shortTokenAddress = event.params.shortToken.toHexString()

  const longToken = new Token(longTokenAddress)
  longToken.market = marketAddress

  const shortToken = new Token(shortTokenAddress)
  shortToken.market = marketAddress

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
