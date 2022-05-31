import { notification } from 'antd'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import Input from '../../../components/Input'
import { useRootStore } from '../../../context/RootStoreProvider'
import { numberInput } from '../../../utils/number-utils'
import ActionCard from '../ActionCard'
import { withdrawActionDescription } from '../Descriptions'
import MyEnterprises from '../MyEnterprises'

const WithdrawRp: React.FC = () => {
  const { acquisitionRoyaleContractStore, withdrawStore } = useRootStore()
  const { setWithdrawAmount, withdrawing, withdraw, withdrawAmount, withdrawalBurnPercentage } =
    acquisitionRoyaleContractStore
  const { withdrawButtonProps, withdrawBalances, withdrawComparisons } = withdrawStore

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target
    numberInput(value, setWithdrawAmount, { preventNegative: true })
  }
  const onWithdraw = useCallback(async () => {
    if (withdrawButtonProps.disabled) return
    const withdrawn = await withdraw()
    if (withdrawn) {
      notification.success({
        message: 'Withdrawal successful! 🎉',
      })
    }
  }, [withdraw, withdrawButtonProps.disabled])

  const input = (
    <Input
      onChange={handleInputChange}
      placeholder="How much RP do you want to withdraw?"
      type="number"
      step="any"
      value={withdrawAmount}
      warning={
        withdrawalBurnPercentage
          ? `${withdrawalBurnPercentage * 100}% will be burnt as a tax.`
          : undefined
      }
    />
  )
  return (
    <ActionCard
      action={onWithdraw}
      balances={withdrawBalances}
      balanceLabel="Enterprise Balance"
      buttonProps={withdrawButtonProps}
      comparisons={withdrawComparisons}
      description={withdrawActionDescription}
      input={input}
      loading={withdrawing}
      title="Withdraw RP"
    >
      <MyEnterprises />
    </ActionCard>
  )
}

export default observer(WithdrawRp)
