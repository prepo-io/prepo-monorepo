import { parseEther } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import { MerkleTree } from 'merkletreejs'
import keccak256 from 'keccak256'

export const FEE_DENOMINATOR = 1000000
export const FEE_LIMIT = 50000
export const MAX_PRICE = parseEther('1')
export const DEFAULT_TIME_DELAY = 5

export function calculateFee(amount: BigNumber, factor: BigNumber): BigNumber {
  return amount.mul(factor).div(FEE_DENOMINATOR).add(1)
}

export function returnFromMockAPY(
  apy: number,
  timeElapsed: number,
  totalSupply: BigNumber
): BigNumber {
  const returnPerSecond = parseEther('1').mul(apy).div(100).div(31536000)
  const expectedShareValue = parseEther('1').add(returnPerSecond.mul(timeElapsed))
  return totalSupply.mul(expectedShareValue).div(parseEther('1'))
}

// calculate new amount after subtracting a percentage, represented as a 4 decimal place percent, i.e. 100% = 10000
export function subtractBps(amount: BigNumber, bps: number): BigNumber {
  return amount.sub(amount.mul(bps).div(10000))
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

export async function getLastBlockNumber(): Promise<number> {
  const currentBlock = await ethers.provider.getBlock('latest')
  return currentBlock.number
}

export function hashAddress(address: string): Buffer {
  return Buffer.from(ethers.utils.solidityKeccak256(['address'], [address]).slice(2), 'hex')
}

export function generateMerkleTree(addresses: string[]): MerkleTree {
  const leaves = addresses.map(hashAddress)
  return new MerkleTree(leaves, keccak256, { sortPairs: true })
}
