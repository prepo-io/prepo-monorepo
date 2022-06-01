import { ethers, upgrades } from 'hardhat'
import { TokenForNativeToken } from '../../typechain/TokenForNativeToken'

export async function tokenForNativeTokenFixture(): Promise<TokenForNativeToken> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tokenForNativeTokenFactory: any = await ethers.getContractFactory('TokenForNativeToken')
  return (await upgrades.deployProxy(
    tokenForNativeTokenFactory,
    []
  )) as unknown as TokenForNativeToken
}
