import { notification } from 'antd'
import { useCallback, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import Select from '../../../components/Select'
import ActionCard from '../ActionCard'
import { mergeActionDescription } from '../Descriptions'
import { useRootStore } from '../../../context/RootStoreProvider'
import { INSUFFICIENT_MATIC } from '../../../utils/common-utils'
import { Enterprise } from '../../../types/enterprise.types'

const Merge: React.FC = () => {
  const { acquisitionRoyaleContractStore, enterprisesStore, mergeStore } = useRootStore()
  const [shouldClear, setShouldClear] = useState(false)
  const { mergeButtonProps, mergeBalances, mergeCosts, mergeComparisons } = mergeStore
  const { signerActiveEnterprise, signerEnterprises } = enterprisesStore
  const { merging } = acquisitionRoyaleContractStore

  const onSelect = (target: unknown): void => {
    const id: number = target as number
    enterprisesStore.setMergeTargetId(id)
  }

  const onClear = (): void => {
    setShouldClear(false)
    enterprisesStore.setMergeTargetId(undefined)
  }

  const onMerge = useCallback(async () => {
    if (mergeButtonProps.disabled) return
    const merged = await acquisitionRoyaleContractStore.merge()
    if (merged) {
      setShouldClear(true)
      notification.success({
        message: 'Merge successful! 🎉',
      })
    }
  }, [acquisitionRoyaleContractStore, mergeButtonProps.disabled])

  const options = useMemo(() => {
    if (!signerEnterprises || signerActiveEnterprise === undefined) return []
    const optionsList = []
    // this is used to prevent duplicate id during a list transition (e.g. merge)
    const optionsMap: { [id: number]: Enterprise } = {}
    for (let i = 0; i < signerEnterprises.length; i++) {
      const enterprise = signerEnterprises[i]
      if (
        enterprise &&
        enterprise.id !== signerActiveEnterprise.id &&
        optionsMap[enterprise.id] === undefined
      ) {
        optionsMap[enterprise.id] = enterprise
        optionsList.push({
          id: enterprise.id,
          filterValue: enterprise.name,
          displayContent: enterprise.name,
          searchValue: enterprise.name,
          value: enterprise.id,
        })
      }
    }
    return optionsList
  }, [signerActiveEnterprise, signerEnterprises])

  const input = (
    <Select
      placeholder="Select an enterprise to merge with"
      onSelect={onSelect}
      options={options}
      onClear={onClear}
      shouldClear={shouldClear}
    />
  )

  return (
    <ActionCard
      action={onMerge}
      balances={mergeBalances}
      buttonProps={mergeButtonProps}
      comparisons={mergeComparisons}
      costs={mergeCosts}
      description={mergeActionDescription}
      input={input}
      loading={merging}
      lowMatic={mergeButtonProps.children === INSUFFICIENT_MATIC}
      title="Merge"
    />
  )
}

export default observer(Merge)
