/* eslint-disable no-await-in-loop */
import { BigNumber, providers } from 'ethers'
import { ethers } from 'hardhat'
import { MerkleTree } from 'merkletreejs'
import keccak256 from 'keccak256'

export const JunkAddress = '0x0000000000000000000000000000000000000001'
export const MAX_UINT64 = BigNumber.from(2).pow(64).sub(1)
export const MAX_INT64 = BigNumber.from(2).pow(63).sub(1)
export const MIN_INT64 = BigNumber.from(2).pow(63).mul(-1)
export const MAX_UINT128 = BigNumber.from(2).pow(128).sub(1)
export const ZERO = BigNumber.from(0)
export const ONE = BigNumber.from(1)
export const ZERO_HASH = ethers.utils.formatBytes32String('')
export const ONE_WEEK = BigNumber.from(60 * 60 * 24 * 7)

export function expandToDecimals(n: number, decimals: number): BigNumber {
  return BigNumber.from(n).mul(BigNumber.from(10).pow(decimals))
}

export function expandTo6Decimals(n: number): BigNumber {
  return BigNumber.from(n).mul(BigNumber.from(10).pow(6))
}

export function expandTo18Decimals(n: number): BigNumber {
  return BigNumber.from(n).mul(BigNumber.from(10).pow(18))
}

export function nowPlusMonths(n: number): number {
  const d = new Date()
  d.setMonth(d.getMonth() + n)
  d.setHours(0, 0, 0, 0)
  return d.getTime() / 1000
}

export async function setNextTimestamp(
  provider: providers.Web3Provider,
  timestamp: number
): Promise<void> {
  await provider.send('evm_setNextBlockTimestamp', [timestamp])
}

export async function mineBlocks(provider: providers.Web3Provider, blocks: number): Promise<void> {
  for (let i = 0; i < blocks; i++) {
    await provider.send('evm_mine', [])
  }
}

export function mineBlock(provider: providers.Web3Provider, timestamp: number): Promise<void> {
  return provider.send('evm_mine', [timestamp])
}

export async function getLastTimestamp(): Promise<number> {
  /**
   * Changed this from ethers.provider.getBlockNumber since if evm_revert is used to return
   * to a snapshot, getBlockNumber will still return the last mined block rather than the
   * block height of the snapshot.
   */
  const currentBlock = await ethers.provider.getBlock('latest')
  return currentBlock.timestamp
}

export function revertReason(reason: string): string {
  return reason
}

export function getZeroPadHexFromAddress(address: string): string {
  return ethers.utils.hexZeroPad(address, 32)
}

export type IOUPPOLeafNode = {
  account: string
  amount: BigNumber
  staked: boolean
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

export type AccountAmountLeafNode = {
  account: string
  amount: BigNumber
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
