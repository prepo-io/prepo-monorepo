import { ethers } from 'hardhat'
import { RestrictedTransferHook } from '../../types/generated'

export async function restrictedTransferHookFixture(
  nominatedOwnerAddress: string
): Promise<RestrictedTransferHook> {
  const Factory = await ethers.getContractFactory('RestrictedTransferHook')
  return (await Factory.deploy(nominatedOwnerAddress)) as RestrictedTransferHook
}
