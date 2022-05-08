import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { assertIsTestnetChain } from './utils'

const deployFunction: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  getChainId,
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  console.log('Running MockBaseToken deployment script with', deployer, 'as the deployer')
  const currentChain = await getChainId()
  /**
   * Make sure this script is not accidentally targeted towards a production environment,
   * this can be removed once we deploy to prod.
   * TODO Only deploy "Mock" contracts when on a testchain
   */
  assertIsTestnetChain(currentChain)
  const { address: mockBaseTokenAddress, newlyDeployed } = await deploy('MockBaseToken', {
    from: deployer,
    contract: 'MockBaseToken',
    deterministicDeployment: false,
    args: ['Fake USD', 'FAKEUSD'],
    skipIfAlreadyDeployed: true,
  })
  if (newlyDeployed) {
    console.log('Deployed MockBaseToken to', mockBaseTokenAddress)
  } else {
    console.log('Existing MockBaseToken at', mockBaseTokenAddress)
  }
  console.log('')
}

export default deployFunction

deployFunction.tags = ['MockBaseToken']
