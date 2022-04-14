import { Consumables } from '../types/consumables.type'

export const consumablesTokenId = {
  [Consumables.RenameToken]: 0,
  [Consumables.RebrandToken]: 1,
  [Consumables.ReviveToken]: 2,
}

export type ConsumablesBalance =
  | 'enterpriseBalance'
  | 'rebrandTokenBalance'
  | 'renameTokenBalance'
  | 'reviveTokenBalance'

export const consumablesBalanceMap: { [consumable: string]: ConsumablesBalance } = {
  [Consumables.Enterprise]: 'enterpriseBalance',
  [Consumables.RebrandToken]: 'rebrandTokenBalance',
  [Consumables.RenameToken]: 'renameTokenBalance',
  [Consumables.ReviveToken]: 'reviveTokenBalance',
}

export type ConsumablesPrices =
  | 'enterpriseRpPrice'
  | 'rebrandTokenRpPrice'
  | 'renameTokenRpPrice'
  | 'reviveTokenRpPrice'

export const consumableCostMap: {
  [consumable: string]: ConsumablesPrices
} = {
  [Consumables.Enterprise]: 'enterpriseRpPrice',
  [Consumables.RebrandToken]: 'rebrandTokenRpPrice',
  [Consumables.RenameToken]: 'renameTokenRpPrice',
  [Consumables.ReviveToken]: 'reviveTokenRpPrice',
}
