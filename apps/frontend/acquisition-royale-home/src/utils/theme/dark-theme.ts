import { DefaultTheme } from 'styled-components'
import { fontSize, fontFamily, fontWeight } from './font-utils'
import { borderRadius } from './general-settings'

// Colors
const primary = '#191623'
const secondary = '#1D1B2A'
const modalTextColor = '#4a4a4a'

// States
const success = '#34D399'
const error = '#F87171'
const info = '#60A5FA'

// Accents & Others
const accentPrimary = '#F3D29D'
const white = '#FEFDFD'
const grey = '#C4C4C4'
const darkGrey = '#808080'

// Backgrounds
const backgroundGradientStart = '#1D1B2A'
const backgroundGradientEnd = '#34376E'

export const darkTheme: DefaultTheme = {
  color: {
    primary,
    secondary,
    success,
    error,
    info,
    accentPrimary,
    white,
    grey,
    darkGrey,
    backgroundGradientStart,
    backgroundGradientEnd,
    modalTextColor,
  },
  fontSize,
  fontFamily,
  fontWeight,
  borderRadius,
}
