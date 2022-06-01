import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers, upgrades } from 'hardhat'
import { AcquisitionRoyaleInternship } from '../../typechain/AcquisitionRoyaleInternship'

chai.use(solidity)

export async function acquisitionRoyaleInternshipFixture(): Promise<AcquisitionRoyaleInternship> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const acquisitionRoyaleInternshipFactory: any = await ethers.getContractFactory(
    'AcquisitionRoyaleInternship'
  )
  return (await upgrades.deployProxy(acquisitionRoyaleInternshipFactory, {
    initializer: false,
  })) as unknown as AcquisitionRoyaleInternship
}
