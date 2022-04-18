/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { css, DefaultTheme, ThemedCssFunction } from 'styled-components'
import { onePxToEm } from './theme/theme'
import { sizes, Sizes } from './theme/theme-breakpoints'

type Media = {
  sm: hemedCssFunction<DefaultTheme>
  md: ThemedCssFunction<DefaultTheme>
  lg: ThemedCssFunction<DefaultTheme>
  xl: hemedCssFunction<DefaultTheme>
}

export const media: Media = Object.keys(sizes).reduce((acc: any, label) => {
  acc[label] = (...args: TemplateStringsArray): any => css`
    @media (max-width: ${sizes[label as keyof Sizes] / 16 - onePxToEm}em) {
      ${css.call(undefined, ...args)};
    }
  `

  return acc
}, {})
