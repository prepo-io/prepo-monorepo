import { ethers, upgrades } from 'hardhat'
import { PPO } from '../../types/generated'

export async function ppoDeployFixture(): Promise<PPO> {
  const Factory = await ethers.getContractFactory('PPO')
  return (await upgrades.deployProxy(Factory, [])) as unknown as PPO
}

export async function ppoAttachFixture(tokenAddress: string): Promise<PPO> {
  const Factory = await ethers.getContractFactory('PPO')
  return (await Factory.attach(tokenAddress)) as unknown as PPO
}
