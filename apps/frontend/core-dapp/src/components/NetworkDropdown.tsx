import styled from 'styled-components'
import { Icon, IconName, media, spacingIncrement, Typography } from 'prepo-ui'
import { useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { ChainId, NetworkType } from 'prepo-constants'
import Dropdown from './Dropdown'
import Menu from './Menu'
import { useRootStore } from '../context/RootStoreProvider'
import useResponsive from '../hooks/useResponsive'

type NetworkRef = {
  iconName: IconName
  supported: boolean
  name: string
  type: NetworkType
  chainId: ChainId
}

const StyledDropdown = styled(Dropdown)`
  &&& {
    background-color: transparent;
    border-color: ${({ theme }): string => theme.color.neutral7};
    height: ${spacingIncrement(38)};
    margin-left: ${spacingIncrement(16)};
    margin-right: ${spacingIncrement(8)};
    padding: ${spacingIncrement(4)};
    ${media.desktop`
      padding: ${spacingIncrement(8)};
    `}
    .ant-dropdown-trigger {
    }
    svg {
      fill: ${({ theme }): string => theme.color.neutral1};
    }
  }
`

const StyledText = styled(Typography)`
  border-bottom: 1px solid ${({ theme }): string => theme.color.primaryAccent};
  padding: ${spacingIncrement(12)} ${spacingIncrement(24)};
  text-transform: capitalize;
  width: 100%;
  ${media.desktop`
    border-bottom: none;
    padding: 0 ${spacingIncrement(8)};
  `}
`
const StyledMenu = styled(Menu)`
  &&&& {
    .ant-dropdown-menu-item-divider {
      background-color: ${({ theme }): string => theme.color.primaryAccent};
    }
    .ant-dropdown-menu-item {
      height: ${spacingIncrement(50)};
    }
  }
`

const iconNetworkMap: Record<NetworkType, IconName> = {
  arbitrum: 'arbitrum',
  ethereum: 'weth',
  bsc: 'binance',
  polygon: 'polygon',
  dai: 'dai',
}

const NOT_SUPPORTED_CHAIN_ID = -1

const comingSoonNetworks: NetworkRef[] = [
  {
    iconName: 'arbitrum',
    name: 'Arbitrum',
    supported: false,
    type: 'arbitrum',
    chainId: NOT_SUPPORTED_CHAIN_ID,
  },
]

const Item: React.FC<{ network: NetworkRef; selectedName: string }> = ({
  network: { name, supported, iconName },
  selectedName,
}) => {
  const selected = selectedName === name
  const color = selected ? 'primary' : 'neutral1'
  const iconSize = '24px'

  return (
    <StyledText
      variant="text-medium-md"
      display="flex"
      alignItems="center"
      gap={20}
      color={supported ? color : 'neutral5'}
    >
      <Icon name={iconName} width={iconSize} height={iconSize} />
      {name}
      {supported ? '' : ' (Coming Soon)'}
    </StyledText>
  )
}

const NetworkDropdown: React.FC = () => {
  const {
    web3Store,
    config: { supportedNetworks },
  } = useRootStore()
  const { network: selectedNetwork } = web3Store

  const selectNetwork = (id: ChainId): void => {
    const network = supportedNetworks.find(({ chainId }) => chainId === id)
    if (network) {
      web3Store.setNetwork(network)
    }
  }

  const allNetworks = useMemo(
    () =>
      supportedNetworks
        .map<NetworkRef>(({ name, chainId, type = 'ethereum' }) => ({
          type,
          chainId,
          name,
          iconName: iconNetworkMap[type],
          supported: true,
        }))
        .concat(comingSoonNetworks),
    [supportedNetworks]
  )
  const { isDesktop } = useResponsive()

  const marketsDropdownMenu = (
    <StyledMenu
      size="md"
      items={allNetworks.map((network) => ({
        key: network.name,
        disabled: !network.supported,
        onClick: (): void => selectNetwork(network.chainId),
        label: <Item network={network} selectedName={selectedNetwork.name} />,
      }))}
    />
  )

  const iconSize = '24px'
  const iconName = iconNetworkMap[selectedNetwork.type ?? 'ethereum']

  return (
    <StyledDropdown overlay={marketsDropdownMenu} variant="outline" size="md" placement="bottom">
      <Typography
        variant="text-medium-base"
        display="flex"
        alignItems="center"
        color="neutral1"
        gap={4}
        style={{ textTransform: 'capitalize' }}
      >
        <Icon name={iconName} width={iconSize} height={iconSize} />
        {isDesktop ? selectedNetwork.name : ''}
      </Typography>
    </StyledDropdown>
  )
}

export default observer(NetworkDropdown)
