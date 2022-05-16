import { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import ActionCard from '../ActionCard'
import { reviveActionDescription } from '../Descriptions'
import { useRootStore } from '../../../context/RootStoreProvider'
import Competition from '../Competition'

const Revive: React.FC = () => {
  const { actionsStore, acquisitionRoyaleContractStore } = useRootStore()
  const { reviveButtonProps, reviveBalances, reviveCosts, reviveComparisons } = actionsStore

  const handleRevive = useCallback(async () => {
    if (reviveButtonProps.disabled) return
    await acquisitionRoyaleContractStore.revive()
  }, [acquisitionRoyaleContractStore, reviveButtonProps.disabled])

  return (
    <ActionCard
      action={handleRevive}
      balances={reviveBalances}
      buttonProps={reviveButtonProps}
      comparisons={reviveComparisons}
      costs={reviveCosts}
      description={reviveActionDescription}
      loading={acquisitionRoyaleContractStore.reviving}
      title="Revive"
    >
      <Competition label="Search for Enterprises to Revive:" hideRandom />
    </ActionCard>
  )
}

export default observer(Revive)
