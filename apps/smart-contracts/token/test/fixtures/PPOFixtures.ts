import { ethers, upgrades } from 'hardhat'
import { PPO } from '../../types/generated'

export async function ppoFixture(governanceAddress: string): Promise<PPO> {
  const Factory = await ethers.getContractFactory('PPO')
  return (await upgrades.deployProxy(Factory, [governanceAddress])) as PPO
}
