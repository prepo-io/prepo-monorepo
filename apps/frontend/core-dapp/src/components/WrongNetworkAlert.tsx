import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { Alert, Icon } from 'prepo-ui'
import { useRootStore } from '../context/RootStoreProvider'

const Text = styled.span<{ highlight?: boolean }>`
  color: ${({ theme, highlight }): string =>
    highlight ? theme.color.primary : theme.color.neutral3};
  cursor: ${({ highlight }): string => (highlight ? 'pointer' : 'unset')};
`

const Message: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <Text>
    {'You are connected to the wrong network, '}
    <Text highlight onClick={onClick}>
      Switch to Polygon
    </Text>
    .
  </Text>
)

const WrongNetworkAlert: React.FC = () => {
  const { web3Store } = useRootStore()
  if (web3Store.isNetworkSupported) {
    return null
  }
  const onClick = (): void => {
    web3Store.init()
  }
  return (
    <Alert
      icon={<Icon name="info" color="warning" />}
      type="warning"
      showIcon
      message={<Message onClick={onClick} />}
    />
  )
}

export default observer(WrongNetworkAlert)
