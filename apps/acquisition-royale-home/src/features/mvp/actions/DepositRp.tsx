import { notification } from 'antd'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import Input from '../../../components/Input'
import { useRootStore } from '../../../context/RootStoreProvider'
import { numberInput } from '../../../utils/number-utils'
import ActionCard from '../ActionCard'
import { depositActionDescription } from '../Descriptions'

const DepositRp: React.FC = () => {
  const { actionsStore, acquisitionRoyaleContractStore } = useRootStore()
  const { deposit, depositing, depositAmount, setDepositAmount } = acquisitionRoyaleContractStore
  const { depositButtonProps, depositBalances, depositComparisons } = actionsStore

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target
    numberInput(value, setDepositAmount, { preventNegative: true })
  }

  const onDeposit = useCallback(async () => {
    if (depositButtonProps.disabled) return
    const deposited = await deposit()
    if (deposited) {
      notification.success({
        message: 'Deposit successful! 🎉',
      })
    }
  }, [deposit, depositButtonProps.disabled])

  const input = (
    <Input
      onChange={handleInputChange}
      placeholder="How much RP do you want to deposit?"
      min="0"
      step="any"
      type="number"
      value={depositAmount}
    />
  )

  return (
    <ActionCard
      action={onDeposit}
      balances={depositBalances}
      buttonProps={depositButtonProps}
      comparisons={depositComparisons}
      description={depositActionDescription}
      input={input}
      loading={depositing}
      title="Deposit RP"
    />
  )
}

export default observer(DepositRp)
