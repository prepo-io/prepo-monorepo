import { ButtonProps } from 'antd'
import { makeAutoObservable } from 'mobx'
import { MiniGame } from './games'
import { MinigameHookStore } from '../../../stores/entities/MinigameHook.entity'
import { MinigameProRataStore } from '../../../stores/entities/MinigameProRata.entity'
import { RootStore } from '../../../stores/RootStore'
import { LOADING } from '../../../utils/common-utils'

export class MinigameStore {
  loading = false
  details: MiniGame
  hook: MinigameHookStore
  proRata: MinigameProRataStore
  constructor(public root: RootStore, details: MiniGame) {
    this.details = details
    this.hook = new MinigameHookStore(root, details.hookAddress)
    this.proRata = new MinigameProRataStore(root, details.proRataAddress, details.title)
    makeAutoObservable(this, {}, { autoBind: true })
  }

  setLoading(loading: boolean): void {
    this.loading = loading
  }

  async doAction(): Promise<void> {
    if (!this.loading) {
      this.setLoading(true)
      await this.proRata.action()
      this.setLoading(false)
    }
  }

  get buttonProps(): ButtonProps {
    const { currActionCount, userActionLimitPerPeriod } = this.proRata
    if (
      userActionLimitPerPeriod === undefined ||
      this.eligible === undefined ||
      this.limitReached ||
      this.prevPeriodPayout
    )
      return LOADING
    if (this.prevPeriodPayout > 0)
      return { children: `Claim ${this.prevPeriodPayout.toFixed(4)} RP` } // TODO: use dynamic currency symbol
    if (!this.eligible) return { disabled: true, children: 'Ineligible for this task!' }
    if (this.limitReached) return { disabled: true, children: 'Earn limit reached!' }
    let children = this.details.buttonText
    if (userActionLimitPerPeriod > 0)
      children = `${children} (${currActionCount}/${userActionLimitPerPeriod})`
    return { children }
  }

  get curPeriodPayout(): number | undefined {
    const { rewardAmountPerPeriod, totalCurrActionCount } = this.proRata
    if (rewardAmountPerPeriod === undefined || totalCurrActionCount === undefined) return undefined
    return +(rewardAmountPerPeriod / totalCurrActionCount).toFixed(4)
  }

  get eligible(): boolean | undefined {
    const {
      minAcquireCount,
      minCompeteCount,
      minEnterpriseCount,
      minMergeCount,
      minReviveCount,
      mustBeRebranded,
      mustBeRenamed,
    } = this.hook
    const { signerHookStats } = this.root.signerStore

    if (
      minAcquireCount === undefined ||
      minCompeteCount === undefined ||
      minEnterpriseCount === undefined ||
      minMergeCount === undefined ||
      minReviveCount === undefined ||
      mustBeRebranded === undefined ||
      mustBeRenamed === undefined ||
      signerHookStats === undefined
    )
      return undefined

    const { acquisitions, competes, enterpriseCount, mergers, rebranded, renamed, revives } =
      signerHookStats

    return (
      acquisitions >= minAcquireCount &&
      competes >= minCompeteCount &&
      enterpriseCount >= minEnterpriseCount &&
      mergers >= minMergeCount &&
      revives >= minReviveCount &&
      rebranded >= mustBeRebranded &&
      renamed >= mustBeRenamed
    )
  }

  get hasClaim(): boolean | undefined {
    if (this.prevPeriodPayout === undefined) return undefined

    return this.prevPeriodPayout > 0
  }

  get limitReached(): boolean | undefined {
    const { userActionLimitPerPeriod, currActionCount } = this.proRata
    if (userActionLimitPerPeriod === undefined || currActionCount === undefined) return undefined
    return userActionLimitPerPeriod > 0 && currActionCount >= userActionLimitPerPeriod
  }

  get prevPeriodPayout(): number | undefined {
    const { prevActionCount, rewardAmountPerPeriod, totalPrevActionCount } = this.proRata
    if (prevActionCount === undefined || totalPrevActionCount === undefined) return undefined
    return +((rewardAmountPerPeriod / totalPrevActionCount) * prevActionCount).toFixed(4)
  }
}
