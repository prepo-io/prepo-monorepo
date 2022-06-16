import { ethers } from 'hardhat'
import { PregenPass, MockPregenPass } from '../../types/generated'

export async function pregenPassFixture(
  pregenPassOwner: string,
  pregenPassURI: string
): Promise<PregenPass> {
  const Factory = await ethers.getContractFactory('PregenPass')
  return (await Factory.deploy(pregenPassOwner, pregenPassURI)) as PregenPass
}

export async function mockPregenPassFixture(
  mockPregenPassOwner: string,
  mockPregenPassURI: string
): Promise<MockPregenPass> {
  const Factory = await ethers.getContractFactory('MockPregenPass')
  return (await Factory.deploy(mockPregenPassOwner, mockPregenPassURI)) as MockPregenPass
}
