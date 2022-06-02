import { reaction } from 'mobx'
import { Erc20Store } from './Erc20.entity'
import { MinigameProRataStore } from './MinigameProRata.entity'
import { RootStore } from '../RootStore'

export class RewardTokenStore extends Erc20Store {
  proRata: MinigameProRataStore
  constructor(public root: RootStore, proRata: MinigameProRataStore) {
    super(root, 'REWARD_TOKEN')
    this.proRata = proRata
    this.initContract()
  }

  initContract(): void {
    const disposer = reaction(
      () => this.proRata?.rewardToken,
      (tokenAddress) => {
        if (tokenAddress !== undefined) {
          this.updateAddress(tokenAddress)
          disposer()
        }
      }
    )
  }
}
