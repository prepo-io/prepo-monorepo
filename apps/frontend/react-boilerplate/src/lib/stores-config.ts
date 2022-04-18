import { NETWORKS } from '@prepo-io/constants'
import { StoreConfig } from '@prepo-io/stores'
import { PROJECT_NAME } from './constants'
import { SupportedContracts } from './contract.types'
import { supportedContracts } from './supported-contracts'

export const storeConfig: StoreConfig<SupportedContracts> = {
  appName: `prepo.${PROJECT_NAME}`,
  defaultNetwork: NETWORKS.goerli,
  supportedNetworks: [NETWORKS.goerli],
  supportedContracts,
}
