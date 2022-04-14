import { applicationIcons } from './Icon'

export type IconName = keyof typeof applicationIcons

export type IconProps = {
  name: IconName
  onClick?: () => void
  color?: string
  height?: string
  width?: string
  disabled?: boolean
}
