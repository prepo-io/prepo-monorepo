import { Flex, Link, Text } from '@chakra-ui/react'
import { observer } from 'mobx-react-lite'
import styled, { css, FlattenSimpleInterpolation } from 'styled-components'
import AnnouncementBanner from './AnnouncementBanner'
import {
  BORDER_ONE_SPACE_REM,
  BORDER_RADIUS_REM,
  BORDER_TWO_SPACE_REM,
  layoutBorderOneStyles,
  layoutBorderTwoStyles,
} from './Layout/layout-borders'
import LogoIcon from './Icons/Logo'
import { useRootStore } from '../context/RootStoreProvider'
import useBreakpoint from '../hooks/useBreakpoint'
import usePageIsAtTop from '../hooks/usePageIsAtTop'
import { media } from '../utils/media'
import { Z_INDEX } from '../utils/theme/theme-constants'
import { PRIMARY_COLOR } from '../utils/theme/theme'

const headerBorderStyles = css`
  border-bottom: none;
  border-radius: 0;
  bottom: 0;
  filter: none;
  position: absolute;
`

type HeaderContainerProps = {
  isMobile: boolean
  isPageAtTop: boolean
  hasAnnouncement: boolean
}

export const HeaderContainer = styled.div<HeaderContainerProps>`
  background: ${({ isMobile, isPageAtTop }): string =>
    isMobile && !isPageAtTop ? '#191623' : 'transparent'};
  left: 0;
  position: absolute;
  top: ${({ hasAnnouncement, isMobile, isPageAtTop }): string =>
    hasAnnouncement && ((isMobile && isPageAtTop) || !isMobile) ? '2.5rem' : '0'};
  width: 100%;

  :before {
    ${({ isMobile, isPageAtTop }): FlattenSimpleInterpolation | false =>
      isMobile && !isPageAtTop && layoutBorderOneStyles};
    ${({ isMobile, isPageAtTop }): FlattenSimpleInterpolation | false =>
      isMobile && !isPageAtTop && headerBorderStyles};
    ${({ isMobile, isPageAtTop }): string | false =>
      isMobile && !isPageAtTop && `margin-bottom: -${BORDER_ONE_SPACE_REM}rem;`};
  }

  :after {
    ${({ isMobile, isPageAtTop }): FlattenSimpleInterpolation | false =>
      isMobile && !isPageAtTop && layoutBorderTwoStyles};
    ${({ isMobile, isPageAtTop }): FlattenSimpleInterpolation | false =>
      isMobile && !isPageAtTop && headerBorderStyles};
    ${({ isMobile, isPageAtTop }): string | false =>
      isMobile && !isPageAtTop && `margin-bottom: -${BORDER_TWO_SPACE_REM}rem;`};
    ${({ isMobile, isPageAtTop }): string | false =>
      isMobile && !isPageAtTop && `border-top-left-radius: ${BORDER_RADIUS_REM}rem;`};
    ${({ isMobile, isPageAtTop }): string | false =>
      isMobile && !isPageAtTop && `border-top-right-radius: ${BORDER_RADIUS_REM}rem;`};
  }

  ${media.xl`
    position: fixed;
    z-index: ${Z_INDEX.HEADER};
  `}
`

const Header: React.FC = () => {
  const isPageAtTop = usePageIsAtTop()
  const breakpoint = useBreakpoint()
  const isDesktop = breakpoint === 'xl'
  const { uiStore } = useRootStore()
  const { showAnnouncementBanner } = uiStore

  const onClickLogo = (): void => {
    window.open('https://prepo.io/')
  }

  return (
    <>
      {showAnnouncementBanner && (
        <AnnouncementBanner>
          The $PPO Token Sale Whitelist is now open!{' '}
          <Text as="span" textDecoration="underline">
            <Link href="https://url.prepo.io/whitelist-ar" isExternal _focus={{ outline: 'none' }}>
              Register here
            </Link>
          </Text>
          .
        </AnnouncementBanner>
      )}
      <HeaderContainer
        isMobile={!isDesktop}
        isPageAtTop={isPageAtTop}
        hasAnnouncement={showAnnouncementBanner}
      >
        <Flex alignItems="center" justifyContent="space-between" px={4} py={6}>
          <Flex mr={4} ml={2}>
            <LogoIcon color={PRIMARY_COLOR} onClick={onClickLogo} />
          </Flex>
        </Flex>
      </HeaderContainer>
    </>
  )
}

export default observer(Header)
