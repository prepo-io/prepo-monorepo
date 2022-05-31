import styled from 'styled-components'
import { minigames } from './games'
import MinigameCard from './MinigameCard'
import Intern from '../actions/Intern'
import { spacingIncrement } from '../../../utils/theme/utils'

const ComingSoon = styled.p`
  color: ${({ theme }): string => theme.color.accentPrimary};
  font-family: ${({ theme }): string => theme.fontFamily.secondary};
  font-size: ${({ theme }): string => theme.fontSize.lg};
  padding: 0 ${spacingIncrement(20)};
  text-align: center;
`

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
    <ComingSoon>More earning minigames coming soon!</ComingSoon>
  </Wrapper>
)

export default Minigames
