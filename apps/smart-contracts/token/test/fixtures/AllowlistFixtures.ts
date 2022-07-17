import { ethers } from 'hardhat'
import { Allowlist } from '../../types/generated'

export async function allowlistFixture(nominatedOwnerAddress: string): Promise<Allowlist> {
  const Factory = await ethers.getContractFactory('Allowlist')
  return (await Factory.deploy(nominatedOwnerAddress)) as unknown as Allowlist
}
