import { makeAutoObservable } from 'mobx'
import { RootStore } from '../../../stores/RootStore'

export enum SectionsEnum {
  INTRO = 'intro',
  FOUNDING = 'founding',
  GAMEPLAY = 'gameplay',
  FEATURES = 'features',
  FAQ = 'faq',
}

export class SectionStore {
  root: RootStore
  sectionsActive = {
    intro: false,
    founding: false,
    gameplay: false,
    features: false,
    faq: false,
  }

  constructor(root: RootStore) {
    this.root = root
    makeAutoObservable(this)
  }

  setSectionActive = (key: SectionsEnum, value: boolean): void => {
    this.sectionsActive = { ...this.sectionsActive, [key]: value }
  }

  getActiveSection = (): SectionsEnum => {
    let activeSection: SectionsEnum
    switch (true) {
      case this.sectionsActive.founding:
        activeSection = SectionsEnum.FOUNDING
        break
      case this.sectionsActive.intro:
        activeSection = SectionsEnum.INTRO
        break
      case this.sectionsActive.gameplay:
        activeSection = SectionsEnum.GAMEPLAY
        break
      case this.sectionsActive.features:
        activeSection = SectionsEnum.FEATURES
        break
      case this.sectionsActive.faq:
        activeSection = SectionsEnum.FAQ
        break
      default:
        activeSection = SectionsEnum.INTRO
        break
    }
    return activeSection
  }
}
