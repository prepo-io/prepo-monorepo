import { MarketAdded } from '../types/PrePOMarketFactory/PrePOMarketFactory'
import { DeployedMarket } from '../types/schema'
import { PrePOMarket as PrePOMarketTemplate } from '../types/templates'

export function handleMarketAdded(event: MarketAdded): void {
  const deployedMarket = new DeployedMarket(event.params.market.toString())
  deployedMarket.longShortHash = event.params.longShortHash.toString()
  PrePOMarketTemplate.create(event.params.market)
  deployedMarket.save()
}
