import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers, upgrades } from 'hardhat'
import { AcquisitionRoyaleInternship } from '../../typechain/AcquisitionRoyaleInternship'

chai.use(solidity)

export async function acquisitionRoyaleInternshipFixture(): Promise<AcquisitionRoyaleInternship> {
  const acquisitionRoyaleInternship = await ethers.getContractFactory('AcquisitionRoyaleInternship')
  return (await upgrades.deployProxy(acquisitionRoyaleInternship, {
    initializer: false,
  })) as AcquisitionRoyaleInternship
}
