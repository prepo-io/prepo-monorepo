import { getOnboardConfig } from 'prepo-utils'
import { StoreConfig } from './stores.types'

export const normalizeStoreConfig = <SupportedContracts>(
  storeConfig: StoreConfig<SupportedContracts>
): Required<StoreConfig<SupportedContracts>> => {
  const normalizedValue = storeConfig

  if (storeConfig?.onboardConfig === undefined) {
    normalizedValue.onboardConfig = getOnboardConfig(
      storeConfig.defaultNetwork.chainId,
      storeConfig.appName
    )
  }

  return normalizedValue as Required<StoreConfig<SupportedContracts>>
}
