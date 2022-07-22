import { BigNumber, utils } from 'ethers'
import { GasPriceSource, maticGas } from './gas'

export enum ChainId {
  Mainnet = 1,
  Ropsten = 3,
  Rinkeby = 4,
  Goerli = 5,
  Kovan = 42,
  BSC = 56,
  BSCTestnet = 97,
  xDai = 100,
  Polygon = 137,
  Theta = 361,
  ThetaTestnet = 365,
  Moonriver = 1285,
  PolygonMumbai = 80001,
  Harmony = 1666600000,
  Palm = 11297108109,
  Ganache = 1337,
  Hardhat = 31337,
  Fantom = 250,
  ArbitrumOne = 42161,
  ArbitrumTestnet = 421611,
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
    chainId: ChainId.Ganache,
    blockExplorer: '',
    rpcUrls: [`http://localhost:8545`],
    testNetwork: true,
  },
  hardhat: {
    chainName: 'Hardhat Local Node',
    name: 'hardhat',
    color: '#666666',
    chainId: ChainId.Hardhat,
    blockExplorer: '',
    rpcUrls: [`http://localhost:8545`],
    testNetwork: true,
  },
  mainnet: {
    chainName: 'Mainnet',
    name: 'mainnet',
    color: '#ff8b9e',
    chainId: ChainId.Mainnet,
    rpcUrls: [`https://mainnet.infura.io/v3/${INFURA_ID}`],
    blockExplorer: 'https://etherscan.io',
    type: 'ethereum',
    testNetwork: false,
  },
  kovan: {
    chainName: 'Kovan',
    name: 'kovan',
    color: '#7003DD',
    chainId: ChainId.Kovan,
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
    chainId: ChainId.Rinkeby,
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
    chainId: ChainId.Ropsten,
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
    chainId: ChainId.Goerli,
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
    chainId: ChainId.xDai,
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
    chainId: ChainId.Polygon,
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
    chainId: ChainId.PolygonMumbai,
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
    chainId: ChainId.BSC,
    rpcUrls: ['https://bsc-dataseed.binance.org'],
    blockExplorer: 'https://bscscan.com',
    type: 'bsc',
    testNetwork: false,
  },
  smartchainTest: {
    chainName: 'SmartChain Testnet',
    name: 'smartchainTest',
    color: '#F0B90B',
    chainId: ChainId.BSCTestnet,
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
    chainId: ChainId.ArbitrumOne,
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
    chainId: ChainId.ArbitrumTestnet,
    infuraEndpointName: 'arbitrum-rinkeby',
    rpcUrls: ['https://rinkeby.arbitrum.io/rpc'],
    blockExplorer: 'https://testnet.arbiscan.io/',
    type: 'arbitrum',
    testNetwork: true,
  },
}

export const DEFAULT_NETWORK = NETWORKS.goerli
