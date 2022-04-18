import { SupportedNetworks } from './constants'
import {
  ExternalContract,
  SupportedExternalContracts,
  SupportedExternalContractsNames,
} from './contract.types'
import { partnershipContracts } from '../features/partnership-purchase/partnertship-contracts'

export type SupportedTokensContracts = 'DAI' | 'USDC' | 'WETH'
export type SupportedContracts =
  | 'MULTICALL2'
  | 'ACQUISITION_ROYALE'
  | 'ACQUISITION_ROYALE_PARTNERSHIP'

export const MULTICALL2_ADDRESS: ExternalContract = {
  mainnet: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  kovan: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  goerli: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  rinkeby: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  ropsten: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  smartchain: '0xC50F4c1E81c873B2204D7eFf7069Ffec6Fbe136D',
  smartchaintest: '0x6e5BB1a5Ad6F68A8D7D6A5e47750eC15773d6042',
  xdai: '0x2325b72990D81892E0e09cdE5C80DD221F147F8B',
  mumbai: '0xe9939e7Ea7D7fb619Ac57f648Da7B1D425832631',
  matic: '0x275617327c958bD06b5D6b871E7f491D76113dd8',
  localhost: '0x6Ad94D679d138B78070967F5713B84f905D6244D',
}

export const ACQUISITION_ROYALE_ADDRESS: ExternalContract = {
  localhost: '0x3e22Daa9EBE732248707651A3193Dd6895477A11',
  goerli: '0xBbDa1d8564f47aC461bfbBF0C5Ff08fc5D276cc7',
  matic: '0xa46afF3aB117b51f33dB178593552d0ca0B1365e',
}

export const ACQUISITION_ROYALE_PARTNERSHIP_ADDRESS: ExternalContract = {
  goerli: '0x106Fb3d1Df59364C7147bD15E97B847970426e6e',
  mainnet: '0xa46afF3aB117b51f33dB178593552d0ca0B1365e',
}

export const WETH_ADDRESS: ExternalContract = {
  goerli: '0xaff4481d10270f50f203e0763e2597776068cbc5', // Weenus
  mainnet: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  matic: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
}

export const DAI_ADDRESS: ExternalContract = {
  mainnet: '0x6b175474e89094c44da98b954eedeac495271d0f',
  ropsten: '0xad6d458402f60fd3bd25163575031acdce07538d',
}

export const USDC_ADDRESS: ExternalContract = {
  mainnet: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  ropsten: '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
}

const supportedExternalContracts: SupportedExternalContracts = {
  DAI: DAI_ADDRESS,
  USDC: USDC_ADDRESS,
  ACQUISITION_ROYALE: ACQUISITION_ROYALE_ADDRESS,
  MULTICALL2: MULTICALL2_ADDRESS,
  WETH: WETH_ADDRESS,
  ACQUISITION_ROYALE_PARTNERSHIP: ACQUISITION_ROYALE_PARTNERSHIP_ADDRESS,
}

export const externalContracts: SupportedExternalContracts = {
  ...supportedExternalContracts,
  ...partnershipContracts,
}

export const getExternalContractAddress = (
  contract: SupportedExternalContractsNames,
  currentNetwork: SupportedNetworks
): string | undefined => {
  const externalContract = externalContracts[contract]
  if (externalContract) {
    return externalContract[currentNetwork]
  }
  return undefined
}
