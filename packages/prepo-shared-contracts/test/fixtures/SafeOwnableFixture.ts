import { ethers } from 'hardhat'
import { SafeOwnable } from '../../types/generated'

export async function safeOwnableFixture(): Promise<SafeOwnable> {
  const Factory = await ethers.getContractFactory('SafeOwnable')
  return (await Factory.deploy()) as SafeOwnable
}
