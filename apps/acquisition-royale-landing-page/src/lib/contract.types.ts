import { SupportedNetworks } from './constants'
import { SupportedContracts, SupportedTokensContracts } from './external-contracts'
import { PartnertshipTokensContracts } from '../features/partnership-purchase/partnertship-contracts'

export type ExternalContract = {
  [key in SupportedNetworks]?: string
}

export type SupportedExternalContractsNames =
  | SupportedTokensContracts
  | SupportedContracts
  | PartnertshipTokensContracts

export type SupportedExternalContracts = {
  [key in SupportedExternalContractsNames]?: ExternalContract
}
