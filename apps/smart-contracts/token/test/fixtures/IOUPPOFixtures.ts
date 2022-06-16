import { ethers, upgrades } from 'hardhat'
import { IOUPPO } from '../../types/generated'

export async function iouPPOFixture(iouPPOOwner: string): Promise<IOUPPO> {
  const Factory = await ethers.getContractFactory('IOUPPO')
  return (await upgrades.deployProxy(Factory, [iouPPOOwner])) as IOUPPO
}
