import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { AcqrHookV1 } from '../../typechain'

chai.use(solidity)

export async function acqrHookV1Fixture(
  acquisitionRoyale: string,
  moat: string
): Promise<AcqrHookV1> {
  const acqrHookV1 = await ethers.getContractFactory('AcqrHookV1')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (await acqrHookV1.deploy(acquisitionRoyale, moat)) as any
}
