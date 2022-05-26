import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import { Moat } from '../../typechain/Moat'

chai.use(solidity)

export async function moatFixture(
  acquisitionRoyale: string,
  threshold: BigNumber,
  immunityPeriod: number
): Promise<Moat> {
  const moatFactory = await ethers.getContractFactory('Moat')
  return (await moatFactory.deploy(acquisitionRoyale, threshold, immunityPeriod)) as Moat
}
