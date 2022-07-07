import { ethers } from 'hardhat'
import { MockVestingClaimer } from '../../types/generated'

export async function mockVestingClaimerFixture(
  vestingAddress: string
): Promise<MockVestingClaimer> {
  const Factory = await ethers.getContractFactory('MockVestingClaimer')
  return (await Factory.deploy(vestingAddress)) as unknown as MockVestingClaimer
}
