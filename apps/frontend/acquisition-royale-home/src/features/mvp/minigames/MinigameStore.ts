import { makeAutoObservable } from 'mobx'
import { MiniGame } from './games'
import { MinigameHookStore } from '../../../stores/entities/MinigameHook.entity'
import { MinigameProRataStore } from '../../../stores/entities/MinigameProRata.entity'
import { RootStore } from '../../../stores/RootStore'

export class MinigameStore {
  loading = false
  details: MiniGame
  hook: MinigameHookStore
  proRata: MinigameProRataStore
  constructor(public root: RootStore, details: MiniGame) {
    this.details = details
    this.hook = new MinigameHookStore(root, details.hookAddress)
    this.proRata = new MinigameProRataStore(root, details.proRataAddress)
    makeAutoObservable(this, {}, { autoBind: true })
  }

  setLoading(loading: boolean): void {
    this.loading = loading
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
}
