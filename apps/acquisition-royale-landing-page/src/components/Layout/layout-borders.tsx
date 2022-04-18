import { css } from 'styled-components'
import { BORDER_WIDTH_PIXEL } from '../../utils/theme/theme-utils'

export const BORDER_ONE_SPACE_REM = 0.313
export const BORDER_TWO_SPACE_REM = 0.125
export const BORDER_RADIUS_REM = 1.5

export const layoutBorderOneStyles = css`
  border: ${BORDER_WIDTH_PIXEL} solid #f3d29d;
  content: ' ';
  filter: drop-shadow(rgb(230, 196, 149) 0px 0px 0.5rem);
  inset: ${BORDER_ONE_SPACE_REM}rem;
  pointer-events: none;
  position: fixed;
`

export const layoutBorderTwoStyles = css`
  border: ${BORDER_WIDTH_PIXEL} solid #f3d29d;
  border-radius: ${BORDER_RADIUS_REM}rem;
  content: ' ';
  filter: drop-shadow(rgb(230, 196, 149) 0px 0px 0.5rem);
  inset: ${BORDER_TWO_SPACE_REM}rem;
  pointer-events: none;
  position: fixed;
`
