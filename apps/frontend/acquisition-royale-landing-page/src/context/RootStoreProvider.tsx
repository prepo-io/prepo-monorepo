import { createContext, useContext } from 'react'
import { RootStore } from '../stores/RootStore'

let store: RootStore
function initializeStore(): RootStore {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const _store = store ?? new RootStore()

  // For SSG and SSR always create a new store
  if (typeof window === 'undefined') return _store
  // Create the store once in the client
  if (!store) store = _store

  return _store
}

const StoreContext = createContext<RootStore | undefined>(undefined)

export const RootStoreProvider: React.FC = ({ children }) => (
  <StoreContext.Provider value={initializeStore()}>{children}</StoreContext.Provider>
)

export const useRootStore = (): RootStore => {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error('useRootStore must be used within RootStoreProvider')
  }

  return context
}
