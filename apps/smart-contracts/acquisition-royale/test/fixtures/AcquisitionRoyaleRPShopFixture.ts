import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers, upgrades } from 'hardhat'
import { AcquisitionRoyaleRPShop } from '../../typechain/AcquisitionRoyaleRPShop'

chai.use(solidity)

export async function acquisitionRoyaleRPShopFixture(): Promise<AcquisitionRoyaleRPShop> {
  const acquisitionRoyaleRPShop = await ethers.getContractFactory('AcquisitionRoyaleRPShop')
  return (await upgrades.deployProxy(acquisitionRoyaleRPShop, {
    initializer: false,
  })) as AcquisitionRoyaleRPShop
}
