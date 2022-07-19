import { ethers } from 'hardhat'
import { RestrictedTransferHook, UnrestrictedTransferHook } from '../../types/generated'

export async function restrictedTransferHookFixture(
  nominatedOwnerAddress: string
): Promise<RestrictedTransferHook> {
  const Factory = await ethers.getContractFactory('RestrictedTransferHook')
  return (await Factory.deploy(nominatedOwnerAddress)) as RestrictedTransferHook
}

export async function unrestrictedTransferHookFixture(
  nominatedOwnerAddress: string
): Promise<UnrestrictedTransferHook> {
  const Factory = await ethers.getContractFactory('UnrestrictedTransferHook')
  return (await Factory.deploy(nominatedOwnerAddress)) as UnrestrictedTransferHook
}
