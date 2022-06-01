import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers, upgrades } from 'hardhat'
import { AcquisitionRoyaleRPShop } from '../../typechain/AcquisitionRoyaleRPShop'

chai.use(solidity)

export async function acquisitionRoyaleRPShopFixture(): Promise<AcquisitionRoyaleRPShop> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const acquisitionRoyaleRPShopFactory: any = await ethers.getContractFactory(
    'AcquisitionRoyaleRPShop'
  )
  return (await upgrades.deployProxy(acquisitionRoyaleRPShopFactory, {
    initializer: false,
  })) as unknown as AcquisitionRoyaleRPShop
}
