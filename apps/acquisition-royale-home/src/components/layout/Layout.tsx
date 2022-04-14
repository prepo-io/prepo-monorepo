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

export const InnerWrapper = styled.div`
  background: ${({ theme }): string =>
    `linear-gradient(180deg, ${theme.color.backgroundGradientStart} 0%, ${theme.color.backgroundGradientEnd} 100%)`};
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
          <MainContent>{children}</MainContent>
        </InnerWrapper>
        <Footer />
      </ALayout>
    </Wrapper>
  )
}

export default Layout
