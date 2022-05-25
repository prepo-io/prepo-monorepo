import { Range } from '../../types/market.types'
import { numFormatter } from '../../utils/number-utils'

export const getValuationRangeString = (valuationRange: Range): string => {
  const [min, max] = valuationRange
  return `$${numFormatter(min)} - $${numFormatter(max)}`
}
