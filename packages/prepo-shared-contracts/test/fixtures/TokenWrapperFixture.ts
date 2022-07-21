import { ethers } from 'hardhat'
import { TokenWrapper } from '../../types/generated'

export async function tokenWrapperFixture(): Promise<TokenWrapper> {
  const Factory = await ethers.getContractFactory('TokenWrapper')
  return (await Factory.deploy()) as TokenWrapper
}
