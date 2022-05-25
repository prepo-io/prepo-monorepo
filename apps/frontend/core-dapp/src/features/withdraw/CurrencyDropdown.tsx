import CurrencyIconTitle from './CurrencyIconTitle'
import Menu, { MenuItem } from '../../components/Menu'
import Dropdown from '../../components/Dropdown'
import { Currency } from '../../types/currency.types'

type Props = {
  label?: string
  selectedCoin: Currency
  coins: Currency[]
  onSelectMarket?: (key: string) => unknown
}
const CurrencyDropdown: React.FC<Props> = ({
  label = 'Select Market',
  coins,
  onSelectMarket,
  selectedCoin,
}) => {
  const onClick = ({ key }: { key: string }): void => {
    if (typeof onSelectMarket === 'function') onSelectMarket(key)
  }
  const getMarketsDropdownMenu = (
    <Menu size="md" onClick={onClick}>
      {coins.map((coin) => (
        <MenuItem key={coin.id}>
          <CurrencyIconTitle iconName={coin.iconName}>{coin.name}</CurrencyIconTitle>
        </MenuItem>
      ))}
    </Menu>
  )

  return (
    <Dropdown label={label} overlay={getMarketsDropdownMenu} variant="outline" size="md">
      <CurrencyIconTitle iconName={selectedCoin.iconName}>{selectedCoin.name}</CurrencyIconTitle>
    </Dropdown>
  )
}

export default CurrencyDropdown
