import { Col, Row } from 'antd'
import styled from 'styled-components'
import { spacingIncrement } from '@prepo-io/ui'
import HistoryEventComponent from './HistoryEvent'
import { HistoryItem } from './history.types'
import { getHistoryItemIconTitle } from './history-utils'
import HistoryIconTitle from '../../components/MarketIconTitle'
import { formatUsd } from '../../utils/number-utils'
import { getFullDateTimeFromSeconds } from '../../utils/date-utils'

const Wrapper = styled.div`
  border-bottom: 1px solid ${({ theme }): string => theme.color.primaryAccent};
  padding: ${spacingIncrement(16)} ${spacingIncrement(20)};

  &:last-child {
    border-bottom: none;
  }
`

const HistoryItemRow = styled(Row)`
  margin-bottom: ${spacingIncrement(12)};

  &:last-child {
    margin-bottom: 0;
  }
`

const AmountUsd = styled.div`
  color: ${({ theme }): string => theme.color.neutral1};
  font-weight: ${({ theme }): number => theme.fontWeight.semiBold};
`

const Timestamp = styled.div`
  color: ${({ theme }): string => theme.color.neutral1};
  font-size: ${({ theme }): string => theme.fontSize.xs};
  font-weight: ${({ theme }): number => theme.fontWeight.medium};
  text-align: right;
`

type Props = {
  historyItem: HistoryItem
}

const HistoryItemMobile: React.FC<Props> = ({ historyItem }) => {
  const iconTitle = getHistoryItemIconTitle(historyItem.asset)
  return (
    <Wrapper>
      <HistoryItemRow>
        <Col xs={12}>
          {iconTitle && (
            <HistoryIconTitle iconName={iconTitle.iconName} size="sm" color="secondary">
              {iconTitle.iconText}
            </HistoryIconTitle>
          )}
        </Col>
        <Col xs={12}>
          <HistoryEventComponent event={historyItem.event} />
        </Col>
      </HistoryItemRow>
      <HistoryItemRow>
        <Col xs={8}>
          <AmountUsd>{formatUsd(historyItem.amount, false)}</AmountUsd>
        </Col>
        <Col xs={16}>
          <Timestamp>{getFullDateTimeFromSeconds(historyItem.timestamp)}</Timestamp>
        </Col>
      </HistoryItemRow>
    </Wrapper>
  )
}

export default HistoryItemMobile
