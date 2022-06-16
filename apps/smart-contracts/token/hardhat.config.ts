import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-etherscan'
import '@nomicfoundation/hardhat-chai-matchers'
import '@openzeppelin/hardhat-upgrades'
import '@typechain/ethers-v5'
import '@typechain/hardhat'
import { config as dotenvConfig } from 'dotenv'
import 'hardhat-contract-sizer'
import 'hardhat-gas-reporter'
import { HardhatUserConfig } from 'hardhat/config'
import { HDAccountsUserConfig, NetworkUserConfig } from 'hardhat/types'
import { resolve } from 'path'
import 'solidity-coverage'

dotenvConfig({ path: resolve(__dirname, './.env') })

// https://hardhat.org/config/

const chainIds = {
  ganache: 1337,
  goerli: 5,
  hardhat: 31337,
  kovan: 42,
  mainnet: 1,
  rinkeby: 4,
  ropsten: 3,
}

// Ensure that we have all the environment variables we need.
let mnemonic: string
if (!process.env.MNEMONIC) {
  throw new Error('Please set your MNEMONIC in a .env file')
} else {
  mnemonic = process.env.MNEMONIC
}
let infuraApiKey: string
if (!process.env.INFURA_API_KEY) {
  throw new Error('Please set your INFURA_API_KEY in a .env file')
} else {
  infuraApiKey = process.env.INFURA_API_KEY
}
let etherscanApiKey: string
if (!process.env.ETHERSCAN_API_KEY) {
  throw new Error('Please set your ETHERSCAN_API_KEY in a .env file')
} else {
  etherscanApiKey = process.env.ETHERSCAN_API_KEY
}

export const accounts: HDAccountsUserConfig = {
  count: 20,
  initialIndex: 0,
  mnemonic,
}

function createTestnetConfig(network: keyof typeof chainIds): NetworkUserConfig {
  const url = `https://${network}.infura.io/v3/${infuraApiKey}`
  return {
    accounts,
    chainId: chainIds[network],
    url,
  }
}

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.7',
        settings: {
          optimizer: {
            enabled: true,
            runs: 99999,
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
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      accounts,
      chainId: chainIds.hardhat,
      gas: 'auto',
    },
    goerli: createTestnetConfig('goerli'),
    kovan: createTestnetConfig('kovan'),
    rinkeby: createTestnetConfig('rinkeby'),
    ropsten: createTestnetConfig('ropsten'),
  },
  paths: {
    artifacts: './artifacts',
    cache: './cache',
    sources: './contracts',
    tests: './test',
  },
  mocha: {
    timeout: 60000,
  },
  typechain: {
    outDir: 'types/generated',
    target: 'ethers-v5',
  },
  etherscan: {
    apiKey: etherscanApiKey,
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: false,
  },
}

export default config
