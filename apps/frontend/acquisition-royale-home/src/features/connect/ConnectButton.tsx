import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import Identicon from './Identicon'
import Button from '../../components/Button'
import { getShortAccount } from '../../utils/account-utils'
import { useRootStore } from '../../context/RootStoreProvider'
import { spacingIncrement } from '../../utils/theme/utils'

type Props = {
  block?: boolean
  rounded?: boolean
}

const Wrapper = styled.div<{ block?: boolean }>`
  border-radius: ${({ theme }): string => `${theme.borderRadius}px`};
  display: inline-flex;
  ${({ block }): string => (block ? 'width: 100%;' : '')}
`

const Flex = styled.div<{ block?: boolean }>`
  display: flex;
  ${({ block }): string => (block ? 'width: 100%;' : '')}
`

const AccountIcon = styled(Identicon)`
  margin-left: ${spacingIncrement(16)};
`

const ConnectButton: React.FC<Props> = ({ block, rounded }) => {
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
    <Wrapper block={block}>
      <Flex block={block}>
        <Button block={block} onClick={onClick} rounded={rounded} size="large">
          {getShortAccount(account) ?? 'Connect Wallet'}
          <AccountIcon />
        </Button>
      </Flex>
    </Wrapper>
  )
}

export default observer(ConnectButton)
