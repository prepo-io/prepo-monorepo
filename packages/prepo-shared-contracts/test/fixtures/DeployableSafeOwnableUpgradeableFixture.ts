import { ethers, upgrades } from 'hardhat'
import { DeployableSafeOwnableUpgradeable } from '../../types/generated'

export async function deployableSafeOwnableUpgradeableFixture(): Promise<DeployableSafeOwnableUpgradeable> {
  const Factory = await ethers.getContractFactory('DeployableSafeOwnableUpgradeable')
  return (await upgrades.deployProxy(Factory)) as DeployableSafeOwnableUpgradeable
}
