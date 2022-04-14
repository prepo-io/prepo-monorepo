import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  testPathIgnorePatterns: ['/node_modules/'],
  preset: 'ts-jest',
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
