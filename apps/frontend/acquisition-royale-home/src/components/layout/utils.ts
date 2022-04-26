import { css } from 'styled-components'
import { media } from '../../utils/theme/media'
import { spacingIncrement } from '../../utils/theme/utils'

export const contentCss = css`
  padding: 0 ${spacingIncrement(52)};
  ${media.tablet`
    padding: 0 ${spacingIncrement(24)};
  `}
`
