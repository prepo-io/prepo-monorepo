import { ethers } from 'hardhat'
import { PausableWrapper } from '../../types/generated'

export async function pausableWrapperFixture(): Promise<PausableWrapper> {
  const Factory = await ethers.getContractFactory('PausableWrapper')
  return (await Factory.deploy()) as PausableWrapper
}
