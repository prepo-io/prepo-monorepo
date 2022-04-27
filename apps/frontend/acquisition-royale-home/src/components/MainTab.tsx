import { Tabs, TabsProps } from 'antd'
import styled from 'styled-components'
import { media } from '../utils/theme/media'

export const { TabPane } = Tabs

const Wrapper = styled.div`
  &&& {
    .ant-tabs-top > .ant-tabs-nav {
      margin-bottom: 0;
    }
    .ant-tabs-top > .ant-tabs-nav::before {
      display: none;
    }
    .ant-tabs-tab-btn {
      color: ${({ theme }): string => theme.color.accentPrimary};
      font-size: ${({ theme }): string => theme.fontSize['2xl']};
      font-weight: ${({ theme }): number => theme.fontWeight.bold};
      ${media.tablet`
        font-size: ${({ theme }): string => theme.fontSize.lg};
      `}
    }
    .ant-tabs-tab-btn[aria-selected*='false'] {
      opacity: 0.4;
    }
    .ant-tabs-ink-bar {
      display: none;
    }
    .ant-tabs-nav-operations {
      display: none;
    }
  }
`

const MainTab: React.FC<TabsProps> = ({ ...props }) => (
  <Wrapper>
    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
    <Tabs animated={{ inkBar: false }} {...props} />
  </Wrapper>
)

export default MainTab
