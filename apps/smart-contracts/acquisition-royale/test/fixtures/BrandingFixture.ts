import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { MockBranding } from '../../typechain/MockBranding'
import { MockFallbackBranding } from '../../typechain/MockFallbackBranding'
import { MockBlankBranding } from '../../typechain/MockBlankBranding'
import { MockRevertBranding } from '../../typechain/MockRevertBranding'

chai.use(solidity)

export async function mockBrandingFixture(): Promise<MockBranding> {
  const mockBrandingFactory = await ethers.getContractFactory('MockBranding')
  return (await mockBrandingFactory.deploy()) as MockBranding
}

export async function mockFallbackBrandingFixture(): Promise<MockFallbackBranding> {
  const mockFallbackBrandingFactory = await ethers.getContractFactory('MockFallbackBranding')
  return (await mockFallbackBrandingFactory.deploy()) as MockFallbackBranding
}

export async function mockBlankBrandingFixture(): Promise<MockBlankBranding> {
  const mockBlankBrandingFactory = await ethers.getContractFactory('MockBlankBranding')
  return (await mockBlankBrandingFactory.deploy()) as MockBlankBranding
}

export async function mockRevertBrandingFixture(): Promise<MockRevertBranding> {
  const mockRevertBrandingFactory = await ethers.getContractFactory('MockRevertBranding')
  return (await mockRevertBrandingFactory.deploy()) as MockRevertBranding
}
