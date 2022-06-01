import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { AcquisitionRoyalePartnership } from '../../typechain/AcquisitionRoyalePartnership'

chai.use(solidity)

export async function acquisitionRoyalePartnershipFixture(): Promise<AcquisitionRoyalePartnership> {
  const acquisitionRoyalePartnershipFactory = await ethers.getContractFactory(
    'AcquisitionRoyalePartnership'
  )
  return (await acquisitionRoyalePartnershipFactory.deploy()) as AcquisitionRoyalePartnership
}
