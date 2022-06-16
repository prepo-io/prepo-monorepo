import { ethers } from 'hardhat'
import { MockPPOStaking } from '../../types/generated'
import { BigNumber } from 'ethers'

export async function mockPPOStakingDeployFixture(
  platformTokenVendorFactoryAddress: string,
  nexus: string,
  rewardsToken: string,
  achievementsManager: string,
  stakedToken: string,
  cooldownSeconds: BigNumber,
  unstakeWindow: BigNumber
): Promise<MockPPOStaking> {
  const Factory = await ethers.getContractFactory('MockPPOStaking', {
    libraries: {
      PlatformTokenVendorFactory: platformTokenVendorFactoryAddress,
    },
  })
  return (await Factory.deploy(
    nexus,
    rewardsToken,
    achievementsManager,
    stakedToken,
    cooldownSeconds,
    unstakeWindow
  )) as MockPPOStaking
}
