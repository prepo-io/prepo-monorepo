import { ethers } from 'hardhat'
import { Blocklist } from '../../types/generated'

export async function blocklistFixture(nominatedOwnerAddress: string): Promise<Blocklist> {
  const Factory = await ethers.getContractFactory('Blocklist')
  return (await Factory.deploy(nominatedOwnerAddress)) as unknown as Blocklist
}
