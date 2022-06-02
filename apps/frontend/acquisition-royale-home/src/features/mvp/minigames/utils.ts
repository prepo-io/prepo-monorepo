import { minigames, SupportedMinigame } from './games'
import { MinigameStore } from './MinigameStore'
import { RootStore } from '../../../stores/RootStore'

export type MinigameStores = { [key in SupportedMinigame]: MinigameStore }

export const makeMinigameStores = (root: RootStore): MinigameStores => {
  const stores = {}
  minigames.forEach((game) => {
    stores[game.key] = new MinigameStore(root, game)
  })

  return stores as MinigameStores
}
