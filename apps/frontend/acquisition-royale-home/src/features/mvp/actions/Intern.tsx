import { notification } from 'antd'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { useRootStore } from '../../../context/RootStoreProvider'
import useCountdown from '../../../hooks/useCountdown'
import { SEC_IN_MS } from '../../../lib/constants'
import { getNextStartDayTimestamp } from '../../../utils/date-utils'
import { spacingIncrement } from '../../../utils/theme/utils'
import ActionCard from '../ActionCard'
import { internDescription } from '../Descriptions'

const MessageBelowButton = styled.p`
  color: ${({ theme }): string => theme.color.accentPrimary};
  margin-bottom: 0;
  margin-top: ${spacingIncrement(8)};
  text-align: center;
`

// use a react component so we don't need to rerender the enter ActionCard every second, improving performance
const DayResetCountdown: React.FC = () => {
  const nextStartDay = getNextStartDayTimestamp() * SEC_IN_MS
  const resetPeriod = useCountdown(nextStartDay, { withSec: true })

  return <MessageBelowButton>Day resets in {resetPeriod}</MessageBelowButton>
}

const Intern: React.FC = () => {
  const { actionsStore, internContractStore } = useRootStore()
  const { internButtonProps } = actionsStore
  const { lastTask } = internContractStore

  const handleDoTask = async (): Promise<void> => {
    if (!internButtonProps.disabled) {
      const doneTask = await internContractStore.doTask()
      if (doneTask) {
        notification.success({
          message: `${lastTask ? 'Daily RP Claimed!' : 'Completed task!'} 💰`,
        })
      }
    }
  }

  return (
    <ActionCard
      action={handleDoTask}
      buttonProps={internButtonProps}
      description={internDescription}
      expandable
      title="Intern Tasks"
      messageBelowButton={<DayResetCountdown />}
    />
  )
}

export default observer(Intern)
