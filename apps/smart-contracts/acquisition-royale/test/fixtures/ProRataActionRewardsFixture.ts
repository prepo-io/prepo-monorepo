import { ethers, upgrades } from 'hardhat'
import { ProRataActionRewards } from '../../typechain/ProRataActionRewards'

export async function proRataActionRewardsFixture(): Promise<ProRataActionRewards> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const proRataActionRewardsFactory: any = await ethers.getContractFactory('ProRataActionRewards')
  return (await upgrades.deployProxy(
    proRataActionRewardsFactory,
    []
  )) as unknown as ProRataActionRewards
}
