import { getNetworkByChainId } from '../constants'

describe('web3-utils constants', () => {
  test('It should return mainnet', () => {
    const value = getNetworkByChainId(1)
    expect(value?.name).toEqual('mainnet')
  })
})
