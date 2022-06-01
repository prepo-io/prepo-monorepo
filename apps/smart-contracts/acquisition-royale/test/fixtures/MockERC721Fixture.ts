import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { MockERC721 } from '../../typechain/MockERC721'

chai.use(solidity)

export async function mockERC721Fixture(
  tokenName: string,
  tokenSymbol: string
): Promise<MockERC721> {
  const contract = await ethers.getContractFactory('MockERC721')
  return (await contract.deploy(tokenName, tokenSymbol)) as MockERC721
}
