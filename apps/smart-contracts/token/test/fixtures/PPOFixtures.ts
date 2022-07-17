import { ethers, upgrades } from 'hardhat'
import { PPO } from '../../types/generated'

export async function ppoFixture(
  name: string,
  symbol: string,
  nominatedOwnerAddress: string
): Promise<PPO> {
  const Factory = await ethers.getContractFactory('PPO')
  return (await upgrades.deployProxy(Factory, [name, symbol, nominatedOwnerAddress])) as PPO
}
