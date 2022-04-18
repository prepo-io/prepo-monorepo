import Div100vh from 'react-div-100vh'
import { Container as ChakraContainer } from '@chakra-ui/react'
import styled from 'styled-components'
import { layoutBorderOneStyles, layoutBorderTwoStyles } from './layout-borders'
import Header from '../Header'
import { spacingIncrement } from '../../utils/theme/theme-utils'

const Wrapper = styled(Div100vh)`
  :before {
    ${layoutBorderOneStyles};
  }
  :after {
    ${layoutBorderTwoStyles};
  }
`

const Container = styled.div`
  -webkit-box-align: stretch;
  align-items: stretch;
  background: linear-gradient(180deg, #191623 0%, #35376f 100%);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`

const InnerContainer = styled.div`
  position: unset;
`

export const MainContent = styled(ChakraContainer)`
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: ${spacingIncrement(8)} 0;
`

const Layout: React.FC = ({ children }) => (
  <Wrapper>
    <Container>
      <InnerContainer>
        <Header />
        <MainContent maxW="4xl">{children}</MainContent>
      </InnerContainer>
    </Container>
  </Wrapper>
)

export default Layout
