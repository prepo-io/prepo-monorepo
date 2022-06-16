import { ethers } from 'hardhat'
import { PregenesisPoints } from '../../types/generated'

export async function pregenesisPointsFixture(
  pregenPointsOwner: string,
  pregenPointsName: string,
  pregenPointsSymbol: string
): Promise<PregenesisPoints> {
  const Factory = await ethers.getContractFactory('PregenesisPoints')
  return (await Factory.deploy(
    pregenPointsOwner,
    pregenPointsName,
    pregenPointsSymbol
  )) as PregenesisPoints
}
