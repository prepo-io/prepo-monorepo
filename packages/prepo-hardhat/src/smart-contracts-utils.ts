import { BigNumber, providers, Contract } from 'ethers'
import { parse, stringify } from 'envfile'
import { ChainId, NETWORKS } from 'prepo-constants'
import { readFileSync, writeFileSync } from 'fs'
import { hexZeroPad } from 'ethers/lib/utils'

function expandToDecimals(n: number, decimals: number): BigNumber {
  return BigNumber.from(n).mul(BigNumber.from(10).pow(decimals))
}

function expandTo6Decimals(n: number): BigNumber {
  return BigNumber.from(n).mul(BigNumber.from(10).pow(6))
}

function expandTo18Decimals(n: number): BigNumber {
  return BigNumber.from(n).mul(BigNumber.from(10).pow(18))
}

function nowPlusMonths(n: number): number {
  const d = new Date()
  d.setMonth(d.getMonth() + n)
  d.setHours(0, 0, 0, 0)
  return d.getTime() / 1000
}

function getZeroPadHexFromAddress(address: string): string {
  return hexZeroPad(address, 32)
}

async function getLastTimestamp(provider: providers.Web3Provider): Promise<number> {
  /**
   * Changed this from ethers.provider.getBlockNumber since if evm_revert is used to return
   * to a snapshot, getBlockNumber will still return the last mined block rather than the
   * block height of the snapshot.
   */
  const currentBlock = await provider.getBlock('latest')
  return currentBlock.timestamp
}

async function setNextTimestamp(
  provider: providers.Web3Provider,
  timestamp: number
): Promise<void> {
  await provider.send('evm_setNextBlockTimestamp', [timestamp])
}

function assertIsTestnetChain(chainId: ChainId): void {
  const testChains = [
    NETWORKS.hardhat.chainId,
    NETWORKS.ropsten.chainId,
    NETWORKS.rinkeby.chainId,
    NETWORKS.goerli.chainId,
    NETWORKS.kovan.chainId,
  ]
  if (!testChains.includes(chainId)) {
    throw new Error('Deployment to production environments is disabled!')
  }
}

function recordDeployment(envVarName: string, contract: Contract): void {
  const sourcePath = '.env'
  const parsedFile = parse(readFileSync(sourcePath).toString())
  parsedFile[envVarName] = contract.address
  writeFileSync(sourcePath, stringify(parsedFile))
  /**
   * Since current process will not recognize newly updated file, we need to update the
   * process.env for the remainder of the deployment task.
   */
  process.env[envVarName] = contract.address
}

async function mineBlocks(provider: providers.Web3Provider, blocks: number): Promise<void> {
  for (let i = 0; i < blocks; i++) {
    // eslint-disable-next-line no-await-in-loop
    await provider.send('evm_mine', [])
  }
}

function mineBlock(provider: providers.Web3Provider, timestamp: number): Promise<void> {
  return provider.send('evm_mine', [timestamp])
}

function revertReason(reason: string): string {
  return `VM Exception while processing transaction: reverted with reason string '${reason}'`
}

export const utils = {
  expandToDecimals,
  expandTo6Decimals,
  expandTo18Decimals,
  nowPlusMonths,
  getZeroPadHexFromAddress,
  getLastTimestamp,
  setNextTimestamp,
  assertIsTestnetChain,
  recordDeployment,
  mineBlocks,
  mineBlock,
  revertReason,
}
