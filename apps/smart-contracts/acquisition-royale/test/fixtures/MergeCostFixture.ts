import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { MockMergeCost } from '../../typechain/MockMergeCost'
import { FixedMergeCost } from '../../typechain/FixedMergeCost'
import { DynamicMergeCost } from '../../typechain/DynamicMergeCost'

chai.use(solidity)

export async function mockMergeCostFixture(): Promise<MockMergeCost> {
  const mockMergeCostFactory = await ethers.getContractFactory('MockMergeCost')
  return (await mockMergeCostFactory.deploy()) as MockMergeCost
}

export async function fixedMergeCostFixture(cost: BigNumber): Promise<FixedMergeCost> {
  const fixedMergeCostFactory = await ethers.getContractFactory('FixedMergeCost')
  return (await fixedMergeCostFactory.deploy(cost)) as FixedMergeCost
}

export async function dynamicMergeCostFixture(dynamicPrice: string): Promise<DynamicMergeCost> {
  const dynamicMergeCostFactory = await ethers.getContractFactory('DynamicMergeCost')
  return (await dynamicMergeCostFactory.deploy(dynamicPrice)) as DynamicMergeCost
}
