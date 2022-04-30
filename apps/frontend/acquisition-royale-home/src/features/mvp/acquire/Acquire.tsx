import { notification } from 'antd'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import styled from 'styled-components'
import EnterpriseRadio from '../../../components/EnterpriseRadio'
import { useRootStore } from '../../../context/RootStoreProvider'
import { INSUFFICIENT_MATIC } from '../../../utils/common-utils'
import ActionCard from '../ActionCard'
import Competition from '../Competition'
import { acquireActionDescription } from '../Descriptions'
import MyEnterprises from '../MyEnterprises'

const EnterpriseLabel = styled.span`
  font-size: ${({ theme }): string => theme.fontSize.base};
`

const toKeepOrBurn = (id?: number, keepId?: number): string => {
  if (id === undefined || keepId === undefined) return ''
  return id === keepId ? '(to keep)' : '(to burn)'
}

const Acquire: React.FC = () => {
  const { acquireStore, acquisitionRoyaleContractStore, competitionStore, signerStore } =
    useRootStore()
  const { acquireButtonProps, acquireBalances, acquireCosts, acquireComparisons } = acquireStore
  const { competitionActiveEnterprise } = competitionStore
  const { signerActiveEnterprise } = signerStore
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
        if (signerActiveEnterprise && competitionActiveEnterprise) setAcquireKeepId(id)
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
      title="Acquire"
    >
      <MyEnterprises />
      <Competition />
    </ActionCard>
  )
}

export default observer(Acquire)
