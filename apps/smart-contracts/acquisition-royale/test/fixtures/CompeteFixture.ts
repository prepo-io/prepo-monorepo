import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { MockCompete } from '../../typechain/MockCompete'
import { CompeteV1 } from '../../typechain/CompeteV1'

chai.use(solidity)

export async function mockCompeteFixture(): Promise<MockCompete> {
  const mockCompete = await ethers.getContractFactory('MockCompete')
  return (await mockCompete.deploy()) as MockCompete
}

export async function competeV1Fixture(acquisitionRoyale: string): Promise<CompeteV1> {
  const competeV1 = await ethers.getContractFactory('CompeteV1')
  return (await competeV1.deploy(acquisitionRoyale)) as CompeteV1
}
