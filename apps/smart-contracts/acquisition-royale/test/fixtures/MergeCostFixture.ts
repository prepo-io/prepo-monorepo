import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { MockMergeCost } from '../../typechain/MockMergeCost'
import { FixedMergeCost } from '../../typechain/FixedMergeCost'
import { DynamicMergeCost } from '../../typechain/DynamicMergeCost'

chai.use(solidity)

export async function mockMergeCostFixture(): Promise<MockMergeCost> {
  const mockMergeCost = await ethers.getContractFactory('MockMergeCost')
  return (await mockMergeCost.deploy()) as MockMergeCost
}

export async function fixedMergeCostFixture(cost: BigNumber): Promise<FixedMergeCost> {
  const fixedMergeCost = await ethers.getContractFactory('FixedMergeCost')
  return (await fixedMergeCost.deploy(cost)) as FixedMergeCost
}

export async function dynamicMergeCostFixture(dynamicPrice: string): Promise<DynamicMergeCost> {
  const dynamicMergeCost = await ethers.getContractFactory('DynamicMergeCost')
  return (await dynamicMergeCost.deploy(dynamicPrice)) as DynamicMergeCost
}
