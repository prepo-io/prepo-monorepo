import { Flex, Icon, IconName, spacingIncrement, ThemeModes } from '@prepo-io/ui'
import { Dropdown, Menu } from 'antd'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { useRootStore } from '../context/RootStoreProvider'
import useResponsive from '../hooks/useResponsive'
import { PREPO_DISCORD, PREPO_TWITTER, PREPO_WEBSITE } from '../lib/constants'
import { UiStore } from '../stores/UiStore'

const StyledDropdown = styled(Dropdown)`
  &&& {
    &.ant-dropdown-trigger {
      align-items: center;
      background-color: transparent;
      border: 1px solid ${({ theme }): string => theme.color.neutral7};
      border-radius: ${({ theme }): string => `${theme.borderRadius}px`};
      cursor: pointer;
      display: flex;
      height: 100%;
      justify-content: center;
      transition: border-color 0.2s ease;
      width: 100%;
      &:hover {
        border-color: ${({ theme }): string => theme.color.neutral5};
      }
    }
  }
`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StyledMenu = styled(Menu as any)`
  background: ${({ theme }): string => theme.color.neutral9};
  display: flex;
  flex-direction: column;
  padding: ${spacingIncrement(13)} 0;
  &&& .ant-dropdown-menu-item {
    color: ${({ theme }): string => theme.color.neutral1};
    font-size: ${({ theme }): string => theme.fontSize.sm};
    font-weight: ${({ theme }): number => theme.fontWeight.medium};
    padding: ${spacingIncrement(13)} ${spacingIncrement(30)} ${spacingIncrement(13)}
      ${spacingIncrement(20)};
    width: ${spacingIncrement(200)};
    .ant-dropdown-menu-title-content {
      display: flex;
      justify-content: space-between;
    }
    &:hover {
      background: ${({ theme }): string => theme.color.neutral7};
    }
  }
`

const items: Array<{
  label: string
  href?: string
  key?: 'theme'
  icon: IconName
  altIcon?: IconName
}> = [
  { label: 'About', href: PREPO_WEBSITE, icon: 'info-outlined' },
  { label: 'Discord', href: PREPO_DISCORD, icon: 'discord-outlined' },
  { label: 'Twitter', href: PREPO_TWITTER, icon: 'twitter-outlined' },
  { label: 'Docs', href: 'https://docs.prepo.io/', icon: 'docs-outlined' },
  { label: 'Switch to Dark', key: 'theme', icon: 'dark-theme', altIcon: 'light-theme' },
  // TODO: translations { label: 'Language' },
  // TODO: privacy link { label: 'Legal & Privacy', href: '' },
]

const renderItem = (item: typeof items[number], uiStore: UiStore): ItemType => {
  const isLink = !!item.href
  const { key } = item
  let { label, icon } = item

  let onClick = (): void => undefined
  if (key === 'theme') {
    if (uiStore.selectedTheme === ThemeModes.Dark) {
      label = 'Switch to Light'
      onClick = (): void => uiStore.setTheme(ThemeModes.Light)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      icon = item.altIcon!
    } else {
      onClick = (): void => uiStore.setTheme(ThemeModes.Dark)
    }
  }

  return isLink
    ? ({
        label: (
          <>
            <a href={item.href} target="_blank" rel="noreferrer">
              {label}
            </a>
            <Icon name={icon} width="20px" height="20px" color="neutral4" />
          </>
        ),
      } as ItemType)
    : ({
        key,
        onClick,
        label: (
          <>
            {label}
            <Icon name={icon} width="20px" height="20px" color="neutral4" />
          </>
        ),
      } as ItemType)
}

const SettingsMenu: React.FC = () => {
  const { isDesktop } = useResponsive()
  const { uiStore } = useRootStore()
  const size = isDesktop ? '32px' : '24px'

  return (
    <Flex alignSelf="stretch" width={38}>
      <StyledDropdown
        trigger={['click']}
        overlay={<StyledMenu items={items.map((item) => renderItem(item, uiStore))} />}
      >
        <button type="button">
          <Icon name="dots" width={size} height={size} color="neutral1" />
        </button>
      </StyledDropdown>
    </Flex>
  )
}

export default observer(SettingsMenu)
