import { NETWORKS } from 'prepo-constants'
import { StoreConfig } from '@prepo-io/stores'
import { PROJECT_NAME } from '../../lib/constants'
import { SupportedContracts } from '../../lib/contract.types'
import { supportedContracts } from '../../lib/supported-contracts'

export const storeConfig: StoreConfig<SupportedContracts> = {
  appName: `prepo.${PROJECT_NAME}`,
  defaultNetwork: NETWORKS.goerli,
  supportedNetworks: [NETWORKS.goerli],
  supportedContracts,
}
