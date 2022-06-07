import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { spacingIncrement, Button } from 'prepo-ui'
import Modal from '../../components/Modal'
import { useRootStore } from '../../context/RootStoreProvider'

const SubTitle = styled.div`
  color: ${({ theme }): string => theme.color.neutral1};
  font-size: ${({ theme }): string => theme.fontSize.sm};
`

const ModalSection = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: ${spacingIncrement(24)};
`

const AccountModal: React.FC = () => {
  const { web3Store } = useRootStore()
  const account = web3Store.signerState.address

  const { uiStore } = useRootStore()
  const { accountModalOpen } = uiStore

  const onClose = (): void => {
    uiStore.setAccountModalOpen(false)
  }

  const handleDeactivateAccount = (): void => {
    web3Store.disconnect()
    onClose()
  }

  return (
    <Modal
      title="Account"
      centered
      visible={accountModalOpen}
      onOk={onClose}
      onCancel={onClose}
      footer={null}
    >
      <ModalSection>
        <SubTitle>Connected</SubTitle>
        <Button type="text" size="xs" onClick={handleDeactivateAccount}>
          Disconnect
        </Button>
      </ModalSection>
      <ModalSection>
        <SubTitle>
          {account &&
            `${account.slice(0, 6)}...${account.slice(account.length - 4, account.length)}`}
        </SubTitle>
        <CopyToClipboard text={account ?? ''}>
          <Button type="text" size="xs">
            Copy to Clipboard
          </Button>
        </CopyToClipboard>
      </ModalSection>
    </Modal>
  )
}

export default observer(AccountModal)
