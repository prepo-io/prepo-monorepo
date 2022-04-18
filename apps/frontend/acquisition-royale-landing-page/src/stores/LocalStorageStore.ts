import { observe, makeAutoObservable } from 'mobx'
import { RootStore } from './RootStore'

const PROJECT_NAME = 'acquisitionroyale'

export class LocalStorageStore {
  root: RootStore
  localStorageKey = `prepo.${PROJECT_NAME}`
  store: typeof window.localStorage | undefined
  storage = {}

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

  getFromKey(keyName: keyof Storage): string | undefined {
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
