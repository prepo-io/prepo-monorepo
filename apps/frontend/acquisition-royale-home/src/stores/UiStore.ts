import { message } from 'antd'
import { makeAutoObservable } from 'mobx'
import { RewardElement } from 'react-rewards'
import { DefaultTheme } from 'styled-components'
import { RootStore } from './RootStore'
import { lightTheme } from '../utils/theme/light-theme'
import { SupportedThemes } from '../utils/theme/theme.types'
import { darkTheme } from '../utils/theme/dark-theme'

export type RewardElements = {
  purchasedFromShop?: undefined | RewardElement
}
export class UiStore {
  root: RootStore
  accountModalOpen = false
  enterpriseCardWidth: number
  rewardElements: RewardElements
  selectedTheme: SupportedThemes
  message: typeof message
  showAnnouncementBanner = false

  constructor(root: RootStore) {
    this.root = root
    this.enterpriseCardWidth = 385 // 385 is the max width EnterpriseCard will ever get
    this.message = message
    this.rewardElements = {}
    this.selectedTheme = 'light'
    makeAutoObservable(this, {}, { autoBind: true })
  }

  setTheme(selectedTheme: SupportedThemes): void {
    this.selectedTheme = selectedTheme
    this.root.localStorageStore.setLocalStorage<{ [key: string]: SupportedThemes }>({
      selectedTheme,
    })
  }

  get themeObject(): DefaultTheme {
    return this.selectedTheme === 'light' ? lightTheme : darkTheme
  }

  successToast(description: string): void {
    this.message.success(description)
  }

  warningToast(description: string): void {
    this.message.warning(description)
  }

  errorToast(title: string, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error type'
    // eslint-disable-next-line no-console
    console.error(error)
    this.message.error(errorMessage)
  }

  setAccountModalOpen(value: boolean): void {
    this.accountModalOpen = value
  }

  setEnterpriseCardWidth(value: number): void {
    if (value > 0) this.enterpriseCardWidth = value
  }

  setRewardRef(key: keyof RewardElements, element: RewardElement): void {
    this.rewardElements[key] = element
  }

  setShowAnnouncementBanner(value: boolean): void {
    this.showAnnouncementBanner = value
  }

  reward(key: keyof RewardElements): void {
    this.rewardElements[key]?.rewardMe()
  }
}
