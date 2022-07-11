import Dropdown from './Dropdown'
import Menu from './Menu'
import MarketIconTitle from './MarketIconTitle'
import { Market } from '../types/market.types'

type Props = {
  label?: string
  selectedMarket: Market
  markets: Market[]
  onSelectMarket?: (key: string) => unknown
}
const MarketDropdown: React.FC<Props> = ({
  label = 'Select Market',
  markets,
  onSelectMarket,
  selectedMarket,
}) => {
  const onClick = ({ key }: { key: string }): void => {
    if (typeof onSelectMarket === 'function') onSelectMarket(key)
  }
  const getMarketsDropdownMenu = (
    <Menu
      size="md"
      onClick={onClick}
      items={markets.map((market) => ({
        key: market.urlId,
        label: (
          <MarketIconTitle iconName={market.iconName} size="sm">
            {market.name}
          </MarketIconTitle>
        ),
      }))}
    />
  )

  return (
    <Dropdown label={label} overlay={getMarketsDropdownMenu} variant="outline" size="md">
      <MarketIconTitle iconName={selectedMarket.iconName} size="sm">
        {selectedMarket.name}
      </MarketIconTitle>
    </Dropdown>
  )
}

export default MarketDropdown
