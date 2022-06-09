import { numFormatter } from './number-utils'

/**
 * Exposes all the possible formats that you will need to apply to numbers across the app
 * @param significantDigits - Will return 3 significant digits. Example: 1.20M
 */
export const numberFormatter = {
  significantDigits: (value: number | string): string =>
    numFormatter(value, { significantDigits: 3 }),
}
