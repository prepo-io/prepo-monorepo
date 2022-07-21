import { BigNumber, utils } from 'ethers'
import { GasPriceSource, maticGas } from './gas'

export enum ChainId {
  mainnet = 1,
  ropsten = 3,
  rinkeby = 4,
  goerli = 5,
  kovan = 42,
  smartchain = 56,
  smartchainTest = 97,
  xdai = 100,
  polygon = 137,
  polygonMumbai = 80001,
  ganache = 1337,
  hardhat = 31337,
  arbitrumOne = 42161,
  arbitrumTestnet = 421611,
}

export type NetworkType = 'ethereum' | 'arbitrum' | 'polygon' | 'dai' | 'bsc'

export type SupportedNetworks =
  | 'ganache'
  | 'hardhat'
  | 'mainnet'
  | 'kovan'
  | 'rinkeby'
  | 'ropsten'
  | 'goerli'
  | 'xdai'
  | 'polygon'
  | 'polygonMumbai'
  | 'smartchain'
  | 'smartchainTest'
  | 'arbitrumOne'
  | 'arbitrumTestnet'

export type Network = {
  name: SupportedNetworks
  color: string
  chainId: ChainId
  blockExplorer: string
  infuraEndpointName?: string
  rpcUrls: string[]
  faucet?: string
  gasPrice?: BigNumber
  gasPriceCheckers?: GasPriceSource[]
  type?: NetworkType
  testNetwork?: boolean
  chainName: string
}

export type Networks = {
  [key in SupportedNetworks]: Network
}

// MY INFURA_ID, SWAP THIS FROM https://infura.io/dashboard/ethereum
export const INFURA_ID = '460f40a260564ac4a4f4b3fffb032dad'
// This is the Infure ID from Metamask
export const METAMASK_INFURA_ID = '9aa3d95b3bc440fa88ea12eaa4456161'

export const NETWORKS: Networks = {
  ganache: {
    chainName: 'Ganache Local Node',
    name: 'ganache',
    color: '#666666',
    chainId: ChainId.ganache,
    blockExplorer: '',
    rpcUrls: [`http://localhost:8545`],
    testNetwork: true,
  },
  hardhat: {
    chainName: 'Hardhat Local Node',
    name: 'hardhat',
    color: '#666666',
    chainId: ChainId.hardhat,
    blockExplorer: '',
    rpcUrls: [`http://localhost:8545`],
    testNetwork: true,
  },
  mainnet: {
    chainName: 'Mainnet',
    name: 'mainnet',
    color: '#ff8b9e',
    chainId: ChainId.mainnet,
    rpcUrls: [`https://mainnet.infura.io/v3/${INFURA_ID}`],
    blockExplorer: 'https://etherscan.io',
    type: 'ethereum',
    testNetwork: false,
  },
  kovan: {
    chainName: 'Kovan',
    name: 'kovan',
    color: '#7003DD',
    chainId: ChainId.kovan,
    rpcUrls: [`https://kovan.infura.io/v3/${INFURA_ID}`],
    blockExplorer: 'https://kovan.etherscan.io',
    faucet: 'https://gitter.im/kovan-testnet/faucet', // https://faucet.kovan.network/
    type: 'ethereum',
    testNetwork: true,
  },
  rinkeby: {
    chainName: 'Rinkeby',
    name: 'rinkeby',
    color: '#e0d068',
    chainId: ChainId.rinkeby,
    rpcUrls: [`https://rinkeby.infura.io/v3/${INFURA_ID}`],
    faucet: 'https://faucet.rinkeby.io',
    blockExplorer: 'https://rinkeby.etherscan.io',
    type: 'ethereum',
    testNetwork: true,
  },
  ropsten: {
    chainName: 'Ropsten',
    name: 'ropsten',
    color: '#F60D09',
    chainId: ChainId.ropsten,
    faucet: 'https://faucet.ropsten.be',
    blockExplorer: 'https://ropsten.etherscan.io',
    rpcUrls: [`https://ropsten.infura.io/v3/${INFURA_ID}`],
    type: 'ethereum',
    testNetwork: true,
  },
  goerli: {
    chainName: 'Goerli',
    name: 'goerli',
    color: '#0975F6',
    chainId: ChainId.goerli,
    faucet: 'https://goerli-faucet.slock.it',
    blockExplorer: 'https://goerli.etherscan.io',
    rpcUrls: [`https://goerli.infura.io/v3/${METAMASK_INFURA_ID}`],
    gasPrice: utils.parseUnits('4', 'gwei'),
    type: 'ethereum',
    testNetwork: true,
  },
  xdai: {
    chainName: 'Gnosis Chain',
    name: 'xdai',
    color: '#48a9a6',
    chainId: ChainId.xdai,
    rpcUrls: ['https://dai.poa.network'],
    faucet: 'https://xdai-faucet.top',
    blockExplorer: 'https://blockscout.com/poa/xdai',
    type: 'dai',
    testNetwork: false,
  },
  polygon: {
    chainName: 'Polygon',
    name: 'polygon',
    color: '#2bbdf7',
    chainId: ChainId.polygon,
    infuraEndpointName: 'polygon-mainnet',
    rpcUrls: ['https://polygon-rpc.com', 'https://matic-mainnet.chainstacklabs.com'],
    faucet: 'https://faucet.matic.network',
    blockExplorer: 'https://polygonscan.com',
    gasPrice: utils.parseUnits('60', 'gwei'),
    gasPriceCheckers: maticGas,
    type: 'polygon',
    testNetwork: false,
  },
  polygonMumbai: {
    chainName: 'Polygon Testnet',
    name: 'polygonMumbai',
    color: '#92D9FA',
    chainId: ChainId.polygonMumbai,
    rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
    faucet: 'https://faucet.matic.network',
    blockExplorer: 'https://mumbai-explorer.matic.today',
    type: 'polygon',
    testNetwork: true,
  },
  smartchain: {
    chainName: 'SmartChain',
    name: 'smartchain',
    color: '#F0B90B',
    chainId: ChainId.smartchain,
    rpcUrls: ['https://bsc-dataseed.binance.org'],
    blockExplorer: 'https://bscscan.com',
    type: 'bsc',
    testNetwork: false,
  },
  smartchainTest: {
    chainName: 'SmartChain Testnet',
    name: 'smartchainTest',
    color: '#F0B90B',
    chainId: ChainId.smartchainTest,
    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
    faucet: 'https://testnet.binance.org/faucet-smart',
    blockExplorer: 'https://testnet.bscscan.com',
    type: 'bsc',
    testNetwork: true,
  },
  arbitrumOne: {
    chainName: 'Arbitrum One',
    name: 'arbitrumOne',
    color: '#2BA0EF',
    chainId: ChainId.arbitrumOne,
    infuraEndpointName: 'arbitrum-mainnet',
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorer: 'https://arbiscan.io/',
    type: 'arbitrum',
    testNetwork: false,
  },
  arbitrumTestnet: {
    chainName: 'Arbitrum Testnet',
    name: 'arbitrumTestnet',
    color: '#2BA0EF',
    chainId: ChainId.arbitrumTestnet,
    infuraEndpointName: 'arbitrum-rinkeby',
    rpcUrls: ['https://rinkeby.arbitrum.io/rpc'],
    blockExplorer: 'https://testnet.arbiscan.io/',
    type: 'arbitrum',
    testNetwork: true,
  },
}

export const DEFAULT_NETWORK = NETWORKS.goerli
