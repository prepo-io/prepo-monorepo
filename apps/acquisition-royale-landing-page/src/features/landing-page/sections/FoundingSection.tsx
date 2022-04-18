import { Flex } from '@chakra-ui/layout'
import styled from 'styled-components'
import * as Scroll from 'react-scroll'
import { observer } from 'mobx-react-lite'
import { SectionsEnum } from './SectionStore'
import useSection from '../../../hooks/useSection'
import { BORDER_WIDTH_PIXEL, spacingIncrement } from '../../../utils/theme/theme-utils'
import Founding from '../../found-enterprise/Founding'
import { BORDER_TWO_SPACE_REM } from '../../../components/Layout/layout-borders'
import { PRIMARY_COLOR } from '../../../utils/theme/theme'
import { SHOW_PLAY_BTN_DEFAULT } from '../../../lib/constants'

export const ScrollContainer = styled(Scroll.Element)`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin: ${spacingIncrement(3)} 0;
`
const SectionWrapper = styled.section``

const PlayButton = styled.a`
  border: ${BORDER_WIDTH_PIXEL} solid #f3d29d;
  color: ${PRIMARY_COLOR};
  content: ' ';
  filter: drop-shadow(rgb(230, 196, 149) 0px 0px 0rem);
  font-size: 1.56rem;
  font-weight: 800;
  inset: ${BORDER_TWO_SPACE_REM}rem;
  padding: ${`${spacingIncrement(1.25)} ${spacingIncrement(10)}`};
  position: relative;
  :hover {
    background-color: ${PRIMARY_COLOR};
    color: black;
    cursor: pointer;
  }

  text-align: center;
  transition: all 150ms ease-in-out;
  white-space: nowrap;
  width: 100%;
`

const FoundingSection: React.FC = () => {
  const { ref } = useSection(SectionsEnum.FOUNDING)

  const showGameButton = SHOW_PLAY_BTN_DEFAULT

  return (
    <ScrollContainer name="founding" as={SectionWrapper} ref={ref}>
      <Founding />
      {showGameButton ? (
        <Flex maxWidth="lg" mt={{ base: 4, md: 6 }} width="100%">
          <PlayButton href="https://play.acquisitionroyale.com" target="_blank">
            PLAY GAME
          </PlayButton>
        </Flex>
      ) : null}
      <Flex maxWidth="lg" mt={{ base: 3, md: 6 }} width="100%">
        <PlayButton href="https://docs.prepo.io/acquisition-royale" target="_blank">
          READ DOCS
        </PlayButton>
      </Flex>
    </ScrollContainer>
  )
}

export default observer(FoundingSection)
