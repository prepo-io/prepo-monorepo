import { ethers } from 'hardhat'
import { StakingRewardsDistribution } from '../../types/generated'

export async function stakingRewardsDistributionFixture(): Promise<StakingRewardsDistribution> {
  const Factory = await ethers.getContractFactory('StakingRewardsDistribution')
  return (await Factory.deploy()) as unknown as StakingRewardsDistribution
}
