import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { MockContract, smock } from '@defi-wonderland/smock'
import { DepositHook, WithdrawHook } from '../../typechain'

chai.use(solidity)

export async function depositHookFixture(
  accountAccessController: string,
  depositRecordAddress: string
): Promise<DepositHook> {
  const depositHook = await ethers.getContractFactory('DepositHook')
  return (await depositHook.deploy(accountAccessController, depositRecordAddress)) as DepositHook
}

export async function withdrawHookFixture(depositRecordAddress: string): Promise<WithdrawHook> {
  const withdrawHook = await ethers.getContractFactory('WithdrawHook')
  return (await withdrawHook.deploy(depositRecordAddress)) as WithdrawHook
}

export async function smockDepositHookFixture(
  accountAccessController: string,
  depositRecordAddress: string
): Promise<MockContract> {
  const smockDepositHookFactory = await smock.mock('DepositHook')
  return smockDepositHookFactory.deploy(accountAccessController, depositRecordAddress)
}

export async function smockWithdrawHookFixture(
  depositRecordAddress: string
): Promise<MockContract> {
  const smockWithdrawHookFactory = await smock.mock('WithdrawHook')
  return smockWithdrawHookFactory.deploy(depositRecordAddress)
}
