/* eslint-disable react/jsx-props-no-spreading */
import { Menu as AMenu, MenuProps, MenuItemProps } from 'antd'
import styled, { css, DefaultTheme, FlattenInterpolation, ThemeProps } from 'styled-components'
import { spacingIncrement } from '@prepo-io/ui'

export const MenuItem: React.FC<MenuItemProps> = (props) => (
  <>
    <AMenu.Item {...props} />
    <AMenu.Divider />
  </>
)

type Props = {
  size?: 'sm' | 'md' | 'lg'
}

const sizeSmallStyles = css`
  .ant-dropdown-menu-item {
    height: ${spacingIncrement(39)};
  }
  .ant-dropdown-menu-title-content {
    font-size: ${({ theme }): string => theme.fontSize.xs};
  }
`

const sizeMediumStyles = css`
  .ant-dropdown-menu-item {
    height: ${spacingIncrement(60)};
  }
  .ant-dropdown-menu-title-content {
    font-size: ${({ theme }): string => theme.fontSize.base};
  }
`

const sizeLargeStyles = css`
  .ant-dropdown-menu-item {
    height: ${spacingIncrement(74)};
  }
  .ant-dropdown-menu-title-content {
    font-size: ${({ theme }): string => theme.fontSize.xl};
  }
`

const Wrapper = styled.div<Props>`
  &&& {
    ${({ size }): FlattenInterpolation<ThemeProps<DefaultTheme>> => {
      if (size === 'md') {
        return sizeMediumStyles
      }
      if (size === 'lg') {
        return sizeLargeStyles
      }
      return sizeSmallStyles
    }}
    .ant-dropdown-menu {
      background-color: ${({ theme }): string => theme.color.neutral9};
      border-radius: ${({ theme }): number => theme.borderRadius}px;
      padding: 0;
    }
    .ant-dropdown-menu-item-active {
      background-color: ${({ theme }): string => theme.color.neutral7};
    }
    .ant-dropdown-menu-item-divider {
      background-color: transparent;
      height: 2px;
      margin: 0;
      :last-child {
        display: none;
      }
    }
    .ant-dropdown-menu-title-content {
      color: ${({ theme }): string => theme.color.neutral2};
      font-weight: ${({ theme }): number => theme.fontWeight.medium};
    }
    .ant-dropdown-menu-item-selected,
    .ant-dropdown-menu-submenu-title-selected {
      background-color: inherit;
      .ant-dropdown-menu-title-content {
        color: ${({ theme }): string => theme.color.primaryWhite};
      }
    }
  }
`

const Menu: React.FC<MenuProps & Props> = ({ size, ...props }) => (
  <Wrapper size={size}>
    <AMenu {...props} />
  </Wrapper>
)

export default Menu
