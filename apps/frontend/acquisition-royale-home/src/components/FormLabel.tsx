import styled from 'styled-components'
import { media } from '../utils/theme/media'
import { spacingIncrement } from '../utils/theme/utils'

const Label = styled.p`
  color: ${({ theme }): string => theme.color.white};
  font-family: ${({ theme }): string => theme.fontFamily.secondary};
  font-size: ${({ theme }): string => theme.fontSize.lg};
  font-weight: ${({ theme }): number => theme.fontWeight.medium};
  letter-spacing: 1px;
  line-height: 1;
  margin-bottom: ${spacingIncrement(8)};
  text-align: center;
  ${media.tablet`
    font-size: ${({ theme }): string => theme.fontSize.sm};
  `}
`

const FormLabel: React.FC = ({ children }) => <Label>{children}</Label>

export default FormLabel
