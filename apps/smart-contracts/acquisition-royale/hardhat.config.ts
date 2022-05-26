import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import '@typechain/ethers-v5'
import { config as dotenvConfig } from 'dotenv'
import 'hardhat-contract-sizer'
import 'hardhat-deploy'
import 'hardhat-deploy-ethers'
import 'hardhat-gas-reporter'
import '@typechain/hardhat'
import '@openzeppelin/hardhat-upgrades'
import { HardhatUserConfig } from 'hardhat/config'
import { HDAccountsUserConfig, NetworkUserConfig } from 'hardhat/types'
import { resolve } from 'path'
// import './tasks/faucet'
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
  matic: 137,
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
let coinmarketcapApiKey: string
if (!process.env.COINMARKETCAP_API_KEY) {
  throw new Error('Please set your COINMARKETCAP_API_KEY in a .env file')
} else {
  coinmarketcapApiKey = process.env.COINMARKETCAP_API_KEY
}

export const accounts: HDAccountsUserConfig = {
  count: 10,
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
    version: '0.8.6',
    settings: {
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      accounts,
      chainId: chainIds.hardhat,
      gas: 'auto',
      initialBaseFeePerGas: 0,
      gasPrice: 0,
      allowUnlimitedContractSize: true,
    },
    goerli: createTestnetConfig('goerli'),
    kovan: createTestnetConfig('kovan'),
    rinkeby: createTestnetConfig('rinkeby'),
    ropsten: createTestnetConfig('ropsten'),
    matic: {
      chainId: chainIds.matic,
      url: 'https://polygon-rpc.com/',
      accounts: {
        mnemonic,
        initialIndex: 0,
        count: 1,
      },
    },
  },
  paths: {
    artifacts: './artifacts',
    cache: './cache',
    deployments: './deployments',
    sources: './contracts',
    tests: './test',
  },
  mocha: {
    timeout: 60000,
  },
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
    apiKey: etherscanApiKey,
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
  },
  gasReporter: {
    currency: 'USD',
    coinmarketcap: coinmarketcapApiKey,
  },
}

export default config
