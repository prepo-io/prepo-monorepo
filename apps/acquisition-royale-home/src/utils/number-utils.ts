import { BigNumber, ethers } from 'ethers'

export const DEFAULT_DECIMAL = 3

export const formatNumber = (
  number: number | string | undefined,
  options: Intl.NumberFormatOptions = {}
): string | undefined => {
  if (number === undefined) return undefined
  return new Intl.NumberFormat('en-US', options).format(Number(number))
}

export const intlStringToNumber = (value: string): number => +value.replaceAll(',', '')

export const formatNumberToNumber = (
  number: number | string | undefined,
  options: Intl.NumberFormatOptions = {
    maximumFractionDigits: 3,
  }
): number | undefined => {
  const stringFormat = formatNumber(number, options)
  if (stringFormat === undefined) return undefined
  return intlStringToNumber(stringFormat)
}

export const numberInput = (
  input: string,
  setter: (value: string) => unknown,
  options?: {
    preventNegative?: boolean
  }
): void => {
  const floatRegExp = /^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/
  if (input === '' || (floatRegExp.test(input) && setter)) {
    if (options && options.preventNegative && +input < 0) return
    setter(input)
  }
}

export const generateRandomInt = (max: number): number => Math.floor(Math.random() * max)

export const transformRawEther = (rawValueFromSC: [BigNumber] | undefined): number | undefined => {
  if (rawValueFromSC === undefined) return undefined
  return +ethers.utils.formatEther(rawValueFromSC[0])
}

export const transformRawNumber = (rawValueFromSC: [BigNumber] | undefined): number | undefined => {
  if (rawValueFromSC === undefined) return undefined
  return rawValueFromSC[0].toNumber()
}
