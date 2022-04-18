// eslint-disable-next-line import/no-unresolved
import { Initialization } from 'bnc-onboard/dist/src/interfaces'
import { ethers } from 'ethers'
import {
  getNetworkByChainId,
  APP_NAME,
  INFURA_ID,
  Network,
  FALLBACK_PROVIDER_CONFIG,
} from '../../lib/constants'

export const getOnboardConfig = (chainId: number): Initialization => {
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
          appName: APP_NAME,
        },
        { walletName: 'opera' },
        { walletName: 'operaTouch' },
        { walletName: 'status' },
        { walletName: 'walletLink', rpcUrl, appName: APP_NAME },
        { walletName: 'imToken', rpcUrl },
        { walletName: 'meetone' },
        { walletName: 'mykey', rpcUrl },
        { walletName: 'huobiwallet', rpcUrl },
        // TODO Test these wallet integrations manually to make sure they fit into the flow
        // {
        //   walletName: 'keystone',
        //   rpcUrl,
        //   appName: APP_NAME,
        // },
        // {
        //   walletName: "fortmatic",
        //   apiKey: FORTMATIC_KEY,
        //   preferred: true
        // },
        // {
        //   walletName: "portis",
        //   apiKey: PORTIS_KEY,
        //   preferred: true,
        //   label: 'Login with Email'
        // },
        // {
        //   walletName: 'cobovault',
        //   rpcUrl,
        //   appName: APP_NAME,
        // },
        // { walletName: 'torus' },
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

const { STALL_TIMEOUT, QUORUM } = FALLBACK_PROVIDER_CONFIG
export function createFallbackProvider(network: Network): ethers.providers.FallbackProvider {
  const { rpcUrls } = network
  const fallbackProviderConfigs = rpcUrls
    .map((rpcUrl) => new ethers.providers.StaticJsonRpcProvider(rpcUrl, network.chainId))
    .map((provider, i) => ({ provider, priority: i, stallTimeout: STALL_TIMEOUT, weight: 1 }))
  return new ethers.providers.FallbackProvider(fallbackProviderConfigs, QUORUM)
}
