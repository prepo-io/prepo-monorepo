/* eslint-disable no-await-in-loop */
import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import { MerkleTree } from 'merkletreejs'
import keccak256 from 'keccak256'

export type IOUPPOLeafNode = {
  account: string
  amount: BigNumber
  staked: boolean
}

export type AccountAmountLeafNode = {
  account: string
  amount: BigNumber
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
