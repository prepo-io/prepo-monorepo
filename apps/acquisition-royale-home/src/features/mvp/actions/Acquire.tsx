import { notification } from 'antd'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import styled from 'styled-components'
import EnterpriseRadio from '../../../components/EnterpriseRadio'
import { useRootStore } from '../../../context/RootStoreProvider'
import { INSUFFICIENT_MATIC } from '../../../utils/common-utils'
import ActionCard from '../ActionCard'
import { acquireActionDescription } from '../Descriptions'

const EnterpriseLabel = styled.span`
  font-size: ${({ theme }): string => theme.fontSize.base};
`

const toKeepOrBurn = (id?: number, keepId?: number): string => {
  if (id === undefined || keepId === undefined) return ''
  return id === keepId ? '(To keep)' : '(To burn)'
}

const Acquire: React.FC = () => {
  const { actionsStore, acquisitionRoyaleContractStore, enterprisesStore } = useRootStore()
  const { acquireButtonProps, acquireBalances, acquireCosts, acquireComparisons } = actionsStore
  const { competitionActiveEnterprise, signerActiveEnterprise } = enterprisesStore
  const { acquire, acquireKeepId, acquiring, setAcquireKeepId } = acquisitionRoyaleContractStore

  const handleAcquire = useCallback(async (): Promise<void> => {
    if (acquireButtonProps.disabled) return
    const acquired = await acquire()
    if (acquired) {
      notification.success({ message: 'Acquisition successful! 🎉' })
    }
  }, [acquire, acquireButtonProps])

  const input = (
    <EnterpriseRadio
      label={
        <EnterpriseLabel>
          Select one Enterprise to upgrade
          <br />
          (the other will be burnt)
        </EnterpriseLabel>
      }
      onSelect={(id): void => {
        if (signerActiveEnterprise !== undefined && competitionActiveEnterprise !== undefined) {
          setAcquireKeepId(id)
        }
      }}
      options={[
        {
          content: signerActiveEnterprise?.name || 'N/A',
          label: `Yours ${toKeepOrBurn(signerActiveEnterprise?.id, acquireKeepId)}`,
          value: signerActiveEnterprise?.id,
        },
        {
          content: competitionActiveEnterprise?.name || 'N/A',
          label: `Theirs ${toKeepOrBurn(competitionActiveEnterprise?.id, acquireKeepId)}`,
          value: competitionActiveEnterprise?.id,
        },
      ]}
      value={acquireKeepId}
    />
  )

  return (
    <ActionCard
      action={handleAcquire}
      balances={acquireBalances}
      buttonProps={acquireButtonProps}
      comparisons={acquireComparisons}
      costs={acquireCosts}
      input={input}
      description={acquireActionDescription}
      loading={acquiring}
      lowMatic={acquireButtonProps.children === INSUFFICIENT_MATIC}
      title="Compete & Acquire"
    />
  )
}

export default observer(Acquire)
