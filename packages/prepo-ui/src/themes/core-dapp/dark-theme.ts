import { DefaultTheme } from 'styled-components'
import { colors } from './colors'
import { borderRadius, boxRadiusPx } from './common'
import { fontSize, fontFamily, fontWeight } from './font-utils'
import { TRANSPARENT } from './utils'
import { breakpoints } from './breakpoints'
import { ThemeModes } from '../themes.types'

// primary colors and its variants
const darkPrimary = colors.purple6
const primary = colors.purple3
const primaryAccent = colors.gray5
const primaryLight = colors.purple2
const primaryWhite = colors.white

// accent colors
const accent1 = colors.gray8
const accent2 = colors.gray9
const accent3 = colors.purple1

// secondary color
const secondary = colors.white

// neutral colors (mostly gray colors in different combination)
const neutral1 = colors.white
const neutral2 = colors.gray2
const neutral3 = colors.gray2
const neutral4 = colors.white
const neutral5 = colors.gray2
const neutral6 = colors.gray2
const neutral7 = colors.gray5
const neutral8 = colors.gray6
const neutral9 = colors.gray6
const neutral10 = colors.gray9
const neutral11 = colors.gray2

// semantic
const info = colors.blue3
const error = colors.red2
const success = colors.green2
const warning = colors.orange3

// semantic accent
const accentInfo = colors.gray6
const accentError = colors.gray6
const accentPrimary = colors.gray6
const accentSuccess = colors.gray6
const accentWarning = colors.gray6
const accentPurple = colors.gray6

// semantic alert boxes
const alertBoxSuccess = colors.gray5
const alertBoxInfo = colors.gray5
const alertBoxError = colors.gray5
const alertBoxWarning = colors.gray5

// button varients
// default
const buttonDefaultBackground = colors.gray5
const buttonDefaultBorder = colors.gray5
const buttonDefaultLabel = colors.white
const buttonDefaultHoverBackground = colors.gray6
const buttonDefaultHoverBorder = colors.white
const buttonDefaultHoverLabel = colors.white
// primary
const buttonPrimaryBackground = primary
const buttonPrimaryBorder = primary
const buttonPrimaryLabel = colors.white
const buttonPrimaryHoverBackground = darkPrimary
const buttonPrimaryHoverBorder = darkPrimary
const buttonPrimaryHoverLabel = colors.white
// text
const buttonTextBackground = TRANSPARENT
const buttonTextBorder = TRANSPARENT
const buttonTextLabel = colors.purple2
const buttonTextHoverBackground = primaryAccent
const buttonTextHoverBorder = primaryAccent
const buttonTextHoverLabel = colors.purple2

// componets specific
const exploreCardBorder = colors.gray8
const inputPlaceholder = colors.gray1
const liquidityBrush = colors.orange3
const marketChartBackground = colors.gray7
const marketChartFloatingCard = colors.gray5
const searchInputBackground = colors.gray9
const searchInputBorder = colors.gray6
const sliderTooltipBackground = colors.purple3
const switchHandler = colors.gray1
const tabActiveBackground = colors.gray5
const tradeSettingReset = colors.purple2
const bondingEvent = colors.purple11

// profile banners
const elitePregenBackground = colors.blue6
const executiveBackground = colors.blue7
const executiveIconFill = colors.yellow1
const executiveInfo = colors.gray10
const preacherBackground = `linear-gradient(90deg, ${colors.purple5}, ${colors.purple6})`
const preacherIconBackground = `linear-gradient(${colors.blue4}, ${colors.blue5})`
const preacherIconFill = `linear-gradient(${colors.purple7}, ${colors.purple8})`
const preacherTextColor = colors.gray11
const profileBorderColor = colors.purple2

// Mode
const mode = ThemeModes.Dark

const positionType = {
  long: success,
  short: error,
  liquidity: primary,
}

const darkTheme: DefaultTheme = {
  breakpoints,
  color: {
    darkPrimary,
    primary,
    primaryAccent,
    primaryLight,
    primaryWhite,
    accent1,
    accent2,
    accent3,
    secondary,
    neutral1,
    neutral2,
    neutral3,
    neutral4,
    neutral5,
    neutral6,
    neutral7,
    neutral8,
    neutral9,
    neutral10,
    neutral11,
    info,
    error,
    success,
    warning,
    accentInfo,
    accentError,
    accentPrimary,
    accentSuccess,
    accentWarning,
    accentPurple,
    alertBoxInfo,
    alertBoxSuccess,
    alertBoxError,
    alertBoxWarning,
    exploreCardBorder,
    inputPlaceholder,
    liquidityBrush,
    marketChartBackground,
    marketChartFloatingCard,
    searchInputBackground,
    searchInputBorder,
    sliderTooltipBackground,
    switchHandler,
    tabActiveBackground,
    tradeSettingReset,
    bondingEvent,
    darkBlue: colors.blue2,
    white: colors.white,
    orange: colors.orange4,
    buttonDefaultBackground,
    buttonDefaultBorder,
    buttonDefaultLabel,
    buttonDefaultHoverBackground,
    buttonDefaultHoverBorder,
    buttonDefaultHoverLabel,
    buttonPrimaryBackground,
    buttonPrimaryBorder,
    buttonPrimaryLabel,
    buttonPrimaryHoverBackground,
    buttonPrimaryHoverBorder,
    buttonPrimaryHoverLabel,
    buttonTextBackground,
    buttonTextBorder,
    buttonTextLabel,
    buttonTextHoverBackground,
    buttonTextHoverBorder,
    buttonTextHoverLabel,
    elitePregenBackground,
    executiveBackground,
    executiveIconFill,
    executiveInfo,
    preacherBackground,
    preacherIconBackground,
    preacherIconFill,
    preacherTextColor,
    profileBorderColor,
    transparent: TRANSPARENT,
  },
  positionType,
  fontSize,
  fontFamily,
  fontWeight,
  borderRadius,
  boxRadiusPx,
  mode,
  isDarkMode: true,
}

export default darkTheme
