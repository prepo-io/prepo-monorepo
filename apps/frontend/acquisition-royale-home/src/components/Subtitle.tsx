import styled from 'styled-components'
import { media } from '../utils/theme/media'
import { spacingIncrement } from '../utils/theme/utils'

const StyledSubtitle = styled.p`
  color: ${({ theme }): string => theme.color.accentPrimary};
  font-size: ${({ theme }): string => theme.fontSize.md};
  font-weight: ${({ theme }): number => theme.fontWeight.semiBold};
  ${media.tablet`
    font-size: ${({ theme }): string => theme.fontSize.sm};
    margin-bottom: ${spacingIncrement(8)};
  `}
`

const Subtitle: React.FC = ({ children }) => <StyledSubtitle>{children}</StyledSubtitle>

export default Subtitle
