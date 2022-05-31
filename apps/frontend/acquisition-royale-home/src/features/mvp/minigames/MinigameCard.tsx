import { useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { MiniGame } from './games'
import ActionCard from '../ActionCard'
import { useRootStore } from '../../../context/RootStoreProvider'
import { DescriptionWithIcon } from '../Descriptions'

type Props = {
  game: MiniGame
}

const WhiteCenterText = styled.p`
  color: white;
  text-align: center;
`

const MinigameCard: React.FC<Props> = ({ game: { key, title, description, iconName } }) => {
  const { minigames } = useRootStore()
  const { buttonProps, doAction, curPeriodPayout } = minigames[key]

  const renderDescription = useMemo(() => {
    if (!description) return null
    if (!iconName) return description
    return <DescriptionWithIcon iconName={iconName}>{description}</DescriptionWithIcon>
  }, [description, iconName])

  const currentPayoutMessage = useMemo(
    () =>
      curPeriodPayout === undefined ? null : (
        <WhiteCenterText>Current payout per action: {curPeriodPayout}RP</WhiteCenterText>
      ),
    [curPeriodPayout]
  )

  return (
    <ActionCard
      action={(): Promise<void> => doAction()}
      description={renderDescription}
      buttonProps={buttonProps}
      expandable
      messageAboveButton={currentPayoutMessage}
      title={title}
    />
  )
}

export default observer(MinigameCard)
