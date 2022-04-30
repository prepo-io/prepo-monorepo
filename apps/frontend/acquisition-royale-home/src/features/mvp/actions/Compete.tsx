import { notification } from 'antd'
import { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import ActionCard from '../ActionCard'
import Input from '../../../components/Input'
import { competeActionDescription } from '../Descriptions'
import { useRootStore } from '../../../context/RootStoreProvider'
import { numberInput } from '../../../utils/number-utils'
import MyEnterprises from '../MyEnterprises'
import Competition from '../Competition'

const CompeteAction: React.FC = () => {
  const { actionsStore, acquisitionRoyaleContractStore } = useRootStore()
  const { competeButtonProps, competeBalances, competeCosts, competeComparisons } = actionsStore
  const { compete, competeRp, competing, setCompeteRp } = acquisitionRoyaleContractStore

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target
    numberInput(value, setCompeteRp, { preventNegative: true })
  }

  const onCompete = useCallback(async (): Promise<void> => {
    if (competeButtonProps.disabled) return
    const competed = await compete()
    if (competed) {
      notification.success({ message: 'Attack successful! 🎉' })
      setCompeteRp('')
    }
  }, [compete, competeButtonProps.disabled, setCompeteRp])

  const input = (
    <Input
      onChange={handleInputChange}
      placeholder="How much RP do you want to use?"
      type="number"
      step="any"
      value={competeRp}
    />
  )

  return (
    <ActionCard
      action={onCompete}
      balances={competeBalances}
      buttonProps={competeButtonProps}
      comparisons={competeComparisons}
      costs={competeCosts}
      description={competeActionDescription}
      input={input}
      loading={competing}
      title="Compete"
    >
      <MyEnterprises />
      <Competition />
    </ActionCard>
  )
}

export default observer(CompeteAction)
