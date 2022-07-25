import { ethers } from 'hardhat'
import { WithdrawTokens } from '../../types/generated'

export async function withdrawTokensFixture(): Promise<WithdrawTokens> {
  const Factory = await ethers.getContractFactory('WithdrawTokens')
  return (await Factory.deploy()) as WithdrawTokens
}
