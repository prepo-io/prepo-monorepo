import { ethers } from 'hardhat'
import { RestrictedTransferHook, BlocklistTransferHook } from '../../types/generated'

export async function restrictedTransferHookFixture(
  nominatedOwnerAddress: string
): Promise<RestrictedTransferHook> {
  const Factory = await ethers.getContractFactory('RestrictedTransferHook')
  return (await Factory.deploy(nominatedOwnerAddress)) as RestrictedTransferHook
}

export async function blocklistTransferHookFixture(
  nominatedOwnerAddress: string
): Promise<BlocklistTransferHook> {
  const Factory = await ethers.getContractFactory('BlocklistTransferHook')
  return (await Factory.deploy(nominatedOwnerAddress)) as BlocklistTransferHook
}
