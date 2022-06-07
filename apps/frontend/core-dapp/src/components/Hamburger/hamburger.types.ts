import { IconName } from 'prepo-ui'
import { Color } from 'styled-components'

export type NavigationItemType = {
  iconName: IconName
  href: string
}

export type NavigationItemProps = {
  iconColor?: keyof Color
  name?: string
  noPadding?: boolean
  onClick?: () => void
} & NavigationItemType

export type MenuItems = NavigationItemType & {
  label: string
}
