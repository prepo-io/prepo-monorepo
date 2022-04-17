import { extendTheme, ThemeConfig } from '@chakra-ui/react'
import { chakraBreakpoints } from './theme-breakpoints'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true,
}

export const PRIMARY_COLOR = '#F3D29D'

export const onePxToEm = 1 / 16

const brandColors = {
  primary: PRIMARY_COLOR,
  yin: '#191623',
  yang: '#FFFFFF',
  primaryDisabled: '#E6C49580',
  light: {
    primary: '#6264d9',
    secondary: '#66ACFC',
    accent: '#C8009A',
    accentLight: '#B35C9F',
  },
  dark: {
    primary: '#B2B3FE',
    secondary: '#C2DFFF',
    accent: '#F783DD',
    accentLight: '#FFB9EF',
  },
}

const textColors = {
  light: {
    primary: '#FFFFFF',
  },
  dark: {
    primary: '#0F0F0F',
  },
}

const theme = extendTheme({
  breakpoints: chakraBreakpoints,
  config,
  fonts: {
    heading: 'Geometos Neue',
    body: 'Geometos Neue',
  },
  colors: {
    brand: brandColors,
    text: textColors,
  },
})

export default theme
