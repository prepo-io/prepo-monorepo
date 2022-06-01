import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { TextBranding } from '../../typechain/TextBranding'

chai.use(solidity)

export async function textBrandingFixture(acquisitionRoyale: string): Promise<TextBranding> {
  const textBrandingFactory = await ethers.getContractFactory('TextBranding')
  return (await textBrandingFactory.deploy(acquisitionRoyale)) as TextBranding
}
