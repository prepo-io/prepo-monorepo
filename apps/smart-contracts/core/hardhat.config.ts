import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import '@typechain/ethers-v5'
import { config as dotenvConfig } from 'dotenv'
import 'hardhat-contract-sizer'
import 'hardhat-deploy'
import 'hardhat-gas-reporter'
import '@typechain/hardhat'
import '@openzeppelin/hardhat-upgrades'
import 'solidity-coverage'
import { generateHardhatConfig, generateHardhatLocalConfig } from 'prepo-hardhat'
import { HardhatUserConfig } from 'hardhat/config'
import { resolve } from 'path'
import './tasks/CoreFunding'
import './tasks/Markets'

dotenvConfig({ path: resolve(__dirname, './.env') })

const hardhatLocalConfig = generateHardhatLocalConfig()
const hardhatConfig = generateHardhatConfig(hardhatLocalConfig)

const config: HardhatUserConfig = {
  ...hardhatConfig,
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  typechain: {
    outDir: './typechain',
    target: 'ethers-v5',
  },
  etherscan: {
    apiKey: hardhatLocalConfig.ETHERSCAN_API_KEY,
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: false,
  },
}

export default config
