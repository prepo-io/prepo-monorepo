import { Range } from '../../types/market.types'
import { numberFormatter } from '../../utils/numberFormatter'

export const getValuationRangeString = (valuationRange: Range): string => {
  const [min, max] = valuationRange
  const { significantDigits } = numberFormatter

  return `$${significantDigits(min)} - $${significantDigits(max)}`
}
