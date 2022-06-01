import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { MockInternshipAttack } from '../../typechain/MockInternshipAttack'

chai.use(solidity)

export async function mockInternshipAttackFixture(
  acquisitionRoyaleAddress: string
): Promise<MockInternshipAttack> {
  const mockInternshipAttackFactory = await ethers.getContractFactory('MockInternshipAttack')
  return (await mockInternshipAttackFactory.deploy(
    acquisitionRoyaleAddress
  )) as MockInternshipAttack
}
