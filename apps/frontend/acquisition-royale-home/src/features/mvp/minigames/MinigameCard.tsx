import { observer } from 'mobx-react-lite'
import { MiniGame } from './games'
import ActionCard from '../ActionCard'
import { useRootStore } from '../../../context/RootStoreProvider'

type Props = {
  game: MiniGame
}

const MinigameCard: React.FC<Props> = ({ game: { key, title, buttonText, description } }) => {
  const { minigames } = useRootStore()

  const { eligible } = minigames[key]

  return (
    <ActionCard
      action={(): void => {
        console.log(eligible)
      }}
      description={description}
      expandable
      buttonProps={{
        children: buttonText,
        disabled: eligible === undefined,
        loading: eligible === undefined,
      }}
      title={title}
    />
  )
}

export default observer(MinigameCard)
