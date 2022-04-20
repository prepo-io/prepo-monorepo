import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { MockBranding } from '../../typechain/MockBranding'
import { MockFallbackBranding } from '../../typechain/MockFallbackBranding'
import { MockBlankBranding } from '../../typechain/MockBlankBranding'
import { MockRevertBranding } from '../../typechain/MockRevertBranding'

chai.use(solidity)

export async function mockBrandingFixture(): Promise<MockBranding> {
  const mockBranding = await ethers.getContractFactory('MockBranding')
  return (await mockBranding.deploy()) as MockBranding
}

export async function mockFallbackBrandingFixture(): Promise<MockFallbackBranding> {
  const mockFallbackBranding = await ethers.getContractFactory('MockFallbackBranding')
  return (await mockFallbackBranding.deploy()) as MockFallbackBranding
}

export async function mockBlankBrandingFixture(): Promise<MockBlankBranding> {
  const mockBlankBranding = await ethers.getContractFactory('MockBlankBranding')
  return (await mockBlankBranding.deploy()) as MockBlankBranding
}

export async function mockRevertBrandingFixture(): Promise<MockRevertBranding> {
  const mockRevertBranding = await ethers.getContractFactory('MockRevertBranding')
  return (await mockRevertBranding.deploy()) as MockRevertBranding
}
