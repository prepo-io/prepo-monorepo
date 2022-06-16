import { ethers } from 'hardhat'
import { WithdrawalRights } from '../../types/generated'

export async function withdrawalRightsFixture(governance: string): Promise<WithdrawalRights> {
  const Factory = await ethers.getContractFactory('WithdrawalRights')
  return (await Factory.deploy(governance)) as unknown as WithdrawalRights
}
