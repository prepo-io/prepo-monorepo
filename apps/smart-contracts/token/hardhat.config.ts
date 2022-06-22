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
  typechain: {
    outDir: 'types/generated',
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
