import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { TextBranding } from '../../typechain/TextBranding'

chai.use(solidity)

export async function textBrandingFixture(acquisitionRoyale: string): Promise<TextBranding> {
  const textBranding = await ethers.getContractFactory('TextBranding')
  return (await textBranding.deploy(acquisitionRoyale)) as TextBranding
}
