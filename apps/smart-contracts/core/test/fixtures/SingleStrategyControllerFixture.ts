import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { SingleStrategyController } from '../../typechain/SingleStrategyController'

chai.use(solidity)

export async function singleStrategyControllerFixture(
  token: string
): Promise<SingleStrategyController> {
  const singleStrategyController = await ethers.getContractFactory('SingleStrategyController')
  return (await singleStrategyController.deploy(token)) as unknown as SingleStrategyController
}
