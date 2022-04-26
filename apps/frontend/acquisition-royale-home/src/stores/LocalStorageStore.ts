import { observe, makeAutoObservable } from 'mobx'
import { RootStore } from './RootStore'
import { SupportedThemes } from '../utils/theme/theme.types'

const PROJECT_NAME = 'boilerplate'

type Storage = {
  selectedTheme?: SupportedThemes
}

class LocalStorageStore {
  root: RootStore
  localStorageKey = `prepo.${PROJECT_NAME}`
  store: typeof window.localStorage | undefined
  storage: Storage = {}

  constructor(root: RootStore) {
    this.root = root
    makeAutoObservable(this)
  }

  load(): void {
    this.store = window.localStorage
    this._loadLocalStorage()
  }

  _loadLocalStorage = (): void => {
    observe(this.storage, () => this.setLocalStorage(this.storage))
  }

  getFromKey(keyName: keyof Storage): SupportedThemes | string | undefined {
    const localStorage = this._getLocalStorage()
    if (localStorage) {
      return localStorage[keyName]
    }
    return undefined
  }

  _getLocalStorage(): Storage | undefined {
    const value = this.store?.getItem(this.localStorageKey)
    if (value) {
      return JSON.parse(value)
    }
    return undefined
  }

  setLocalStorage<T>(data: T): void {
    this.store?.setItem(this.localStorageKey, JSON.stringify(data))
  }

  _removeLocalStorage(): void {
    this.store?.remove(this.localStorageKey)
  }
}

export default LocalStorageStore
