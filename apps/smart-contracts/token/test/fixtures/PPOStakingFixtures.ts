import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { MockPPOStaking } from '../../types/generated'

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
  )) as unknown as MockPPOStaking
}
