import { ethers } from 'hardhat'
import { TokenShop } from '../../types/generated'

export async function tokenShopFixture(owner: string, paymentToken: string): Promise<TokenShop> {
  const Factory = await ethers.getContractFactory('TokenShop')
  return (await Factory.deploy(owner, paymentToken)) as unknown as TokenShop
}
