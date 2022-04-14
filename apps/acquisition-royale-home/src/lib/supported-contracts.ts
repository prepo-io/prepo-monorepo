import { SupportedNetworks } from './constants'

type ContractAddresses = {
  [key in SupportedNetworks]?: string
}

export type SupportedContractName =
  | 'USDC'
  | 'UNISWAP_V2_ROUTER'
  | 'ACQUIRE_COST'
  | 'ACQUISITION_ROYALE'
  | 'ACQUISITION_ROYALE_RP'
  | 'COMPETE_V1'
  | 'CONSUMABLES'
  | 'INTERN'
  | 'MERGE_COST'
  | 'RUNWAY_POINTS'
  | 'BRANDING'

export type SupportedErc20Token = 'USDC'

export type SupportedContracts = {
  [key in SupportedContractName]: ContractAddresses
}

export const UNISWAP_V2_ROUTER_ADDRESSES: ContractAddresses = {
  mainnet: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  goerli: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  matic: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
}

export const USDC_ADDRESSES: ContractAddresses = {
  mainnet: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  ropsten: '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
  goerli: '0xaFF4481D10270F50f203E0763e2597776068CBc5',
  matic: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
}

export const ACQUIRE_COST_ADDRESSES: ContractAddresses = {
  goerli: '0xA56A8d3Ddfe626980502cE2739ad89E216026195',
  matic: '0x33E56d5eD626685167619b77e9560c3732dEdb6D',
}

export const ACQUISITION_ROYALE_ADDRESSES: ContractAddresses = {
  goerli: '0xBbDa1d8564f47aC461bfbBF0C5Ff08fc5D276cc7',
  matic: '0xa46afF3aB117b51f33dB178593552d0ca0B1365e',
}

export const ACQUISITION_ROYALE_RP_ADDRESSES: ContractAddresses = {
  goerli: '0xEce72d738a5B32044c302164a697A40ed8E00953',
  matic: '0x140aE84b315fA7639bfAAAa58E05329053195606',
}

export const COMPETE_V1_ADDRESSES: ContractAddresses = {
  goerli: '0x29fad0Fa26E12E4Ed081261B5D8cdE2D0C7C14c4',
  matic: '0x415c552Ee3Dc36Ad1C4c9bB47C4F60e35f002ea5',
}

export const CONSUMABLES_ADDRESS: ContractAddresses = {
  goerli: '0x7ec31205e3c6502a13b38e48577bd61390b85b7f',
  matic: '0x1e51b9D22d5bdB84CC39A020955C01ec39A29b57',
}

export const INTERN_ADDRESSES: ContractAddresses = {
  goerli: '0xd3538C921615e3Aa2dED94A1996e0EFab6959CC3',
  matic: '0xCb4E5887A2e92F2Df17e4FD2AbD71ce39224FB97',
}

export const MERGE_COST_ADDRESSES: ContractAddresses = {
  goerli: '0xf02cbB182A0442f262e468fA055149b1b40998F2',
  matic: '0xFddB1b141ebdCC394a35335A44a7C0D76B2CC781',
}

export const RUNWAY_POINTS_ADDRESSES: ContractAddresses = {
  goerli: '0xeE0519A769AD2D6C048FbD2b4a398192E4Fa79a9',
  matic: '0x93dA8f92e89Dde30C27CD2Ef965bD9e91BcFb174',
}

export const BRANDING_ADDRESSES: ContractAddresses = {
  goerli: '0xa05f7aBe30A406c3962E91a08aA691f3fD0B1d42',
  matic: '0x6AF9174a08B21263a631A9Df22574eb423FFe9E1',
}

export const supportedContracts: SupportedContracts = {
  USDC: USDC_ADDRESSES,
  UNISWAP_V2_ROUTER: UNISWAP_V2_ROUTER_ADDRESSES,
  ACQUIRE_COST: ACQUIRE_COST_ADDRESSES,
  ACQUISITION_ROYALE: ACQUISITION_ROYALE_ADDRESSES,
  ACQUISITION_ROYALE_RP: ACQUISITION_ROYALE_RP_ADDRESSES,
  COMPETE_V1: COMPETE_V1_ADDRESSES,
  CONSUMABLES: CONSUMABLES_ADDRESS,
  INTERN: INTERN_ADDRESSES,
  MERGE_COST: MERGE_COST_ADDRESSES,
  RUNWAY_POINTS: RUNWAY_POINTS_ADDRESSES,
  BRANDING: BRANDING_ADDRESSES,
}

export const getContractAddress = (
  contract: SupportedContractName,
  currentNetwork: SupportedNetworks
): string | undefined => {
  const supportedContract = supportedContracts[contract]
  return supportedContract[currentNetwork]
}
