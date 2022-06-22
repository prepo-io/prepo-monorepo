import { ethers } from 'hardhat'
import { MockPPOGamifiedToken } from '../../types/generated'

export async function mockPPOGamifiedTokenDeployFixture(
  platformTokenVendorFactoryAddress: string,
  nexus: string,
  rewardsToken: string,
  questManager: string
): Promise<MockPPOGamifiedToken> {
  const Factory = await ethers.getContractFactory('MockPPOGamifiedToken', {
    libraries: {
      PlatformTokenVendorFactory: platformTokenVendorFactoryAddress,
    },
  })
  return (await Factory.deploy(
    nexus,
    rewardsToken,
    questManager
  )) as unknown as MockPPOGamifiedToken
}
