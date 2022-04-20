import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { MockAcquireCost } from '../../typechain/MockAcquireCost'
import { FixedAcquireCost } from '../../typechain/FixedAcquireCost'
import { DynamicAcquireCost } from '../../typechain/DynamicAcquireCost'

chai.use(solidity)

export async function mockAcquireCostFixture(): Promise<MockAcquireCost> {
  const mockAcquireCost = await ethers.getContractFactory('MockAcquireCost')
  return (await mockAcquireCost.deploy()) as MockAcquireCost
}

export async function fixedAcquireCostFixture(
  mergeCost: string,
  cost: BigNumber,
  fee: number
): Promise<FixedAcquireCost> {
  const fixedAcquireCost = await ethers.getContractFactory('FixedAcquireCost')
  return (await fixedAcquireCost.deploy(mergeCost, cost, fee)) as FixedAcquireCost
}

export async function dynamicAcquireCostFixture(
  mergeCost: string,
  dynamicPrice: string,
  fee: number
): Promise<DynamicAcquireCost> {
  const dynamicAcquireCost = await ethers.getContractFactory('DynamicAcquireCost')
  return (await dynamicAcquireCost.deploy(mergeCost, dynamicPrice, fee)) as DynamicAcquireCost
}
