import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers, upgrades } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { BigNumber } from 'ethers'
import { AcquisitionRoyale } from '../../typechain/AcquisitionRoyale'
import { MockAcquisitionRoyale } from '../../typechain/MockAcquisitionRoyale'

chai.use(solidity)

export type PriceAndTimeParams = {
  caller: SignerWithAddress
  royale: AcquisitionRoyale
  startPrice: BigNumber
  endPrice: BigNumber
  startTime: number
  endTime: number
}

export type PassiveRpParams = {
  caller: SignerWithAddress
  royale: AcquisitionRoyale
  max: BigNumber
  base: BigNumber
  acquisitions: BigNumber
  mergers: BigNumber
}

/** setting initializer to false so we can initialize after RunwayPoints is deployed,
 *  because RunwayPoints needs the address of the AcquisitionRoyale contract in its constructor
 */
export async function acquisitionRoyaleFixture(): Promise<AcquisitionRoyale> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const acquisitionRoyaleFactory: any = await ethers.getContractFactory('AcquisitionRoyale')
  return (await upgrades.deployProxy(acquisitionRoyaleFactory, {
    initializer: false,
  })) as unknown as AcquisitionRoyale
}

export async function mockAcquisitionRoyaleFixture(): Promise<MockAcquisitionRoyale> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockAcquisitionRoyaleFactory: any = await ethers.getContractFactory('MockAcquisitionRoyale')
  return (await upgrades.deployProxy(mockAcquisitionRoyaleFactory, {
    initializer: false,
  })) as unknown as MockAcquisitionRoyale
}

export async function setFoundingPriceAndTimeFixture(params: PriceAndTimeParams): Promise<void> {
  await params.royale
    .connect(params.caller)
    .setFoundingPriceAndTime(params.startPrice, params.endPrice, params.startTime, params.endTime)
}

export async function setPassiveRpPerDayFixture(params: PassiveRpParams): Promise<void> {
  await params.royale
    .connect(params.caller)
    .setPassiveRpPerDay(params.max, params.base, params.acquisitions, params.mergers)
}
