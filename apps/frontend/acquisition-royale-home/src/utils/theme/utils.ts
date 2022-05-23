import { css } from 'styled-components'
import { ONE_REM_PX } from './general-settings'
import { SupportedLineHeights } from './theme.types'

const BORDER_WIDTH_PX = 1
const LETTER_SPACE_PX = 1

export const BORDER_WIDTH_PIXEL = `${BORDER_WIDTH_PX}px`
export const LETTER_SPACE_PIXEL = `${LETTER_SPACE_PX}px`

export const spacingIncrement = (figmaPoint: number): string => {
  const value = figmaPoint / ONE_REM_PX
  return `${value}rem`
}

export const getLineHeight = (lineHeight: SupportedLineHeights): string => `${lineHeight}px`

export const bordered = css`
  border: solid 1px ${({ theme }): string => theme.color.accentPrimary};
`

export const centered = css`
  align-items: center;
  display: flex;
  justify-content: center;
`

export const hideNumberArrow = css`
  input[type='number']::-webkit-outer-spin-button,
  input[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`

export const primaryFontFamily = css`
  font-family: ${({ theme }): string => theme.fontFamily.primary};
`

export const secondaryFontFamily = css`
  font-family: ${({ theme }): string => theme.fontFamily.secondary};
`

// Primary Box Shadow Glow
export const primaryBoxShadowGlow = css`
  box-shadow: 0px 2px 16px ${({ theme }): string => theme.color.accentPrimary};
`

// Red Box Shadow Glow
export const redBoxShadowGlow = css`
  box-shadow: 0px 2px 16px ${({ theme }): string => theme.color.error};
`

export const removeUserSelect = css`
  -khtml-user-select: none; /* iOS Safari */
  -moz-user-select: none; /* Safari */
  -ms-user-select: none; /* Konqueror HTML */
  -webkit-touch-callout: none; /* Old versions of Firefox */
  -webkit-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
`
