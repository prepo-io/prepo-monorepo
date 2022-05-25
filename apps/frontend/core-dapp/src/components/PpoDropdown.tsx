import { centered, Icon, spacingIncrement } from '@prepo-io/ui'
import styled from 'styled-components'
import { NavigationItem } from './Navigation'
import Menu, { MenuItem } from './Menu'
import Link from './Link'
import Dropdown from './Dropdown'
import useResponsive from '../hooks/useResponsive'
import { Routes } from '../lib/routes'
import usePpoNavigation from '../features/ppo/usePpoNavigation'

const PpoWrapper = styled.div`
  ${centered};
`

const StyledMenuItem = styled(MenuItem)`
  &&&.ant-dropdown-menu-item-active {
    background-color: white;
    * {
      color: ${({ theme }): string => theme.color.neutral3};
      font-weight: ${({ theme }): number => theme.fontWeight.semiBold};
    }
    :hover {
      * {
        color: ${({ theme }): string => theme.color.primary};
        font-weight: ${({ theme }): number => theme.fontWeight.medium};
      }
    }
  }
`

const Name = styled.div`
  align-items: center;
  color: inherit;
  display: flex;
  flex-direction: row;
  font-size: ${({ theme }): string => theme.fontSize.base};
  font-weight: ${({ theme }): number => theme.fontWeight.medium};
  margin: 0 ${spacingIncrement(32)} 0 ${spacingIncrement(20)};
`

const DropDownWrapper = styled(Dropdown)`
  padding: 0;
  &&& {
    &.ant-dropdown-trigger {
      background-color: transparent;
    }
  }
`

const PpoLabel = (): JSX.Element => (
  <PpoWrapper>
    <NavigationItem
      iconName="ppo-logo"
      href={Routes.PPO}
      iconColor="neutral5"
      iconSize={{ height: '20', width: '20' }}
      name="PPO"
    />
  </PpoWrapper>
)

const PpoDropdown: React.FC = () => {
  const { isPhone, isTablet } = useResponsive()
  const ppoItems = usePpoNavigation()

  const desktopDropdownMenu = (): React.ReactElement => (
    <Menu size="md">
      {ppoItems
        .filter(({ href }) => Boolean(href))
        .map(({ title, href, target }) => (
          <StyledMenuItem key={title}>
            <Link href={href} target={target}>
              <Name>
                {title}
                {target && (
                  <Icon
                    name="share"
                    height="12"
                    width="12"
                    style={{ marginLeft: spacingIncrement(12), paddingTop: spacingIncrement(2) }}
                  />
                )}
              </Name>
            </Link>
          </StyledMenuItem>
        ))}
    </Menu>
  )

  return isPhone || isTablet ? (
    <PpoLabel />
  ) : (
    <DropDownWrapper
      overlay={desktopDropdownMenu}
      variant="standard"
      size="md"
      trigger={['hover']}
      placement="bottomCenter"
    >
      <PpoLabel />
    </DropDownWrapper>
  )
}

export default PpoDropdown
