import { ExternalContract, SupportedExternalContracts } from '../../lib/contract.types'

export type PartnertshipTokensContracts = 'MCHC' | 'XEENUS'

export const MCH_TOKEN_ADDRESS: ExternalContract = {
  goerli: '0xaff4481d10270f50f203e0763e2597776068cbc5', // Weenus
  mainnet: '0xd69f306549e9d96f183b1aeca30b8f4353c2ecc3',
}

export const XEENUS_TOKEN_ADDRESS: ExternalContract = {
  goerli: '0x022e292b44b5a146f2e8ee36ff44d3dd863c915c',
}

export const partnershipContracts: SupportedExternalContracts = {
  MCHC: MCH_TOKEN_ADDRESS,
  XEENUS: XEENUS_TOKEN_ADDRESS,
}
