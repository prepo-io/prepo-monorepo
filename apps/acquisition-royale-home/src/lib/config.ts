import { SupportedNetworks } from './constants'

const config = {
  CONFIG_CAT_SDK_KEY: 'xYjZCIkJi0eABaTu6QgigA/c-u2N7zb0EGnXQhvsjdsnQ',
  ENVIRONMENT: process.env.ENVIRONMENT ?? 'dev',
  NEXT_PUBLIC_NETWORK:
    (process.env.NEXT_PUBLIC_NETWORK as unknown as SupportedNetworks) ?? 'goerli',
  ROUNDED_DECIMALS: 4,
  SITE_URL: process.env.SITE_URL ?? 'https://www.example.com/',
  // social
  LANDING_SITE: 'https://acquisitionroyale.com',
  DISCORD_SITE: 'https://url.prepo.io/discord-ar-landing',
  MEDIUM_SITE: 'https://medium.com/prepo',
  TWITTER_SITE: 'https://twitter.com/AcqRoyale',
}

const appConfig = {
  isProduction: config.ENVIRONMENT === 'production',
}

export default { ...config, ...appConfig }
