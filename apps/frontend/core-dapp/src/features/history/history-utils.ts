import { IconName } from 'prepo-ui'
import { HistoryEventItemType } from './history.types'
import { PositionType } from '../../utils/prepo.types'
import { coinsMock } from '../../__mocks__/currency.mock'
import { markets } from '../../lib/markets'

export const getHistoryItemIconTitle = (
  iconName: IconName
): { iconName: IconName; iconText: string } | undefined => {
  const allItems = [...coinsMock, ...markets]
  const foundedItem = allItems.find((item) => item.iconName === iconName)

  if (!foundedItem) {
    return undefined
  }

  return { iconName: foundedItem?.iconName, iconText: foundedItem?.name }
}

export const eventTypeRequiresPosition = (
  eventType: HistoryEventItemType
): eventType is PositionType => {
  if (eventType === 'deposit' || eventType === 'withdraw') {
    return false
  }

  return true
}
