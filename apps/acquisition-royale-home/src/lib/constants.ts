import { BigNumber, utils } from 'ethers'
import config from './config'

export const IS_BROWSER = Boolean(process.browser)

export const PRODUCTION_DOMAIN_EN = ''
export const PROJECT_NAME = 'Acquisition Royale'

export const DEFAULT_LANGUAGE = 'en-us'

export const EMPTY_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'

export const ETH_STRING = 'ETH'

export const TOTAL_POSSIBLE_ENTERPRISES = 15000

export const UNISWAP_V2_CONTRACT_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
export const UNISWAP_V2_DAI_ETH_ADDRESS = '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11'

// used to calculate actual percentage, SC will return value like 2500000000, this is the value used in SC to get actual percentage
export const PERCENT_DENOMINATOR = 10000000000

export const SEC_IN_MS = 1000
export const MIN_IN_MS = SEC_IN_MS * 60
export const DAY_IN_SEC = 86400

export const MINIMUM_GAS_FEE = 21000

export const APP_NAME = 'prePO'

// MY INFURA_ID, SWAP THIS FROM https://infura.io/dashboard/ethereum
export const INFURA_ID = '460f40a260564ac4a4f4b3fffb032dad'

export type SupportedNetworks =
  | 'localhost'
  | 'mainnet'
  | 'kovan'
  | 'rinkeby'
  | 'ropsten'
  | 'goerli'
  | 'xdai'
  | 'matic'
  | 'mumbai'
  | 'smartchain'
  | 'smartchaintest'

export type Network = {
  name: SupportedNetworks
  color: string
  chainId: number
  blockExplorer: string
  rpcUrls: string[]
  faucet?: string
  gasPrice?: BigNumber
}

type Networks = {
  [key in SupportedNetworks]: Network
}

export const NETWORKS: Networks = {
  localhost: {
    name: 'localhost',
    color: '#666666',
    chainId: 31337,
    blockExplorer: '',
    rpcUrls: [`http://localhost:8545`],
  },
  mainnet: {
    name: 'mainnet',
    color: '#ff8b9e',
    chainId: 1,
    rpcUrls: [`https://mainnet.infura.io/v3/${INFURA_ID}`],
    blockExplorer: 'https://etherscan.io',
  },
  kovan: {
    name: 'kovan',
    color: '#7003DD',
    chainId: 42,
    rpcUrls: [`https://kovan.infura.io/v3/${INFURA_ID}`],
    blockExplorer: 'https://kovan.etherscan.io',
    faucet: 'https://gitter.im/kovan-testnet/faucet', // https://faucet.kovan.network/
  },
  rinkeby: {
    name: 'rinkeby',
    color: '#e0d068',
    chainId: 4,
    rpcUrls: [`https://rinkeby.infura.io/v3/${INFURA_ID}`],
    faucet: 'https://faucet.rinkeby.io',
    blockExplorer: 'https://rinkeby.etherscan.io',
  },
  ropsten: {
    name: 'ropsten',
    color: '#F60D09',
    chainId: 3,
    faucet: 'https://faucet.ropsten.be',
    blockExplorer: 'https://ropsten.etherscan.io',
    rpcUrls: [`https://ropsten.infura.io/v3/${INFURA_ID}`],
  },
  goerli: {
    name: 'goerli',
    color: '#0975F6',
    chainId: 5,
    faucet: 'https://goerli-faucet.slock.it',
    blockExplorer: 'https://goerli.etherscan.io',
    rpcUrls: [`https://goerli.infura.io/v3/${INFURA_ID}`],
    gasPrice: utils.parseUnits('60', 'gwei'),
  },
  xdai: {
    name: 'xdai',
    color: '#48a9a6',
    chainId: 100,
    rpcUrls: ['https://dai.poa.network'],
    faucet: 'https://xdai-faucet.top',
    blockExplorer: 'https://blockscout.com/poa/xdai',
  },
  matic: {
    name: 'matic',
    color: '#2bbdf7',
    chainId: 137,
    rpcUrls: ['https://polygon-rpc.com'],
    faucet: 'https://faucet.matic.network',
    blockExplorer: 'https://polygonscan.com',
    gasPrice: utils.parseUnits('60', 'gwei'),
  },
  mumbai: {
    name: 'mumbai',
    color: '#92D9FA',
    chainId: 80001,
    rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
    faucet: 'https://faucet.matic.network',
    blockExplorer: 'https://mumbai-explorer.matic.today',
  },
  smartchain: {
    name: 'smartchain',
    color: '#F0B90B',
    chainId: 56,
    rpcUrls: ['https://bsc-dataseed.binance.org'],
    blockExplorer: 'https://bscscan.com',
  },
  smartchaintest: {
    name: 'smartchaintest',
    color: '#F0B90B',
    chainId: 97,
    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
    faucet: 'https://testnet.binance.org/faucet-smart',
    blockExplorer: 'https://testnet.bscscan.com',
  },
}

export const DEFAULT_NETWORK = NETWORKS[config.NEXT_PUBLIC_NETWORK]

// We use FallbackProvider to have some redundancy
// Use QUORUM of 1 beacuse we trust the endpoints and prioritise speed
// STALL_TIMEOUT is how many ms until FallbackProvider will wait until trying the next provider
export const FALLBACK_PROVIDER_CONFIG = {
  STALL_TIMEOUT: 1000,
  QUORUM: 1,
}

export const getNetworkByChainId = (chainId: number | undefined): Network | undefined => {
  // eslint-disable-next-line no-restricted-syntax
  for (const key in NETWORKS) {
    if ({}.hasOwnProperty.call(NETWORKS, key)) {
      const network = key as SupportedNetworks
      if (NETWORKS[network].chainId === chainId) {
        return NETWORKS[network]
      }
    }
  }

  return undefined
}

export const PANELBEAR_SITE_ID = '3Zp0VD82CuC'
