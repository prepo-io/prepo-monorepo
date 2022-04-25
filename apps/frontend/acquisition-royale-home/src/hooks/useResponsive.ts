import { useMemo } from 'react'
import { useWindowSize } from './useWindowSize'
import { sizes } from '../utils/theme/breakpoints'

export type Responsive = {
  isDesktop: boolean
  isPhone: boolean
  isTablet: boolean
}

const useResponsive = (): Responsive => {
  const { width } = useWindowSize()

  const definedWidth = width || 0
  return useMemo(
    () => ({
      isDesktop: definedWidth > sizes.tablet,
      isPhone: definedWidth <= sizes.phone,
      isTablet: definedWidth <= sizes.tablet && definedWidth > sizes.phone,
    }),
    [definedWidth]
  )
}

export default useResponsive
