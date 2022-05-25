// TODO - Use the shared config
// import type { Config } from '@jest/types'
// import base from 'config/jest-frontend'
// import path from 'path'

// const fromRoot = (d): string => path.join(__dirname, d)

// const config: Config.InitialOptions = {
//   ...base,
//   roots: [fromRoot('.')],
//   testPathIgnorePatterns: ['/node_modules/'],
//   name: 'core-dapp',
//   displayName: 'Core dApp',
//   setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
//   moduleNameMapper: {
//     d3: '<rootDir>../../../node_modules/d3/dist/d3.min.js', // Fixes issues with d3 - https://github.com/kulshekhar/ts-jest/issues/2629
//   },
//   globals: {
//     'ts-jest': {
//       tsConfig: '<rootDir>/tsconfig.json',
//     },
//   },
// }

// export default config

import type { Config } from '@jest/types'

process.env.TZ = 'UTC'

const config: Config.InitialOptions = {
  testPathIgnorePatterns: ['/node_modules/'],
  preset: 'ts-jest',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    d3: '<rootDir>../../../node_modules/d3/dist/d3.min.js', // Fixes issues with d3 - https://github.com/kulshekhar/ts-jest/issues/2629
  },
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
  },
}

export default config
