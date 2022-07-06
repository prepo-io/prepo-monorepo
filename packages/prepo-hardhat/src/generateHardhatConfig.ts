import { HardhatUserConfig } from 'hardhat/config'
import { HDAccountsUserConfig, NetworkUserConfig } from 'hardhat/types'
import { NETWORKS, SupportedNetworks } from 'prepo-constants'
import { HardhatLocalConfig } from './generateHardhatLocalConfig'

const generateHardhatConfig = (config: HardhatLocalConfig): HardhatUserConfig => {
  const accounts: HDAccountsUserConfig = {
    count: 20,
    initialIndex: 0,
    mnemonic: config.MNEMONIC,
  }

  function createTestnetConfig(network: SupportedNetworks): NetworkUserConfig {
    const url = `https://${NETWORKS[network].infuraEndpointName ?? network}.infura.io/v3/${
      config.INFURA_API_KEY
    }`
    return {
      accounts,
      chainId: NETWORKS[network].chainId,
      url,
    }
  }
  return {
    solidity: {
      compilers: [
        {
          version: '0.8.7',
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
    defaultNetwork: NETWORKS.hardhat.name,
    networks: {
      hardhat: {
        accounts,
        chainId: NETWORKS.hardhat.chainId,
        gas: 'auto',
      },
      goerli: createTestnetConfig(NETWORKS.goerli.name),
      kovan: createTestnetConfig(NETWORKS.kovan.name),
      rinkeby: createTestnetConfig(NETWORKS.rinkeby.name),
      ropsten: createTestnetConfig(NETWORKS.ropsten.name),
      matic: createTestnetConfig(NETWORKS.matic.name),
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
  }
}

export default generateHardhatConfig
