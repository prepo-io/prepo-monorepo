import { Tabs, TabsProps } from 'antd'
import { useState } from 'react'
import styled, { css } from 'styled-components'
import { CARDS_MAX_WIDTH } from '../lib/constants'
import { Z_INDEX } from '../utils/theme/general-settings'
import { media } from '../utils/theme/media'
import { spacingIncrement } from '../utils/theme/utils'

export const { TabPane } = Tabs
const ARROW_SIZE = 8
const ARROW_BORDER_WIDTH = 2

const arrowStyles = css`
  bottom: 0;
  content: '';
  display: inline-block;
  height: 0;
  left: 50%;
  position: absolute;
  transform: translateX(-50%);
  width: 0;
`

const Wrapper = styled.div<{ $showSubtabArrow: boolean }>`
  &&& {
    .ant-tabs-top > .ant-tabs-nav {
      margin-bottom: 0;
    }
    .ant-tabs-ink-bar,
    .ant-tabs-nav-operations {
      display: none;
    }
    .ant-tabs-tab-btn {
      color: ${({ theme }): string => theme.color.accentPrimary};
      font-size: ${({ theme }): string => theme.fontSize['2xl']};
      font-weight: ${({ theme }): number => theme.fontWeight.bold};
      position: relative;
      ${media.tablet`
        font-size: ${({ theme }): string => theme.fontSize.lg};
      `}
    }
    .ant-tabs-tab {
      opacity: 0.4;
    }
    .ant-tabs-tab-active {
      opacity: 1;
    }
    // border of subtab arrow
    .ant-tabs-tab-active::before {
      ${arrowStyles}
      ${({ $showSubtabArrow }): string => !$showSubtabArrow && 'display: none'};
      border-left: ${spacingIncrement(ARROW_SIZE)} solid transparent;
      border-right: ${spacingIncrement(ARROW_SIZE)} solid transparent;
      border-bottom: ${spacingIncrement(ARROW_SIZE)} solid
        ${({ theme }): string => theme.color.accentPrimary};
      z-index: ${Z_INDEX.arrowBorder};
    }
    // center of subtab arrow
    .ant-tabs-tab-active::after {
      ${arrowStyles}
      ${({ $showSubtabArrow }): string => !$showSubtabArrow && 'display: none'};
      border-left: ${spacingIncrement(ARROW_SIZE - ARROW_BORDER_WIDTH)} solid transparent;
      border-right: ${spacingIncrement(ARROW_SIZE - ARROW_BORDER_WIDTH)} solid transparent;
      border-bottom: ${spacingIncrement(ARROW_SIZE - ARROW_BORDER_WIDTH)} solid
        ${({ theme }): string => theme.color.primary};
      margin-top: ${spacingIncrement(ARROW_BORDER_WIDTH)};
      z-index: ${Z_INDEX.arrowFill};
    }
    // top border of subtabs
    .ant-tabs-nav::before {
      ${({ $showSubtabArrow }): string => !$showSubtabArrow && 'display: none'};
      border-color: ${({ theme }): string => theme.color.accentPrimary};
      left: 50%;
      max-width: ${spacingIncrement(CARDS_MAX_WIDTH)};
      transform: translateX(-50%);
      width: 100%;
    }
  }
`

const MainTab: React.FC<TabsProps & { subtabs?: string[] }> = ({
  defaultActiveKey,
  subtabs = [],
  ...props
}) => {
  const [activeKey, setActiveKey] = useState(defaultActiveKey)
  return (
    <Wrapper $showSubtabArrow={subtabs.includes(activeKey)}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Tabs
        defaultActiveKey={defaultActiveKey}
        onChange={setActiveKey}
        animated={{ inkBar: false }}
        {...props}
      />
    </Wrapper>
  )
}

export default MainTab
