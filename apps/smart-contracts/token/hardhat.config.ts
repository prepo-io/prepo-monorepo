import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-etherscan'
import '@nomicfoundation/hardhat-chai-matchers'
import '@openzeppelin/hardhat-upgrades'
import '@typechain/ethers-v5'
import '@typechain/hardhat'
import { generateHardhatConfig, generateHardhatLocalConfig } from 'prepo-hardhat'
import { config as dotenvConfig } from 'dotenv'
import 'hardhat-contract-sizer'
import 'hardhat-gas-reporter'
import { HardhatUserConfig } from 'hardhat/config'
import { resolve } from 'path'
import 'solidity-coverage'

dotenvConfig({ path: resolve(__dirname, './.env') })

const hardhatLocalConfig = generateHardhatLocalConfig()
const hardhatConfig = generateHardhatConfig(hardhatLocalConfig)

const config: HardhatUserConfig = {
  ...hardhatConfig,
  solidity: {
    compilers: [
      {
        version: '0.8.7',
        settings: {
          optimizer: {
            enabled: true,
            runs: 25000,
          },
        },
      },
      {
        version: '0.8.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          outputSelection: {
            '*': {
              Masset: ['storageLayout'],
              FeederPool: ['storageLayout'],
              EmissionsController: ['storageLayout'],
              SavingsContract: ['storageLayout'],
            },
          },
        },
      },
    ],
  },
  typechain: {
    outDir: 'types/generated',
    target: 'ethers-v5',
  },
  /**
   * This can't be put in the shared local config since the `etherscan` field
   * is not a native Hardhat field and injected by `@nomiclabs/hardhat-ethers`.
   */
  etherscan: {
    apiKey: {
      // ethereum
      mainnet: hardhatLocalConfig.ETHERSCAN_API_KEY,
      ropsten: hardhatLocalConfig.ETHERSCAN_API_KEY,
      rinkeby: hardhatLocalConfig.ETHERSCAN_API_KEY,
      goerli: hardhatLocalConfig.ETHERSCAN_API_KEY,

      // optimism
      optimisticEthereum: hardhatLocalConfig.OPTIMISTIC_ETHERSCAN_API_KEY,

      // polygon
      polygon: hardhatLocalConfig.POLYGONSCAN_API_KEY,
      polygonMumbai: hardhatLocalConfig.POLYGONSCAN_API_KEY,
    },
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: false,
  },
}

export default config
