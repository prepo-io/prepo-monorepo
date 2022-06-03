import { IconName } from 'prepo-ui'
import { Routes } from '../../lib/routes'

export type PpoItem = {
  href: string
  title: string
  iconName: IconName
  target?: '_blank'
}

export const ppoItems: PpoItem[] = [
  { iconName: 'stake', title: 'Stake', href: Routes.Stake },
  { iconName: 'legal', title: 'Govern', href: Routes.Govern },
  { iconName: 'shopping-cart-arrow-down', title: 'Buy', href: Routes.Buy },
  { iconName: 'shopping-cart-arrow-right', title: 'Spend', href: Routes.Withdraw },
  { iconName: 'growth', title: 'Trade to Earn', href: '' },
  { iconName: 'water-drop', title: 'LP to Earn', href: '' },
  { iconName: 'history', title: 'History', href: Routes.History },
  { iconName: 'charts-line', title: 'Analytics', href: '', target: '_blank' },
]
