// eslint-disable no-console
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { fetchExistingCollateral, sendTxAndWait } from './helpers'
import { assertIsTestnetChain } from './utils'

const deployFunction: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  ethers,
  getChainId,
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  console.log('Running MockStrategy deployment script with', deployer, 'as the deployer')
  const currentChain = await getChainId()
  /**
   * Make sure this script is not accidentally targeted towards a production environment,
   * this can be removed once we deploy to prod.
   * TODO Only deploy "Mock" contracts when on a testchain
   */
  assertIsTestnetChain(currentChain)
  // Fetch existing Collateral deployment from local .env
  const collateral = await fetchExistingCollateral(currentChain, ethers)
  // Retrieve existing non-upgradeable deployments using hardhat-deploy
  const singleStrategyController = await ethers.getContract('SingleStrategyController')
  const baseToken = await ethers.getContract('MockBaseToken')
  // Deploy MockStrategy contract and configure for use
  const { address: mockStrategyAddress, newlyDeployed } = await deploy('MockStrategy', {
    from: deployer,
    deterministicDeployment: false,
    args: [singleStrategyController.address, baseToken.address],
    skipIfAlreadyDeployed: true,
  })
  const mockStrategy = await ethers.getContract('MockStrategy')
  if (newlyDeployed) {
    console.log('Deployed MockStrategy to', mockStrategyAddress)
  } else {
    console.log('Existing MockStrategy at', mockStrategyAddress)
  }
  // Migrate currently deployed SingleStrategyController to use this strategy
  if ((await singleStrategyController.getStrategy()) !== mockStrategyAddress) {
    console.log('Migrating StrategyController to the new Strategy...')
    await sendTxAndWait(await singleStrategyController.migrate(mockStrategyAddress))
  }
  // MockStrategy need permission to call `mint()` on MockBaseToken to mint virtual yields
  // TODO Only perform this operation when on a testchain
  if ((await baseToken.getMockStrategy()) !== mockStrategyAddress) {
    console.log('Connecting MockBaseToken at', baseToken.address, 'to the MockStrategy...')
    await sendTxAndWait(await baseToken.setMockStrategy(mockStrategyAddress))
  }
  // Connect MockStrategy to the Collateral vault
  if ((await mockStrategy.vault()) !== collateral.address) {
    console.log('Connecting MockStrategy at', mockStrategy.address, 'to the Collateral vault...')
    await sendTxAndWait(await mockStrategy.setVault(collateral.address))
  }
  console.log('')
}

export default deployFunction

deployFunction.dependencies = ['Collateral']

deployFunction.tags = ['MockStrategy']
