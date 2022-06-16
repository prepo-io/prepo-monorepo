import { ethers } from 'hardhat'
import { MockPregenPass } from '../../types/generated'

export async function mockPregenPassFixtures(
  mockPregenPassOwner: string,
  mockPregenPassURI: string
): Promise<MockPregenPass> {
  const Factory = await ethers.getContractFactory('MockPregenPass')
  return (await Factory.deploy(mockPregenPassOwner, mockPregenPassURI)) as MockPregenPass
}
