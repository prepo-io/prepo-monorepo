import { observer } from 'mobx-react'
import { Button, Flex } from 'prepo-ui'
import { customStyles } from './StakeUnstakeNavigationButtons'
import { useRootStore } from '../../../context/RootStoreProvider'

const UnstakeButtons: React.FC = () => {
  const {
    unstakeStore: { isCurrentUnstakingValueValid, confirm, startCooldown },
    ppoStakingStore: {
      startingCooldown,
      isCooldownActive,
      fee,
      endCooldown,
      isWithdrawWindowActive,
    },
  } = useRootStore()

  if (isCooldownActive) {
    return (
      <Flex flexDirection="column" gap={8}>
        <Button
          type="primary"
          block
          customColors={{
            background: 'error',
            border: 'error',
            hoverBackground: 'error',
            hoverBorder: 'error',
          }}
        >
          {`Unstake Immediately for ${fee}% Total Fee`}
        </Button>
        <Button type="default" customColors={customStyles} block onClick={endCooldown}>
          Cancel Unstaking
        </Button>
      </Flex>
    )
  }

  if (isWithdrawWindowActive) {
    return (
      <Flex flexDirection="column" gap={8}>
        <Button type="primary" block onClick={endCooldown}>
          Cancel Unstaking
        </Button>
        <Button type="default" customColors={customStyles} block>
          Confirm Unstaking
        </Button>
      </Flex>
    )
  }

  const loading = startingCooldown
  const text = confirm ? 'Unstake PPO' : 'Begin Cooldown'
  const onClick = confirm ? (): void => {} : startCooldown
  return (
    <Button
      type={confirm ? 'primary' : 'default'}
      customColors={confirm ? undefined : customStyles}
      block
      disabled={loading || !isCurrentUnstakingValueValid}
      loading={loading}
      onClick={onClick}
    >
      {text}
    </Button>
  )
}
export default observer(UnstakeButtons)
