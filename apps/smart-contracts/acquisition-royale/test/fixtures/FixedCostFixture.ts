import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { FixedCost } from '../../typechain/FixedCost'

chai.use(solidity)

type FixedCostParams = {
  amountToRecipient: BigNumber
  amountToTreasury: BigNumber
  amountToBurn: BigNumber
}

export async function fixedCostFixture(params: FixedCostParams): Promise<FixedCost> {
  const fixedCost = await ethers.getContractFactory('FixedCost')
  return (await fixedCost.deploy(
    params.amountToRecipient,
    params.amountToTreasury,
    params.amountToBurn
  )) as FixedCost
}
