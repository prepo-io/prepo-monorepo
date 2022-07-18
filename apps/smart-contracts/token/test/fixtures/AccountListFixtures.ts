import { ethers } from 'hardhat'
import { AccountList } from '../../types/generated'

export async function accountListFixture(nominatedOwnerAddress: string): Promise<AccountList> {
  const Factory = await ethers.getContractFactory('AccountList')
  return (await Factory.deploy(nominatedOwnerAddress)) as AccountList
}
