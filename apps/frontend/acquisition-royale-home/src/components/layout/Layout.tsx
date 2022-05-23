import { Layout as ALayout } from 'antd'
import { useEffect } from 'react'
import styled from 'styled-components'
import Footer from './Footer'
import Header from './Header'
import { layoutBorderOneStyles, layoutBorderTwoStyles } from './layout-borders'
import { contentCss } from './utils'
import { useRootStore } from '../../context/RootStoreProvider'

const { Content } = ALayout

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  &&& {
    .ant-layout {
      background: none;
    }
    .ant-layout-content {
      ${contentCss}
    }
  }
  :before {
    ${layoutBorderOneStyles};
  }
  :after {
    ${layoutBorderTwoStyles};
  }
`

const Background = styled.div`
  background: ${({ theme }): string =>
    `linear-gradient(180deg, ${theme.color.backgroundGradientStart} 0%, ${theme.color.backgroundGradientEnd} 100%)`};
  height: 100vh;
  left: 0;
  position: fixed;
  top: 0;
  width: 100vw;
  z-index: -1;
`

export const InnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

export const MainContent = styled(Content)``

const Layout: React.FC = ({ children }) => {
  const { uiStore } = useRootStore()

  useEffect(() => {
    uiStore.setShowAnnouncementBanner(true)
  }, [uiStore])

  return (
    <Wrapper>
      <ALayout>
        <Header />
        <InnerWrapper>
          <Background />
          <MainContent>{children}</MainContent>
        </InnerWrapper>
        <Footer />
      </ALayout>
    </Wrapper>
  )
}

export default Layout
