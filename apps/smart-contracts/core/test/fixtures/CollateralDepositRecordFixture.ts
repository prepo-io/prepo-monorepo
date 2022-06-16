import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import { MockContract, smock } from '@defi-wonderland/smock'
import { CollateralDepositRecord } from '../../typechain'

chai.use(solidity)

export async function collateralDepositRecordFixture(
  globalDepositCap: BigNumber,
  accountDepositCap: BigNumber
): Promise<CollateralDepositRecord> {
  const collateralDepositRecord = await ethers.getContractFactory('CollateralDepositRecord')
  return (await collateralDepositRecord.deploy(
    globalDepositCap,
    accountDepositCap
  )) as unknown as CollateralDepositRecord
}

export async function smockCollateralDepositRecordFixture(
  globalDepositCap: BigNumber,
  accountDepositCap: BigNumber
): Promise<MockContract> {
  const smockCollateralDepositRecord = await smock.mock('CollateralDepositRecord')
  return (await smockCollateralDepositRecord.deploy(
    globalDepositCap,
    accountDepositCap
  )) as MockContract
}
