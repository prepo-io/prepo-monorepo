import { DYNAMIC_CONTRACT_ADDRESS } from '@prepo-io/stores'
import { ContractAddresses } from './supported-contracts'

export type SupportedMinigameContractName = 'TELEMARKETING_HOOK' | 'TELEMARKETING_PRORATA'

const TELEMARKETING_HOOK: ContractAddresses = {
  goerli: DYNAMIC_CONTRACT_ADDRESS,
}

const TELEMARKETING_PRORATA: ContractAddresses = {
  goerli: DYNAMIC_CONTRACT_ADDRESS,
}

export type SupportedMinigameContracts = {
  [key in SupportedMinigameContractName]: ContractAddresses
}

export const supportedMinigameContracts: SupportedMinigameContracts = {
  TELEMARKETING_HOOK,
  TELEMARKETING_PRORATA,
}
