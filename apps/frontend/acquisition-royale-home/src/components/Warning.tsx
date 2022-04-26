import styled from 'styled-components'
import { spacingIncrement } from '../utils/theme/utils'

const WarningText = styled.p`
  color: ${({ theme }): string => theme.color.error};
  font-size: ${({ theme }): string => theme.fontSize.base};
  letter-spacing: 1px;
  line-height: 1;
  margin-bottom: 0;
  margin-top: ${spacingIncrement(8)};
  text-align: center;
`

const Warning: React.FC = ({ children }) => <WarningText>{children}</WarningText>

export default Warning
