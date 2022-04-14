import { notification } from 'antd'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import ActionCard from '../ActionCard'
import { renameActionDescription } from '../Descriptions'
import Input from '../../../components/Input'
import { useRootStore } from '../../../context/RootStoreProvider'

const Rename: React.FC = () => {
  const { acquisitionRoyaleContractStore, actionsStore } = useRootStore()
  const { newName, renaming } = acquisitionRoyaleContractStore
  const { renameButtonProps, renameBalances, renameComparisons, renameCosts } = actionsStore

  const handleOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      acquisitionRoyaleContractStore.setNewName(e.target.value)
    },
    [acquisitionRoyaleContractStore]
  )

  const handleRename = useCallback(async () => {
    const renamed = await acquisitionRoyaleContractStore.rename()
    if (renamed) {
      notification.success({ message: 'Rename success! 🎉' })
    }
  }, [acquisitionRoyaleContractStore])

  const input = (
    <Input onChange={handleOnChange} placeholder="What's the new name?" value={newName} />
  )

  return (
    <ActionCard
      action={handleRename}
      balances={renameBalances}
      buttonProps={renameButtonProps}
      comparisons={renameComparisons}
      costs={renameCosts}
      description={renameActionDescription}
      input={input}
      loading={renaming}
      title="Rename"
    />
  )
}

export default observer(Rename)
