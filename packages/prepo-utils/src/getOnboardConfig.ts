/* eslint-disable import/no-unresolved */
import { ChainId, INFURA_ID } from 'prepo-constants'
import { Initialization } from 'bnc-onboard/dist/src/interfaces'
import { getNetworkByChainId } from './getNetworkByChainId'

export const getOnboardConfig = (chainId: ChainId, appName: string): Initialization => {
  const rpcUrl = getNetworkByChainId(chainId)?.rpcUrls[0]
  return {
    networkId: chainId, // Desired chain
    walletSelect: {
      wallets: [
        // Desktop preferred wallets
        { walletName: 'metamask', preferred: true },
        {
          walletName: 'ledger',
          rpcUrl: getNetworkByChainId(chainId)?.rpcUrls[0],
          preferred: true,
        },
        {
          walletName: 'trezor',
          appUrl: 'https://prepo.io/',
          email: 'hello@prepo.io',
          rpcUrl,
          preferred: true,
        },
        {
          walletName: 'walletConnect',
          infuraKey: INFURA_ID,
          preferred: true,
        },
        // Mobile preferred wallets
        { walletName: 'coinbase', preferred: true },
        { walletName: 'trust', rpcUrl, preferred: true },
        // Other wallets
        {
          walletName: 'keepkey',
          rpcUrl,
        },
        { walletName: 'gnosis' },
        { walletName: 'liquality' },
        { walletName: 'authereum' },
        {
          walletName: 'lattice',
          rpcUrl,
          appName,
        },
        { walletName: 'opera' },
        { walletName: 'operaTouch' },
        { walletName: 'status' },
        { walletName: 'walletLink', rpcUrl, appName },
        { walletName: 'imToken', rpcUrl },
        { walletName: 'meetone' },
        { walletName: 'mykey', rpcUrl },
        { walletName: 'huobiwallet', rpcUrl },
      ],
    },
    walletCheck: [
      { checkName: 'derivationPath' },
      { checkName: 'accounts' },
      { checkName: 'connect' },
      { checkName: 'network' },
    ],
  }
}
