import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import Icon from '../../components/icon'
import { useRootStore } from '../../context/RootStoreProvider'
import { spacingIncrement } from '../../utils/theme/utils'

const Wrapper = styled.div`
  border-radius: ${({ theme }): string => `${theme.borderRadius}px`};
  display: inline-flex;
`

const Flex = styled.div`
  display: flex;
  height: ${spacingIncrement(24)};
`

const ConnectIconButton: React.FC = () => {
  const { uiStore, web3Store } = useRootStore()
  const { signerState } = web3Store
  const account = signerState.address

  const onClickLogin = (): void => {
    web3Store.connect()
  }

  const onOpenModal = (): void => {
    uiStore.setAccountModalOpen(true)
  }

  const onClick = account ? onOpenModal : onClickLogin

  return (
    <Wrapper>
      <Flex>
        <Icon name="wallet" onClick={onClick} />
      </Flex>
    </Wrapper>
  )
}

export default observer(ConnectIconButton)
