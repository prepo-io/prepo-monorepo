import { BigNumber } from 'ethers'
import Decimal from 'decimal.js'
import Web3 from 'web3'
import config from '../lib/config'

export const roundToDecimals = (
  value: number | string,
  decimals: number = config.ROUNDED_DECIMALS
): string => {
  const valueAsFloat = new Decimal(value)
  const roundedValue = valueAsFloat.toFixed(decimals)
  return valueAsFloat.toString() === '0' ? '0' : `${roundedValue}`
}

export const fromWeiToEther = (value: number | BigNumber): string => {
  const etherStringValue = Web3.utils.fromWei(`${value}`, 'ether')
  return roundToDecimals(etherStringValue)
}
