import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { AcqrHookV1 } from '../../typechain'

chai.use(solidity)

export async function acqrHookV1Fixture(
  acquisitionRoyale: string,
  moat: string
): Promise<AcqrHookV1> {
  const acqrHookV1Factory = await ethers.getContractFactory('AcqrHookV1')
  return (await acqrHookV1Factory.deploy(acquisitionRoyale, moat)) as AcqrHookV1
}
