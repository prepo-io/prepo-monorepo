import styled from 'styled-components'
import { minigames } from './games'
import MinigameCard from './MinigameCard'
import Intern from '../actions/Intern'
import { spacingIncrement } from '../../../utils/theme/utils'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacingIncrement(32)};
`

const Minigames: React.FC = () => (
  <Wrapper>
    <Intern />
    {minigames.map((game) => (
      <MinigameCard key={game.key} game={game} />
    ))}
  </Wrapper>
)

export default Minigames
