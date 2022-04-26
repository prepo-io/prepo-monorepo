import { Modal } from 'antd'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../context/RootStoreProvider'
import { spacingIncrement } from '../../utils/theme/utils'

const SubTitle = styled.div`
  font-family: ${({ theme }): string => theme.fontFamily.secondary};
  font-size: ${({ theme }): string => theme.fontSize.md};
`

const ModalSection = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: ${spacingIncrement(24)};
`

const AccountModal: React.FC = () => {
  const { web3Store } = useRootStore()

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
      title="Disconnect Wallet?"
      centered
      visible={accountModalOpen}
      onOk={handleDeactivateAccount}
      onCancel={onClose}
    >
      <ModalSection>
        <SubTitle>Are you sure you want to disconnect your wallet?</SubTitle>
      </ModalSection>
    </Modal>
  )
}

export default observer(AccountModal)
