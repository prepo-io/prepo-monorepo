export const percentageDecimalToBase10 = (value: number): number => value * 100

export const formatNumber = (
  number: number | string | undefined,
  options: Intl.NumberFormatOptions = {}
): string | undefined => {
  if (number === undefined) return undefined
  return new Intl.NumberFormat('en-US', options).format(Number(number))
}
