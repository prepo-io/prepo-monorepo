import { ethers } from 'hardhat'
import { AcqRoyaleActionHook } from '../../typechain/AcqRoyaleActionHook'

export async function acqRoyaleActionHookFixture(): Promise<AcqRoyaleActionHook> {
  const Factory = await ethers.getContractFactory('AcqRoyaleActionHook')
  return (await Factory.deploy()) as AcqRoyaleActionHook
}
