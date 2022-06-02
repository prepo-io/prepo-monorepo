import { SupportedNetworks } from 'prepo-constants'

export const getContractAddress = <SupportedContracts>(
  contract: keyof SupportedContracts,
  currentNetwork: SupportedNetworks,
  supportedContracts: SupportedContracts
): string | undefined => {
  const externalContract = supportedContracts[contract]
  return externalContract[currentNetwork]
}
