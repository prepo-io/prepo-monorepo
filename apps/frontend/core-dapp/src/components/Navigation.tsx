import styled, { Color } from 'styled-components'
import { useRouter } from 'next/router'
import { observer } from 'mobx-react-lite'
import { centered, spacingIncrement, IconName, Icon, media } from '@prepo-io/ui'
import { useEffect, useRef } from 'react'
import Link from './Link'
import Tooltip from './Tooltip'
import PpoDropdown from './PpoDropdown'
import { useRootStore } from '../context/RootStoreProvider'
import { Routes } from '../lib/routes'
import useFeatureFlag, { FeatureFlag } from '../hooks/useFeatureFlag'

type IconNameSize = {
  iconName: IconName
  iconSize: {
    height: string
    width: string
  }
}

type PathProps = IconNameSize & {
  name: string
  path: Routes
  disabledTooltip?: string
}

const navigationPaths: PathProps[] = [
  {
    iconName: 'home',
    iconSize: {
      height: '20',
      width: '19',
    },
    name: 'Home',
    path: Routes.Markets,
  },
  {
    iconName: 'portfolio',
    iconSize: {
      height: '20',
      width: '21',
    },
    name: 'Portfolio',
    path: Routes.Portfolio,
  },
  {
    iconName: 'home', // Fake navigation item to render another component
    iconSize: {
      height: '0',
      width: '0',
    },
    name: 'PPO',
    path: Routes.Markets,
  },
  {
    iconName: 'profile-circle',
    iconSize: {
      height: '20',
      width: '20',
    },
    name: 'Profile',
    path: Routes.Profile,
  },
]

type NavigationItemProps = IconNameSize & {
  iconColor?: keyof Color
  href?: string
  name?: string
  onClick?: () => void
  disabledTooltip?: string | undefined
}

const Name = styled.p<{ active: boolean }>`
  color: ${({ active, theme }): string => (active ? theme.color.secondary : theme.color.neutral2)};
  display: none;
  font-size: ${({ theme }): string => theme.fontSize.md};
  font-weight: ${({ theme }): number => theme.fontWeight.medium};
  margin-bottom: 0;
  margin-left: ${spacingIncrement(9)};
  ${media.tablet`
    display: block;
  `}
  @media (min-width: 1024px) and (max-width: 1124px) {
    display: none;
  }
`

const Wrapper = styled.div`
  align-items: center;
  background-color: ${({ theme }): string => theme.color.neutral10};
  border-top: 1px solid ${({ theme }): string => theme.color.primaryAccent};
  bottom: 0;
  display: flex;
  flex: 1;
  height: ${spacingIncrement(72)};
  justify-content: space-evenly;
  left: 0;
  padding: 0 ${spacingIncrement(30)};
  position: fixed;
  right: 0;
  ${media.largeDesktop`
    align-items: center;
    border-top: none;
    height: ${spacingIncrement(54)};
    padding: unset;
    position: unset;
  `};
  > *:hover {
    transform: scale(1.03);
    transition: transform 0.2s ease-out;
  }
`

const NavigationItemWrapper = styled.div<{ disabled: boolean }>`
  ${centered}
  cursor: ${({ disabled }): string => (disabled ? 'not-allowed' : 'pointer')};
`

const NavigationLinkWrapper = styled.div`
  ${centered}
  a {
    display: flex;
  }
`

const NavigationLink: React.FC<{ href?: string }> = ({ children, href }) => {
  if (href) {
    return (
      <NavigationLinkWrapper>
        <Link href={href}>{children}</Link>
      </NavigationLinkWrapper>
    )
  }
  return <NavigationLinkWrapper>{children}</NavigationLinkWrapper>
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  href,
  iconColor: iColor,
  iconName,
  iconSize,
  name,
  disabledTooltip,
}) => {
  const router = useRouter()
  let iconColor: keyof Color = iColor || 'neutral5'
  const isActive = typeof href === 'string' && router.asPath.includes(href)
  if (isActive) {
    iconColor = 'primary'
  }
  const component = (
    <NavigationItemWrapper disabled={Boolean(disabledTooltip)}>
      <Icon name={iconName} color={iconColor} height={iconSize.height} width={iconSize.width} />
      {Boolean(name) && <Name active={isActive}>{name}</Name>}
    </NavigationItemWrapper>
  )

  if (disabledTooltip) {
    return <Tooltip title={disabledTooltip}>{component}</Tooltip>
  }

  return <NavigationLink href={href}>{component}</NavigationLink>
}

const HIDDEN_NAVIGATION_ROUTES: string[] = []

const hideNavigationRoutes = (
  shouldBeHidden: boolean | undefined,
  navigation: PathProps[]
): PathProps[] =>
  navigation.map((navigationItem): PathProps => {
    if (shouldBeHidden && HIDDEN_NAVIGATION_ROUTES.includes(navigationItem.path)) {
      return {
        ...navigationItem,
        disabledTooltip: 'Coming soon',
      }
    }

    return navigationItem
  })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NavigationList: React.FC = observer((): any => {
  const { web3Store } = useRootStore()
  const { enabled } = useFeatureFlag(FeatureFlag.enableCoreDapp, web3Store.signerState.address)

  const navigationRoutes = hideNavigationRoutes(!enabled, navigationPaths)

  return navigationRoutes.map(({ iconName, iconSize, name, path, disabledTooltip }) => {
    if (name === 'PPO') {
      return <PpoDropdown key={name} />
    }
    return (
      <NavigationItem
        href={path}
        iconName={iconName}
        key={name}
        name={name}
        iconSize={iconSize}
        disabledTooltip={disabledTooltip}
      />
    )
  })
})

const Navigation: React.FC = () => {
  const { uiStore } = useRootStore()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref && ref.current) {
      uiStore.setMobileNavigationHeight(ref.current.offsetHeight)
    }
  }, [uiStore, ref])

  return (
    <Wrapper ref={ref}>
      <NavigationList />
    </Wrapper>
  )
}

export default observer(Navigation)
