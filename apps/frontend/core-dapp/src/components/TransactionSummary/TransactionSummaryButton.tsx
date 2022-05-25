import { Button, ButtonProps } from '@prepo-io/ui'
import { observer } from 'mobx-react-lite'
import { UnlockOptions } from '../UnlockTokens'
import { useRootStore } from '../../context/RootStoreProvider'

type Props = {
  buttonText?: string
  disabled?: boolean
  loading?: boolean
  onClick: () => void
  unlock?: UnlockOptions
} & ButtonProps

const TransactionSummaryButton: React.FC<Props> = ({
  buttonText = 'Continue',
  disabled,
  loading = false,
  onClick,
  unlock,
}) => {
  const { web3Store } = useRootStore()
  const { connected } = web3Store
  const emptyAmount = unlock && unlock.amount === 0
  const amountBigNumber = unlock && unlock.token.parseUnits(`${unlock.amount}`)
  const insufficientBalance =
    unlock && amountBigNumber ? amountBigNumber.gt(unlock.token.tokenBalanceRaw || 0) : false
  const disableButton = loading || !connected || disabled || insufficientBalance || emptyAmount

  const getText = (): string => {
    if (!connected) return 'Connect Your Wallet'
    if (loading) return 'Loading'
    if (insufficientBalance) return 'Insufficient Balance'
    if (emptyAmount) return 'Enter an Amount'
    return buttonText
  }

  return (
    <Button
      block
      type="primary"
      size="md"
      onClick={onClick}
      loading={loading && connected}
      disabled={disableButton}
    >
      {getText()}
    </Button>
  )
}

export default observer(TransactionSummaryButton)
