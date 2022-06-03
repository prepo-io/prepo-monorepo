import { media, spacingIncrement } from 'prepo-ui'
import styled, { Color } from 'styled-components'
import { HistoryEventType, HistoryEventItemType } from './history.types'

type EventColors = {
  accent: keyof Color
  primary: keyof Color
}

type EventColorsObject = {
  [key in HistoryEventItemType]: EventColors
}

const Container = styled.div<{ colors: EventColors }>`
  background-color: ${({ theme, colors }): string => theme.color[colors.accent]};
  border-radius: ${({ theme }): number => theme.borderRadius}px;
  color: ${({ theme, colors }): string => theme.color[colors.primary]};
  font-weight: ${({ theme }): number => theme.fontWeight.semiBold};
  padding: ${spacingIncrement(6)} ${spacingIncrement(13)};
  text-align: center;
  ${media.desktop`
    font-size: ${({ theme }): string => theme.fontSize.md};
    padding: ${spacingIncrement(15)} ${spacingIncrement(13)};
  `}
`

const Wrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`

const eventColors: EventColorsObject = {
  deposit: {
    accent: 'accentWarning',
    primary: 'warning',
  },
  withdraw: {
    accent: 'accentWarning',
    primary: 'warning',
  },
  short: {
    accent: 'accentError',
    primary: 'error',
  },
  long: {
    accent: 'accentSuccess',
    primary: 'success',
  },
  liquidity: {
    accent: 'accentPrimary',
    primary: 'primary',
  },
}

const eventActionLabel = {
  open: 'Opened',
  close: 'Closed',
  add: 'Added',
}

const eventTypeLabel = {
  deposit: 'Deposited',
  withdraw: 'Withdrawn',
  short: 'Short',
  long: 'Long',
  liquidity: 'Liquidity',
}

type Props = {
  event: HistoryEventType
}

const getEventLabel = (event: HistoryEventType): string => {
  let label = ''
  if (event.action) {
    label = `${eventActionLabel[event.action]} `
  }

  return `${label}${eventTypeLabel[event.type]}`
}

const HistoryEvent: React.FC<Props> = ({ event }) => (
  <Wrapper>
    <Container colors={eventColors[event.type]}>{getEventLabel(event)}</Container>
  </Wrapper>
)

export default HistoryEvent
