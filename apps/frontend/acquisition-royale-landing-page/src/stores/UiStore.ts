import { makeAutoObservable } from 'mobx'
import { RewardElement } from 'react-rewards'
import { RootStore } from './RootStore'

type RewardElements = {
  foundedEnterprise?: undefined | RewardElement
  foundedPartnership?: undefined | RewardElement
}

export class UiStore {
  root: RootStore
  rewardElements: RewardElements
  accountModalOpen = false
  showAnnouncementBanner = false
  showHeaderHomeButton = false
  headerText = 'prePO'

  constructor(root: RootStore) {
    this.root = root
    this.rewardElements = {
      foundedEnterprise: undefined,
    }

    makeAutoObservable(this)
  }

  setAccountModalOpen(value: boolean): void {
    this.accountModalOpen = value
  }

  setShowAnnouncementBanner(value: boolean): void {
    this.showAnnouncementBanner = value
  }

  setShowHeaderHomeButton(value: boolean): void {
    this.showHeaderHomeButton = value
  }

  setRewardRef(key: keyof RewardElements, element: RewardElement): void {
    this.rewardElements[key] = element
  }

  setHeaderText(text: string): void {
    this.headerText = text
  }

  reward(key: keyof RewardElements): void {
    this.rewardElements[key]?.rewardMe()
  }
}
