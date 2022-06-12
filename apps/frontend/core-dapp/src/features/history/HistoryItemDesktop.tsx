import { Col, Row } from 'antd'
import styled from 'styled-components'
import { spacingIncrement } from 'prepo-ui'
import HistoryEventComponent from './HistoryEvent'
import { HistoryItem } from './history.types'
import { getHistoryItemIconTitle, eventTypeRequiresPosition } from './history-utils'
import HistoryIconTitle from '../../components/MarketIconTitle'
import { getFullDateTimeFromSeconds } from '../../utils/date-utils'
import PositionLabel from '../position/PositionLabel'
import useResponsive from '../../hooks/useResponsive'
import { numberFormatter } from '../../utils/numberFormatter'

const { toUsd } = numberFormatter

const Wrapper = styled.div`
  border-bottom: 1px solid ${({ theme }): string => theme.color.accent1};
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

const PrimaryText = styled.div`
  color: ${({ theme }): string => theme.color.neutral1};
  font-size: ${({ theme }): string => theme.fontSize.md};
  font-weight: ${({ theme }): number => theme.fontWeight.semiBold};
`

const SecondaryText = styled.div`
  color: ${({ theme }): string => theme.color.neutral3};
  font-size: ${({ theme }): string => theme.fontSize.sm};
  font-weight: ${({ theme }): number => theme.fontWeight.medium};
`

const Position = styled(PositionLabel)`
  display: inline-block;
  font-size: ${({ theme }): string => theme.fontSize.sm};
`

type Props = {
  historyItem: HistoryItem
}

const HistoryItemDesktop: React.FC<Props> = ({ historyItem }) => {
  const { isDesktop } = useResponsive()
  const iconTitle = getHistoryItemIconTitle(historyItem.asset)

  return (
    <Wrapper>
      <HistoryItemRow>
        <Col xs={6}>
          {iconTitle && (
            <HistoryIconTitle
              iconName={iconTitle.iconName}
              size={isDesktop ? 'md' : 'sm'}
              color="secondary"
            >
              {iconTitle.iconText}
            </HistoryIconTitle>
          )}
          {eventTypeRequiresPosition(historyItem.event.type) && (
            <SecondaryText>
              Position: <Position positionType={historyItem.event.type} />
            </SecondaryText>
          )}
        </Col>
        <Col xs={6}>
          <SecondaryText>Value</SecondaryText>
          <PrimaryText>{toUsd(historyItem.amount)}</PrimaryText>
        </Col>
        <Col xs={6}>
          <SecondaryText>Transaction Time</SecondaryText>
          <PrimaryText>{getFullDateTimeFromSeconds(historyItem.timestamp)}</PrimaryText>
        </Col>
        <Col xs={6}>
          <HistoryEventComponent event={historyItem.event} />
        </Col>
      </HistoryItemRow>
    </Wrapper>
  )
}

export default HistoryItemDesktop
