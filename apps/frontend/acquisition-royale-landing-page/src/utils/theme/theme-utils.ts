import { css } from 'styled-components'

// General
const initialUnit = 0.5
const BORDER_WIDTH_PX = 1
const LETTER_SPACE_PX = 1
export const BORDER_WIDTH_PIXEL = `${BORDER_WIDTH_PX}px`
export const LETTER_SPACE_PIXEL = `${LETTER_SPACE_PX}px`

export const spacingIncrement = (multiplier: number): string => `${multiplier * initialUnit}rem`

export const centered = css`
  align-items: center;
  display: flex;
  justify-content: center;
`
