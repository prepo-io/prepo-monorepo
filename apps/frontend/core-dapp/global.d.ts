/* eslint-disable vars-on-top */
/* eslint-disable no-var */
import { RootStore } from './src/stores/RootStore'

export declare global {
  var rootStore: RootStore
  var ethereum: {
    request: (data: { method: string; params: unknown }) => Promise<null>
  }
}
