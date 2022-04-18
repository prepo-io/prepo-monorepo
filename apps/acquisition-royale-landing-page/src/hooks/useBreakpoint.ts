/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useState, useEffect } from 'react'
import throttle from 'lodash.throttle'
import { Sizes, sizes } from '../utils/theme/theme-breakpoints'

const getDeviceConfig = (width: number): keyof Sizes => {
  if (width > sizes.xl) return 'xl'
  if (width > sizes.lg) return 'lg'
  if (width > sizes.md) return 'md'
  return `sm`
}

const useBreakpoint = (): keyof Sizes | undefined => {
  const [breakPoint, setBreakPoint] = useState<keyof Sizes>()

  useEffect(() => {
    // @ts-ignore
    const calcInnerWidth = throttle(() => {
      setBreakPoint(getDeviceConfig(window.innerWidth))
    }, 200)

    calcInnerWidth()

    window.addEventListener('resize', calcInnerWidth)
    return (): void => window.removeEventListener('resize', calcInnerWidth)
  }, [])

  return breakPoint
}
export default useBreakpoint
