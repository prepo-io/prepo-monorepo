import { ethers } from 'hardhat'
import { MockContract, smock } from '@defi-wonderland/smock'
import { AccountList } from '../../types/generated'

export async function accountListFixture(nominatedOwnerAddress: string): Promise<AccountList> {
  const Factory = await ethers.getContractFactory('AccountList')
  return (await Factory.deploy(nominatedOwnerAddress)) as AccountList
}

export async function smockAccountListFixture(
  nominatedOwnerAddress: string
): Promise<MockContract> {
  const smockAccountListFactory = await smock.mock('AccountList')
  return (await smockAccountListFactory.deploy(nominatedOwnerAddress)) as MockContract
}
