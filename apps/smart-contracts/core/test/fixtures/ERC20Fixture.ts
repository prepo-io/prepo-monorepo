import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { ERC20 } from '../../typechain/ERC20'

chai.use(solidity)

export async function ERC20AttachFixture(tokenAddress: string): Promise<ERC20> {
  const erc20 = await ethers.getContractFactory('ERC20')
  return (await erc20.attach(tokenAddress)) as unknown as ERC20
}
