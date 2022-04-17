import { createBreakpoints } from '@chakra-ui/theme-tools'

export const sizes = {
  sm: 480,
  md: 768,
  lg: 992,
  xl: 1280,
}

export type Sizes = typeof sizes

export const pixelSizes = {
  sm: `${sizes.sm}px`,
  md: `${sizes.md}px`,
  lg: `${sizes.lg}px`,
  xl: `${sizes.xl}px`,
}

export const chakraBreakpoints = createBreakpoints({
  sm: '30em', // 480px
  md: '48em', // 768px
  lg: '62em', // 992px
  xl: '80em', // 1280px
})
