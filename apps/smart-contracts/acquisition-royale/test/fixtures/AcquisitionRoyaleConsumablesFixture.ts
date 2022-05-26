import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { AcquisitionRoyaleConsumables } from '../../typechain/AcquisitionRoyaleConsumables'

chai.use(solidity)

export async function acquisitionRoyaleConsumablesFixture(
  name: string,
  symbol: string,
  rebrandURI: string,
  renameURI: string,
  reviveURI: string,
  acquisitionRoyale: string
): Promise<AcquisitionRoyaleConsumables> {
  const acquisitionRoyaleConsumablesFactory = await ethers.getContractFactory(
    'AcquisitionRoyaleConsumables'
  )
  return (await acquisitionRoyaleConsumablesFactory.deploy(
    name,
    symbol,
    rebrandURI,
    renameURI,
    reviveURI,
    acquisitionRoyale
  )) as AcquisitionRoyaleConsumables
}
