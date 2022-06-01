import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { FundraiseCost } from '../../typechain/FundraiseCost'
import { MockFundraiseCost } from '../../typechain/MockFundraiseCost'

chai.use(solidity)

export async function mockFundraiseCostFixture(): Promise<MockFundraiseCost> {
  const mockFundraiseCostFactory = await ethers.getContractFactory('MockFundraiseCost')
  return (await mockFundraiseCostFactory.deploy()) as MockFundraiseCost
}

export async function fundraiseCostFixture(
  dynamicPrice: string,
  threshold: BigNumber
): Promise<FundraiseCost> {
  const fundraiseCost = await ethers.getContractFactory('FundraiseCost')
  return (await fundraiseCost.deploy(dynamicPrice, threshold)) as FundraiseCost
}
