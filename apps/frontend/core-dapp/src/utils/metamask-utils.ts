import { ChainId } from '@prepo-io/constants'

type MetamaskNetwork = {
  chainName: string
  rpcUrls: string[]
  blockExplorerUrls: string[]
  chainId: ChainId
}

const DEFAULT_NETWORKS = [1, 3, 4, 5, 42]

export const addNetworkToMetamask = async ({
  chainName,
  chainId: decChainId,
  blockExplorerUrls,
  rpcUrls,
}: MetamaskNetwork): Promise<boolean> => {
  if (!window.ethereum || DEFAULT_NETWORKS.includes(decChainId)) {
    return true
  }
  const chainId = `0x${decChainId.toString(16)}`
  await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainName,
        rpcUrls,
        chainId,
        blockExplorerUrls,
      },
    ],
  })
  return true
}
