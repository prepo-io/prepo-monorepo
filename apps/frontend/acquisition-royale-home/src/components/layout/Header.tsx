import { Layout } from 'antd'
import styled from 'styled-components'
import Link from 'next/link'
import { contentCss } from './utils'
import Icon from '../icon'
import { centered, LETTER_SPACE_PIXEL, spacingIncrement } from '../../utils/theme/utils'
import ConnectButton from '../../features/connect/ConnectButton'
import { media } from '../../utils/theme/media'
import FancyTitle from '../FancyTitle'
import ConnectIconButton from '../../features/connect/ConnectIconButton'
import AccountModal from '../../features/connect/AccountModal'
import useResponsive from '../../hooks/useResponsive'
import AnnouncementBanner from '../AnnouncementBanner'
import { useRootStore } from '../../context/RootStoreProvider'

const { Header: AHeader } = Layout

const OnlyShowOnMobile = styled.div`
  display: none;
  ${media.phone`
      display: flex;
  `}
`

const FancyTitleWrapper = styled(OnlyShowOnMobile)`
  flex: 1;
`

const HiddenOnMobile = styled.div`
  ${media.phone`
    display: none;
  `}
`

const IconWrapper = styled(Icon)`
  ${centered}
  padding-right: ${spacingIncrement(16)};
`

const LeftWrapper = styled.div`
  ${centered}
`

const LogoWrapper = styled.div`
  ${centered}
  cursor: pointer;
`

const RowHeader = styled(AHeader)`
  align-items: center;
  display: flex;
  justify-content: space-between;
`

const Title = styled.div`
  ${centered}
  color: ${({ theme }): string => theme.color.accentPrimary};
  font-family: ${({ theme }): string => theme.fontFamily.secondary};
  font-size: ${({ theme }): string => theme.fontSize.xl};
  font-weight: ${({ theme }): number => theme.fontWeight.bold};
  letter-spacing: ${LETTER_SPACE_PIXEL};
  line-height: 110%; /* same value as on landing page */
  margin-top: ${spacingIncrement(5)};
  padding-right: ${spacingIncrement(9)};
`

const WalletIconWrapper = styled.div`
  height: ${spacingIncrement(24)};
  padding-left: ${spacingIncrement(16)};
`

const Wrapper = styled.div<{ showAnnouncementBanner: boolean }>`
  &&& {
    padding: ${spacingIncrement(24)} 0;
    padding-top: ${({ showAnnouncementBanner }): string =>
      showAnnouncementBanner ? spacingIncrement(48) : '0'};
    .ant-layout-header {
      align-items: center;
      background-color: inherit;
      display: flex;
      height: ${spacingIncrement(54)};
      justify-content: space-between;
      ${contentCss}
    }
  }
`

const Header: React.FC = () => {
  const { isPhone } = useResponsive()
  const { uiStore } = useRootStore()
  const { showAnnouncementBanner } = uiStore

  return (
    <>
      {showAnnouncementBanner && (
        <AnnouncementBanner>
          The $PPO Token Sale Whitelist is now open!{' '}
          <a href="https://url.prepo.io/whitelist-ar" target="_blank" rel="noreferrer">
            Register here
          </a>
          .
        </AnnouncementBanner>
      )}
      <Wrapper showAnnouncementBanner={showAnnouncementBanner}>
        <RowHeader>
          <LeftWrapper>
            <Link href="https://prepo.io" passHref>
              <LogoWrapper>
                <IconWrapper
                  height={isPhone ? '24' : '35'}
                  width={isPhone ? '21' : '31'}
                  name="logo"
                />
                <HiddenOnMobile>
                  <Title as="h1">Presented by prePO</Title>
                </HiddenOnMobile>
              </LogoWrapper>
            </Link>
          </LeftWrapper>
          <FancyTitleWrapper>
            <FancyTitle>Presented by prePO</FancyTitle>
          </FancyTitleWrapper>
          <HiddenOnMobile>
            <ConnectButton rounded />
          </HiddenOnMobile>
          <OnlyShowOnMobile>
            <WalletIconWrapper>
              <ConnectIconButton />
            </WalletIconWrapper>
          </OnlyShowOnMobile>
        </RowHeader>
        <AccountModal />
      </Wrapper>
    </>
  )
}

export default Header
