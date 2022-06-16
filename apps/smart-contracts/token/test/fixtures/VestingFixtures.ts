import { ethers } from 'hardhat'
import { Vesting } from '../../types/generated'

export async function vestingFixture(vestingOwner: string): Promise<Vesting> {
  const Factory = await ethers.getContractFactory('Vesting')
  return (await Factory.deploy(vestingOwner)) as Vesting
}
