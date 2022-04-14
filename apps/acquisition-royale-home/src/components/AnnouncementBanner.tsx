import styled from 'styled-components'
import { BORDER_RADIUS_REM } from './layout/layout-borders'
import { LETTER_SPACE_PIXEL, spacingIncrement } from '../utils/theme/utils'

const Wrapper = styled.div`
  margin-top: 0.3rem;
  position: absolute;
  width: 100%;
`

const Container = styled.div`
  background-color: ${({ theme }): string => theme.color.accentPrimary};
  border-top-left-radius: ${BORDER_RADIUS_REM}rem;
  border-top-right-radius: ${BORDER_RADIUS_REM}rem;
  margin: ${spacingIncrement(2)};
  padding: ${spacingIncrement(8)};
`

const Text = styled.p`
  color: ${({ theme }): string => theme.color.primary};
  font-family: ${({ theme }): string => theme.fontFamily.secondary};
  font-size: ${({ theme }): string => theme.fontSize.sm};
  font-weight: ${({ theme }): number => theme.fontWeight.bold};
  letter-spacing: ${LETTER_SPACE_PIXEL};
  margin: 0;
  text-align: center;
  width: 100%;

  a {
    text-decoration: underline;
  }
`

const AnnouncementBanner: React.FC = ({ children }) => (
  <Wrapper>
    <Container>
      <Text>{children}</Text>
    </Container>
  </Wrapper>
)

export default AnnouncementBanner
