import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { MockAcquireCost } from '../../typechain/MockAcquireCost'
import { FixedAcquireCost } from '../../typechain/FixedAcquireCost'
import { DynamicAcquireCost } from '../../typechain/DynamicAcquireCost'

chai.use(solidity)

export async function mockAcquireCostFixture(): Promise<MockAcquireCost> {
  const mockAcquireCostFactory = await ethers.getContractFactory('MockAcquireCost')
  return (await mockAcquireCostFactory.deploy()) as MockAcquireCost
}

export async function fixedAcquireCostFixture(
  mergeCost: string,
  cost: BigNumber,
  fee: number
): Promise<FixedAcquireCost> {
  const fixedAcquireCostFactory = await ethers.getContractFactory('FixedAcquireCost')
  return (await fixedAcquireCostFactory.deploy(mergeCost, cost, fee)) as FixedAcquireCost
}

export async function dynamicAcquireCostFixture(
  mergeCost: string,
  dynamicPrice: string,
  fee: number
): Promise<DynamicAcquireCost> {
  const dynamicAcquireCostFactory = await ethers.getContractFactory('DynamicAcquireCost')
  return (await dynamicAcquireCostFactory.deploy(
    mergeCost,
    dynamicPrice,
    fee
  )) as DynamicAcquireCost
}
