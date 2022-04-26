import styled from 'styled-components'
import Lines from './Lines'
import { spacingIncrement } from '../utils/theme/utils'
import { media } from '../utils/theme/media'

const Title = styled.p`
  color: ${({ theme }): string => theme.color.accentPrimary};
  font-family: ${({ theme }): string => theme.fontFamily.primary};
  font-size: ${({ theme }): string => theme.fontSize.xl};
  font-weight: ${({ theme }): number => theme.fontWeight.bold};
  line-height: 1;
  margin-bottom: 0;
  padding: 0px ${spacingIncrement(8)};
  text-align: center;
  ${media.phone`
    font-size: ${({ theme }): string => theme.fontSize.base};
  `}
`

const Wrapper = styled.div`
  display: flex;
  width: 100%;
`
const FancyTitle: React.FC = ({ children }) => (
  <Wrapper>
    <Lines />
    <Title>{children}</Title>
    <Lines />
  </Wrapper>
)

export default FancyTitle
