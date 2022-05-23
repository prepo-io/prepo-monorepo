import styled from 'styled-components'
import { generateDummyArray } from '../utils/enterprise-utils'
import { spacingIncrement } from '../utils/theme/utils'

type Props = {
  count?: number
}

const StyledLine = styled.div`
  background-color: ${({ theme }): string => theme.color.accentPrimary};
  height: ${spacingIncrement(1)};
  width: 100%;
`

const Wrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: inherit;
  justify-content: space-between;
  padding: ${spacingIncrement(3)} 0;
  width: 100%;
`

const Lines: React.FC<Props> = ({ count }) => {
  const lines = generateDummyArray(count || 2)
  return (
    <Wrapper>
      {lines.map((id) => (
        <StyledLine key={id} />
      ))}
    </Wrapper>
  )
}

export default Lines
