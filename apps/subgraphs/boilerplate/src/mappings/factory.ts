import { MarketAdded } from '../types/PrePOMarketFactory/PrePOMarketFactory'
import { DeployedMarket, Market } from '../types/schema'
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
  const market = new Market(event.address.toHexString())
  market.longToken = event.params.longToken.toHexString()
  market.shortToken = event.params.shortToken.toHexString()
  market.ceilingLongPrice = event.params.ceilingLongPrice
  market.ceilingValuation = event.params.ceilingValuation
  market.expiryTime = event.params.expiryTime
  market.floorLongPrice = event.params.floorLongPrice
  market.floorValuation = event.params.floorValuation
  market.mintingFee = event.params.mintingFee
  market.redemptionFee = event.params.redemptionFee
  market.createdAtBlockNumber = event.block.number
  market.createdAtTimestamp = event.block.timestamp
  market.save()
}
