import { fromWeiToEther, roundToDecimals } from '../web3-utils'

describe('web3-utils tests', () => {
  test('It should round to decimals from number', () => {
    const value = roundToDecimals(2.0232301, 2)
    expect(value).toEqual('2.02')
  })
  test('It should round to decimals from one decimal', () => {
    const value = roundToDecimals(0.5, 2)
    expect(value).toEqual('0.50')
  })
  test('It should round to default decimals from number', () => {
    const value = roundToDecimals(2.0232)
    expect(value).toEqual('2.0232')
  })
  test('It should round to decimals from string', () => {
    const value = roundToDecimals('2.0232301', 2)
    expect(value).toEqual('2.02')
  })
  test('It should round to default decimals from string', () => {
    const value = roundToDecimals('2.0232')
    expect(value).toEqual('2.0232')
  })
  test('It should do nothing from string', () => {
    const value = roundToDecimals('2.02', 2)
    expect(value).toEqual('2.02')
  })
  test('It should do nothing from number', () => {
    const value = roundToDecimals(2.02, 2)
    expect(value).toEqual('2.02')
  })

  test('It should convert number to ether and default decimals', () => {
    const value = fromWeiToEther(1000000000000000000)
    expect(value).toEqual('1.0000')
  })
})
