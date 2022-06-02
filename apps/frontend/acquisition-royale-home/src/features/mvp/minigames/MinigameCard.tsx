import { SEC_IN_MS } from '@prepo-io/constants'
import { useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { MiniGame } from './games'
import ActionCard from '../ActionCard'
import { useRootStore } from '../../../context/RootStoreProvider'
import { DescriptionWithIcon } from '../Descriptions'
import useCountdown from '../../../hooks/useCountdown'
import { spacingIncrement } from '../../../utils/theme/utils'

type Props = {
  game: MiniGame
}

const GreenText = styled.span`
  color: ${({ theme }): string => theme.color.success};
`

const MessageBelowButton = styled.p`
  color: ${({ theme }): string => theme.color.accentPrimary};
  font-size: ${({ theme }): string => theme.fontSize.base};
  margin-bottom: 0;
  padding: ${spacingIncrement(12)};
  padding-bottom: 0;
  text-align: center;
`

const WhiteCenterText = styled.p`
  color: white;
  font-size: ${({ theme }): string => theme.fontSize.base};
  margin-bottom: 0;
  text-align: center;
`

const MinigameCard: React.FC<Props> = ({ game: { key, title, description, iconName } }) => {
  const { minigames } = useRootStore()
  const {
    buttonProps,
    claimableRewardAmount,
    curPeriodPayout,
    callToAction,
    proRata,
    rewardTokenSymbol,
  } = minigames[key]
  const { currActionCount, periodLength } = proRata
  const periodLengthInMs = periodLength * SEC_IN_MS
  const remainingTimeToNextPeriod = periodLengthInMs - (new Date().getTime() % periodLengthInMs)
  const nextPeriodStartTime = new Date().getTime() + remainingTimeToNextPeriod
  const nextPeriod = useCountdown(nextPeriodStartTime)

  const renderDescription = useMemo(() => {
    if (!description) return null
    if (!iconName) return description
    return <DescriptionWithIcon iconName={iconName}>{description}</DescriptionWithIcon>
  }, [description, iconName])

  const currentPayoutMessage = useMemo(
    () =>
      curPeriodPayout === undefined ? null : (
        <WhiteCenterText>
          Current payout per action:{' '}
          <GreenText>
            {curPeriodPayout.toFixed(4)} {rewardTokenSymbol}
          </GreenText>
        </WhiteCenterText>
      ),
    [curPeriodPayout, rewardTokenSymbol]
  )

  const messageBelowButton = useMemo(() => {
    if (claimableRewardAmount)
      return (
        <MessageBelowButton>
          Come back in {nextPeriod} to claim up to{' '}
          <GreenText>
            {claimableRewardAmount.toFixed(4)} {rewardTokenSymbol}
          </GreenText>{' '}
          based on your {currActionCount} actions this period.
        </MessageBelowButton>
      )
    if (periodLength !== undefined)
      return <MessageBelowButton>Next round starts in {nextPeriod}.</MessageBelowButton>

    return null
  }, [claimableRewardAmount, currActionCount, nextPeriod, periodLength, rewardTokenSymbol])

  return (
    <ActionCard
      action={(): Promise<void> => callToAction()}
      description={renderDescription}
      buttonProps={buttonProps}
      expandable
      messageAboveButton={currentPayoutMessage}
      messageBelowButton={messageBelowButton}
      title={title}
    />
  )
}

export default observer(MinigameCard)
