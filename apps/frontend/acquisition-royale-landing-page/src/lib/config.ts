import { SupportedNetworks } from './constants'

const config = {
  ENVIRONMENT: process.env.ENVIRONMENT ?? 'dev',
  NETWORK: (process.env.NEXT_PUBLIC_NETWORK as unknown as SupportedNetworks) ?? 'goerli',
  ROUNDED_DECIMALS: 4,
  CONFIG_CAT_SDK_KEY: 'xYjZCIkJi0eABaTu6QgigA/c-u2N7zb0EGnXQhvsjdsnQ',
  CANONICAL_URL: 'https://www.acquisitionroyale.com/',
}

const appConfig = {
  isProduction: config.ENVIRONMENT === 'production',
}

export default { ...config, ...appConfig }
