import { NETWORKS } from '@prepo-io/constants'
import { StoreConfig } from '@prepo-io/stores'
import { PROJECT_NAME } from '../../lib/constants'
import { supportedContracts, SupportedContracts } from '../../lib/supported-contracts'

export const storeConfig: StoreConfig<SupportedContracts> = {
  appName: `prepo.${PROJECT_NAME}`,
  defaultNetwork: NETWORKS[process.env.NEXT_PUBLIC_NETWORK || 'goerli'],
  supportedNetworks: [NETWORKS[process.env.NEXT_PUBLIC_NETWORK || 'goerli']],
  supportedContracts,
}
