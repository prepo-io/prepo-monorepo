import { makeAutoObservable } from 'mobx'
import { RootStore } from '../../../stores/RootStore'

const DEFAULT_FOUND = 10
const MAX_FOUND = 50

export class PartnershipStore {
  root: RootStore
  defaultAmountToFound: number = DEFAULT_FOUND
  maxAmountToFound: number = MAX_FOUND
  amountToFound: number = DEFAULT_FOUND
  disclaimerChecked = false
  partnershipBuyTokenUrl: string | undefined

  constructor(root: RootStore) {
    this.root = root
    makeAutoObservable(this)
  }

  setAmountToFound(amount: number): void {
    this.amountToFound = amount
  }

  setDisclaimerChecked(disclaimer: boolean): void {
    this.disclaimerChecked = disclaimer
  }

  setPartnershipBuyTokenUrl(newUrl: string): void {
    this.partnershipBuyTokenUrl = newUrl
  }

  reset(): void {
    this.disclaimerChecked = false
    this.amountToFound = DEFAULT_FOUND
    this.defaultAmountToFound = DEFAULT_FOUND
  }
}
