/* eslint-disable no-await-in-loop */
<<<<<<< HEAD
import { BigNumber, BigNumberish, providers } from 'ethers'
=======
import { BigNumber } from 'ethers'
>>>>>>> d09fb9c (fix: tests)
import { ethers } from 'hardhat'
import { MerkleTree } from 'merkletreejs'
import keccak256 from 'keccak256'

export const MAX_UINT64 = BigNumber.from(2).pow(64).sub(1)
export const MAX_INT64 = BigNumber.from(2).pow(63).sub(1)
export const MIN_INT64 = BigNumber.from(2).pow(63).mul(-1)
export const MAX_UINT128 = BigNumber.from(2).pow(128).sub(1)
export const ZERO = BigNumber.from(0)
export const ONE = BigNumber.from(1)
export const ZERO_HASH = ethers.utils.formatBytes32String('')
export const ONE_WEEK = BigNumber.from(60 * 60 * 24 * 7)

export type IOUPPOLeafNode = {
  account: string
  amount: BigNumber
  staked: boolean
}

export type AccountAmountLeafNode = {
  account: string
  amount: BigNumber
}

<<<<<<< HEAD
export async function setNextTimestamp(
  provider: providers.Web3Provider,
  timestamp: number
): Promise<void> {
  await provider.send('evm_setNextBlockTimestamp', [timestamp])
}

=======
>>>>>>> 6a58e4d (feat: move smart contract core utils)
export async function getLastTimestamp(): Promise<number> {
  /**
   * Changed this from ethers.provider.getBlockNumber since if evm_revert is used to return
   * to a snapshot, getBlockNumber will still return the last mined block rather than the
   * block height of the snapshot.
   */
  const currentBlock = await ethers.provider.getBlock('latest')
  return currentBlock.timestamp
}

export function getZeroPadHexFromAddress(address: string): string {
  return ethers.utils.hexZeroPad(address, 32)
}

export function revertReason(reason: string): string {
  return reason
}

export function hashIOUPPOLeafNode(leaf: IOUPPOLeafNode): Buffer {
  /**
   * slice(2) removes '0x' from the hash
   */
  return Buffer.from(
    ethers.utils
      .solidityKeccak256(['address', 'uint256', 'bool'], [leaf.account, leaf.amount, leaf.staked])
      .slice(2),
    'hex'
  )
}

export function generateMerkleTreeIOUPPO(leaves: IOUPPOLeafNode[]): MerkleTree {
  const leafNodes = leaves.map(hashIOUPPOLeafNode)
  return new MerkleTree(leafNodes, keccak256, { sortPairs: true })
}

export function hashAccountAmountLeafNode(leaf: AccountAmountLeafNode): Buffer {
  // slice(2) removes '0x' from the hash
  return Buffer.from(
    ethers.utils.solidityKeccak256(['address', 'uint256'], [leaf.account, leaf.amount]).slice(2),
    'hex'
  )
}

export function generateAccountAmountMerkleTree(leaves: AccountAmountLeafNode[]): MerkleTree {
  const leafNodes = leaves.map(hashAccountAmountLeafNode)
  return new MerkleTree(leafNodes, keccak256, { sortPairs: true })
}

/**
 * Calculate the new weighted timestamp after depositing or withdrawing PPO
 * @param oldWeightedTimestamp
 * @param currentTimestamp
 * @param oldStakedBalance
 * @param stakedDelta The absolute difference between new and old balances. Always positive
 * @param staking True if depositing, false if withdrawing PPO from a staked position
 * @returns New weighted timestamp
 */
export function calcWeightedTimestamp(
  oldWeightedTimestamp: BigNumberish,
  currentTimestamp: BigNumberish,
  oldStakedBalance: BigNumber,
  stakedDelta: BigNumber,
  staking: boolean
): number {
  const oldWeightedTimestampBN = BigNumber.from(oldWeightedTimestamp)
  const currentTimestampBN = BigNumber.from(currentTimestamp)
  const oldWeightedSeconds = currentTimestampBN.sub(oldWeightedTimestampBN)
  const adjustedStakedBalanceDelta = staking ? stakedDelta.div(2) : stakedDelta.div(8)
  const adjustedNewStakedBalance = staking
    ? oldStakedBalance.add(adjustedStakedBalanceDelta)
    : oldStakedBalance.sub(adjustedStakedBalanceDelta)
  const newWeightedSeconds = staking
    ? oldStakedBalance.mul(oldWeightedSeconds).div(adjustedNewStakedBalance)
    : adjustedNewStakedBalance.mul(oldWeightedSeconds).div(oldStakedBalance)

  return currentTimestampBN.sub(newWeightedSeconds).toNumber()
}

/**
 * Calculate when to subsequently deposit/withdraw PPO to obtain a certain weighted timestamp
 * @param oldWeightedTimestamp
 * @param weightedTimeDelta The desired increase in time from the previous weighted timestamp
 * @param oldStakedBalance
 * @param stakedDelta The absolute difference between new and old balances. Always positive
 * @param staking True if depositing, false if withdrawing PPO from a staked position
 * @returns Time at which to stake to achieve the desired weighted timestamp
 */
export function calcTimeToStakeAt(
  oldWeightedTimestamp: BigNumberish,
  weightedTimeDelta: BigNumberish,
  oldStakedBalance: BigNumber,
  stakedDelta: BigNumber,
  staking: boolean
): number {
  const oldWeightedTimestampBN = BigNumber.from(oldWeightedTimestamp)
  const weightedTimeDeltaBN = BigNumber.from(weightedTimeDelta)
  const adjustedStakedBalanceDelta = staking ? stakedDelta.div(2) : stakedDelta.div(8)
  const adjustedNewStakedBalance = staking
    ? oldStakedBalance.add(adjustedStakedBalanceDelta)
    : oldStakedBalance.sub(adjustedStakedBalanceDelta)
  const newWeightedDelta = staking
    ? adjustedNewStakedBalance.mul(weightedTimeDeltaBN).div(oldStakedBalance)
    : oldStakedBalance.mul(weightedTimeDeltaBN).div(adjustedNewStakedBalance)
  return newWeightedDelta.add(oldWeightedTimestampBN).toNumber()
}

export function divRoundingUp(num: BigNumber, denominator: BigNumber): BigNumber {
  const res = num.div(denominator)
  const remainder = num.mod(denominator)
  if (remainder.eq(0)) return res
  return res.add(1)
}
