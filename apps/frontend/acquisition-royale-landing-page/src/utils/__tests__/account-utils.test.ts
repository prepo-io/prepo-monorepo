import { getShortAccount } from '../account-utils'

describe('account-utils tests', () => {
  test('It should shorten an address', () => {
    const value = getShortAccount('0x00a329c0648769A73afAc7F9381E08FB43dBEA72')
    expect(value).toEqual('0x00...EA72')
  })
  test('It should do nothing', () => {
    const value = getShortAccount(null)
    expect(value).toEqual(null)
  })
})
