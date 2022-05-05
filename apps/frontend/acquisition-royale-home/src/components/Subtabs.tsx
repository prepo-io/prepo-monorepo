import { TabPaneProps, Tabs, TabsProps } from 'antd'
import styled from 'styled-components'
import { CARDS_MAX_WIDTH } from '../lib/constants'
import { media } from '../utils/theme/media'
import { centered, spacingIncrement } from '../utils/theme/utils'

export type SubtabProps = {
  tab: string
  content: React.ReactNode
}

const { TabPane: ATabPane } = Tabs

const Wrapper = styled.div`
  &&& {
    .ant-tabs-tab-active::before,
    .ant-tabs-tab-active::after,
    .ant-tabs-nav::before {
      display: none !important;
    }
    .ant-tabs-tab-active > .ant-tabs-tab-btn {
      text-decoration: underline;
    }
    .ant-tabs-tab-btn {
      font-family: ${({ theme }): string => theme.fontFamily.secondary};
      font-size: ${({ theme }): string => theme.fontSize.xl};
      ${media.tablet`
        font-size: ${({ theme }): string => theme.fontSize.md};
      `}
    }

    .ant-tabs-nav {
      background-color: ${({ theme }): string => theme.color.primary};
      border: solid 1px ${({ theme }): string => theme.color.accentPrimary};
      border-top: none;
      left: 50%;
      max-width: ${spacingIncrement(CARDS_MAX_WIDTH)};
      position: relative;
      transform: translate(-50%);
    }
    .ant-tabs-nav {
      ${centered}
    }
    .ant-tabs-tab {
      margin: 0 ${spacingIncrement(32)} 0 0;
    }
    .ant-tabs-tab:first-child {
      margin-left: ${spacingIncrement(32)};
    }
  }
`

const SubTabPaneWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding-top: ${spacingIncrement(36)};
`

export const SubTabPane: React.FC<TabPaneProps> = ({ children, ...props }) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <ATabPane {...props}>
    <SubTabPaneWrapper>{children}</SubTabPaneWrapper>
  </ATabPane>
)

const Subtabs: React.FC<TabsProps & { subtabs: SubtabProps[] }> = ({ subtabs, ...props }) => (
  <Wrapper>
    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
    <Tabs centered animated={{ inkBar: false }} {...props}>
      {subtabs.map(({ content, tab }) => (
        <SubTabPane tab={tab} key={tab}>
          {content}
        </SubTabPane>
      ))}
    </Tabs>
  </Wrapper>
)

export default Subtabs
