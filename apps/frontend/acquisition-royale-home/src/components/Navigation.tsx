import styled from 'styled-components'
import ToggleTheme from './ToggleTheme'
import ConnectButton from '../features/connect/ConnectButton'
import NetworkBox from '../features/connect/NetworkBox'
import { spacingIncrement } from '../utils/theme/utils'

const Wrapper = styled.div`
  display: flex;
  font-weight: ${({ theme }): number => theme.fontWeight.bold};
  justify-content: flex-end;
  margin-right: ${spacingIncrement(32)};
  margin-top: ${spacingIncrement(32)};
`

const Navigation: React.FC = () => (
  <Wrapper>
    <NetworkBox />
    <ConnectButton />
    <ToggleTheme />
  </Wrapper>
)

export default Navigation
