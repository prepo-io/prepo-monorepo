import { ethers } from 'hardhat'
import { BlockList } from '../../types/generated'

export async function blockListFixture(nominatedOwnerAddress: string): Promise<BlockList> {
  const Factory = await ethers.getContractFactory('BlockList')
  return (await Factory.deploy(nominatedOwnerAddress)) as unknown as BlockList
}
