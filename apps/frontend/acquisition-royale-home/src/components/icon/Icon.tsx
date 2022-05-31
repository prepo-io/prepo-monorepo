import { DetailedHTMLProps, HTMLAttributes } from 'react'
import { Color, useTheme } from 'styled-components'
import { IconProps } from './icon.types'
import Logo from './iconComponents/Logo'
import Discord from './iconComponents/Discord'
import Medium from './iconComponents/Medium'
import Twitter from './iconComponents/Twitter'
import Matic from './iconComponents/Matic'
import LeftArrow from './iconComponents/LeftArrow'
import RightArrow from './iconComponents/RightArrow'
import DownArrow from './iconComponents/DownArrow'
import UpArrow from './iconComponents/UpArrow'
import Close from './iconComponents/Close'
import Wallet from './iconComponents/Wallet'
import Uniswap from './iconComponents/Uniswap'
import Info from './iconComponents/Info'
import CoffeeCup from './iconComponents/CoffeeCup'
import Shop from './iconComponents/Shop'
import External from './iconComponents/External'

export const applicationIcons = {
  close: Close,
  coffeeCup: CoffeeCup,
  external: External,
  logo: Logo,
  discord: Discord,
  info: Info,
  medium: Medium,
  twitter: Twitter,
  matic: Matic,
  leftArrow: LeftArrow,
  rightArrow: RightArrow,
  downArrow: DownArrow,
  uniswap: Uniswap,
  upArrow: UpArrow,
  shop: Shop,
  wallet: Wallet,
}

type Props = IconProps &
  DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> & { color?: keyof Color }

const Icon: React.FC<Props> = ({
  name,
  onClick,
  color = 'accentPrimary',
  disabled = false,
  height,
  width,
  ...otherProps
}) => {
  const theme = useTheme()
  const IconComponent = applicationIcons[name]
  const iconColor = theme.color[color]

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <span {...otherProps}>
      <IconComponent
        onClick={onClick}
        color={iconColor}
        height={height}
        width={width}
        disabled={disabled}
      />
    </span>
  )
}

export default Icon
