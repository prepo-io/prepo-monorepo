import { getExternalContractAddress } from '../lib/external-contracts'
import { SupportedNetworks } from '../lib/constants'
import { useRootStore } from '../context/RootStoreProvider'
import { SupportedExternalContractsNames } from '../lib/contract.types'

const useExternalContract = (contractName: SupportedExternalContractsNames): string | undefined => {
  const { web3Store } = useRootStore()
  const { network } = web3Store
  return getExternalContractAddress(contractName, network?.name as SupportedNetworks)
}

export default useExternalContract
