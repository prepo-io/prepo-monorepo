import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { MockBaseToken } from '../../typechain/MockBaseToken'

chai.use(solidity)

export async function mockBaseTokenFixture(name: string, symbol: string): Promise<MockBaseToken> {
  const mockBaseToken = await ethers.getContractFactory('MockBaseToken')
  return (await mockBaseToken.deploy(name, symbol)) as MockBaseToken
}
