import { parse, stringify } from 'envfile'
import { BigNumber, Contract } from 'ethers'
import { readFileSync, writeFileSync } from 'fs'

export const ZERO = BigNumber.from(0)
export const ONE = BigNumber.from(1)
export const TWO = BigNumber.from(2)
export const E18 = BigNumber.from(10).pow(18)
export const MAX_FEE = BigNumber.from(10000)
export const FEE_DENOMINATOR = BigNumber.from(1000000)

export function nowPlusMonths(n: number): number {
  const d = new Date()
  d.setMonth(d.getMonth() + n)
  d.setHours(0, 0, 0, 0)
  return d.getTime() / 1000
}

export function recordDeployment(envVarName: string, contract: Contract): void {
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

export function assertIsTestnetChain(chainId: string): void {
  const testChains = ['31337', '3', '4', '5', '42']
  if (!testChains.includes(chainId)) {
    throw new Error('Deployment to production environments is disabled!')
  }
}
