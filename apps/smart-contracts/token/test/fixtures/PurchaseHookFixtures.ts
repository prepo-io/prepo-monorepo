import { ethers } from 'hardhat'
import { PurchaseHook } from '../../types/generated'

export async function purchaseHookFixture(): Promise<PurchaseHook> {
  const Factory = await ethers.getContractFactory('PurchaseHook')
  return (await Factory.deploy()) as unknown as PurchaseHook
}
