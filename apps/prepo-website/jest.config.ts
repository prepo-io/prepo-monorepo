import type { Config } from '@jest/types'
import base from 'config/jest-frontend'
import path from 'path'

const fromRoot = (d): string => path.join(__dirname, d)

const config: Config.InitialOptions = {
  ...base,
  roots: [fromRoot('.')],
  name: 'prepo-website',
  displayName: 'prePO Website Tests',
}

export default config
