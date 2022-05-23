import { notification } from 'antd'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import ActionCard from '../ActionCard'
import { rebrandActionDescription } from '../Descriptions'
import Input from '../../../components/Input'
import { useRootStore } from '../../../context/RootStoreProvider'

const Rebrand: React.FC = () => {
  const { acquisitionRoyaleContractStore, actionsStore } = useRootStore()
  const { rebrandAddress, rebranding } = acquisitionRoyaleContractStore
  const { rebrandButtonProps, rebrandBalances, rebrandComparisons, rebrandCosts } = actionsStore

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    acquisitionRoyaleContractStore.setRebrandAddress(e.target.value)
  }

  const handleRebrand = useCallback(async (): Promise<void> => {
    const rebranded = await acquisitionRoyaleContractStore.rebrand()
    if (rebranded) {
      notification.success({ message: 'Rebrand successful! 🎉' })
    }
  }, [acquisitionRoyaleContractStore])

  const input = (
    <Input onChange={handleChange} placeholder="Branding address" value={rebrandAddress} />
  )

  return (
    <ActionCard
      action={handleRebrand}
      balances={rebrandBalances}
      buttonProps={rebrandButtonProps}
      comparisons={rebrandComparisons}
      costs={rebrandCosts}
      description={rebrandActionDescription}
      input={input}
      loading={rebranding}
      title="Rebrand"
    />
  )
}

export default observer(Rebrand)
