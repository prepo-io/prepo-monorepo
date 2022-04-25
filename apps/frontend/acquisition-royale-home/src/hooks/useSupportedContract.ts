import { getContractAddress, SupportedContractName } from '../lib/supported-contracts'
import { SupportedNetworks } from '../lib/constants'
import { useRootStore } from '../context/RootStoreProvider'

const useSupportedContract = (contractName: SupportedContractName): string | undefined => {
  const { web3Store } = useRootStore()
  const { network } = web3Store
  return getContractAddress(contractName, network?.name as SupportedNetworks)
}

export default useSupportedContract
