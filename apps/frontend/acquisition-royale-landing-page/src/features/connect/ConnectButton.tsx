import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../context/RootStoreProvider'
import Button from '../../components/Button'

const ConnectButton: React.FC = () => {
  const { web3Store } = useRootStore()

  const onClickLogin = (): void => {
    web3Store.connect()
  }

  return (
    <Button type="button" onClick={onClickLogin}>
      Connect Wallet
    </Button>
  )
}

export default observer(ConnectButton)
