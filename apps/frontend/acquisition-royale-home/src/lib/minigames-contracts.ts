import { DYNAMIC_CONTRACT_ADDRESS } from '@prepo-io/stores'
import { ContractAddresses } from './supported-contracts'

export type SupportedMinigameContractName = 'TELEMARKETING_HOOK' | 'TELEMARKETING_PRORATA'

const TELEMARKETING_HOOK: ContractAddresses = {
  goerli: DYNAMIC_CONTRACT_ADDRESS,
}

const TELEMARKETING_PRORATA: ContractAddresses = {
  goerli: '0xBeA0bdc7A83481f49655a3D57c71b8F5ac6856b6',
}

export type SupportedMinigameContracts = {
  [key in SupportedMinigameContractName]: ContractAddresses
}

export const supportedMinigameContracts: SupportedMinigameContracts = {
  TELEMARKETING_HOOK,
  TELEMARKETING_PRORATA,
}
