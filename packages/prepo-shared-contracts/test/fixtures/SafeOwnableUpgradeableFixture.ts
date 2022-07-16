import { ethers, upgrades } from 'hardhat'
import { SafeOwnableUpgradeable } from '../../types/generated'

export async function safeOwnableUpgradeableFixture(): Promise<SafeOwnableUpgradeable> {
  const Factory = await ethers.getContractFactory('SafeOwnableUpgradeable')
  return (await upgrades.deployProxy(Factory)) as SafeOwnableUpgradeable
}
