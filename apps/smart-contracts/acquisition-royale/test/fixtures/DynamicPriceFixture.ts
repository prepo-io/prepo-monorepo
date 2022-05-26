import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { DynamicPrice } from '../../typechain/DynamicPrice'

chai.use(solidity)

export async function dynamicPriceFixture(): Promise<DynamicPrice> {
  const dynamicPriceFactory = await ethers.getContractFactory('DynamicPrice')
  return (await dynamicPriceFactory.deploy()) as DynamicPrice
}
