/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from 'hardhat'
import { BigNumber, providers } from 'ethers'
import { MerkleTree } from 'merkletreejs'
import keccak256 from 'keccak256'

// TODO: update constant identifiers to all caps
export const AddressZero = '0x0000000000000000000000000000000000000000'
export const JunkAddress = '0x0000000000000000000000000000000000000001'
export const WEI_DENOMINATOR = ethers.utils.parseEther('1')
export const PERCENT_DENOMINATOR = BigNumber.from('10000000000')

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isolateNamedFields(object: any): any {
  return (
    Object.keys(object)
      // eslint-disable-next-line no-restricted-globals
      .filter((key) => isNaN(key as any))
      // eslint-disable-next-line no-return-assign, no-sequences
      .reduce((res: any, key) => ((res[key] = object[key]), res), {})
  )
}

export function countOccurrences(arr: Array<any>, val: any): any {
  return arr.reduce((a, v) => (v === val ? a + 1 : a), 0)
}

export function hashAddress(address: string): Buffer {
  return Buffer.from(ethers.utils.solidityKeccak256(['address'], [address]).slice(2), 'hex')
}

export function generateMerkleTree(addresses: string[]): MerkleTree {
  const leaves = addresses.map(hashAddress)
  return new MerkleTree(leaves, keccak256, { sortPairs: true })
}

export async function getLastTimestamp(): Promise<number> {
  const blockNumBefore = await ethers.provider.getBlockNumber()
  const blockBefore = await ethers.provider.getBlock(blockNumBefore)
  return blockBefore.timestamp
}

export async function setNextTimestamp(
  provider: providers.Web3Provider,
  timestamp: number
): Promise<void> {
  await provider.send('evm_setNextBlockTimestamp', [timestamp])
}

export async function mineBlocks(provider: providers.Web3Provider, blocks: number): Promise<void> {
  for (let i = 0; i < blocks; i++) {
    // eslint-disable-next-line no-await-in-loop
    await provider.send('evm_mine', [])
  }
}

export function mineBlock(provider: providers.Web3Provider, timestamp: number): Promise<void> {
  return provider.send('evm_mine', [timestamp])
}

export function revertReason(reason: string): string {
  return `VM Exception while processing transaction: reverted with reason string '${reason}'`
}
