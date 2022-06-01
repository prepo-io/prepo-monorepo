import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { MockERC1155 } from '../../typechain/MockERC1155'

chai.use(solidity)

export async function mockERC1155Fixture(uri: string): Promise<MockERC1155> {
  const contract = await ethers.getContractFactory('MockERC1155')
  return (await contract.deploy(uri)) as MockERC1155
}
