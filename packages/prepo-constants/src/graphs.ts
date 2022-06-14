import { SupportedNetworks } from './networks'

export type SupportedGraphs = 'uniswapV3'

export type GraphEndpoint = {
  [key in SupportedNetworks]?: string
}

export type GraphEndpoints = {
  [key in SupportedGraphs]: GraphEndpoint
}

export const GRAPH_ENDPOINTS: GraphEndpoints = {
  uniswapV3: {
    mainnet: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
    goerli: 'https://api.thegraph.com/subgraphs/name/liqwiz/uniswap-v3-goerli',
  },
}
