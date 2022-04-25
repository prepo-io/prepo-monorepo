/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-var-requires */
const { withSentryConfig } = require('@sentry/nextjs')

const root = process.cwd()
const path = require('path')

const nextConfig = {
  experimental: { esmExternals: 'loose' },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'styled-components': path.resolve(root, 'node_modules', 'styled-components'),

      // removes the problem described here without having to link manually on dev machine
      // https://reactjs.org/warnings/invalid-hook-call-warning.html#duplicate-react
      react: path.resolve(root, '../../../node_modules', 'react'),
    }

    // Important: return the modified config
    return config
  },
}

const sentryWebpackPluginOptions = {
  authToken: process.env.SENTRY_AUTH_TOKEN,
}

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions)
