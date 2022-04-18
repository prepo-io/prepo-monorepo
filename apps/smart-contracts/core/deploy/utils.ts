import { parse, stringify } from 'envfile'
import { Contract } from 'ethers'
import { readFileSync, writeFileSync } from 'fs'

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
