import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { RunwayPoints } from '../../typechain/RunwayPoints'

chai.use(solidity)

export async function runwayPointsFixture(royale: string): Promise<RunwayPoints> {
  const runwayPointsFactory = await ethers.getContractFactory('RunwayPoints')
  return (await runwayPointsFactory.deploy(royale)) as RunwayPoints
}
