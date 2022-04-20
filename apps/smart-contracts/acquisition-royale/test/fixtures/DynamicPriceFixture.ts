import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { DynamicPrice } from '../../typechain/DynamicPrice'

chai.use(solidity)

export async function dynamicPriceFixture(): Promise<DynamicPrice> {
  const dynamicPrice = await ethers.getContractFactory('DynamicPrice')
  return (await dynamicPrice.deploy()) as DynamicPrice
}
