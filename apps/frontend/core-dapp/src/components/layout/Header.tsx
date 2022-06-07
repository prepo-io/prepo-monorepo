import { Layout } from 'antd'
import styled, { css } from 'styled-components'
import { coreDappTheme, Flex, media, spacingIncrement } from 'prepo-ui'
import Navigation from '../Navigation'
import ConnectButton from '../../features/connect/ConnectButton'
import PrePOLogo from '../PrePOLogo'
import NetworkDropdown from '../NetworkDropdown'
import { Routes } from '../../lib/routes'
import SettingsMenu from '../SettingsMenu'
import TestnetBanner from '../../features/testnet-onboarding/TestnetBanner'
import DynamicBanner from '../../features/testnet-onboarding/DynamicBanner'

const { Z_INDEX } = coreDappTheme

const { Header: AHeader } = Layout

const commonHeaderCss = css`
  align-items: center;
  background-color: ${({ theme }): string => theme.color.neutral10};
  border-bottom: 1px solid ${({ theme }): string => theme.color.accent2};
  display: flex;
  justify-content: space-between;
`

const Wrapper = styled.div`
  position: sticky;
  top: 0;
  z-index: ${Z_INDEX.navigation};
  .ant-layout-header {
    ${commonHeaderCss}
    height: ${spacingIncrement(72)};
    line-height: 1;
    padding: 0 ${spacingIncrement(32)};
  }
  ${media.tablet`
    .ant-layout-header {
      ${commonHeaderCss}
      height: min-content;
      padding: ${spacingIncrement(36)} ${spacingIncrement(64)};
    }
  `};
`

const Header: React.FC = () => (
  <>
    <TestnetBanner />
    <DynamicBanner />
    <Wrapper>
      <AHeader>
        <PrePOLogo href={Routes.Markets} showBeta />
        <Navigation />
        <Flex gap={8}>
          <NetworkDropdown />
          <ConnectButton />
          <SettingsMenu />
        </Flex>
      </AHeader>
    </Wrapper>
  </>
)

export default Header
