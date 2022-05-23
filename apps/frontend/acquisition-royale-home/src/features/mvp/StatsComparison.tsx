import { useMemo } from 'react'
import styled, { Color } from 'styled-components'
import { spacingIncrement } from '../../utils/theme/utils'

type Format = (data: number) => string
export type CompareItem = {
  after?: number
  before?: number
  hideBefore?: boolean
  formatAfter?: Format
  formatBefore?: Format
  label?: string
  labelColor?: keyof Color
  unit?: string
}

export type ComparisonProps = {
  id: number
  burned?: boolean
  name?: string
  stats?: CompareItem[]
}

const BoldText = styled.span`
  font-weight: ${({ theme }): number => theme.fontWeight.bold};
`

const Before = styled.p`
  color: ${({ theme }): string => theme.color.grey};
  margin-bottom: 0;
  text-decoration: line-through;
`

const HiddenText = styled.span`
  display: none;
`

const GreenText = styled(BoldText)`
  color: ${({ theme }): string => theme.color.success};
`

const Label = styled.p<{ color: keyof Color }>`
  color: ${({ color, theme }): string => theme.color[color]};
  margin-bottom: 0;
`

const RedText = styled(BoldText)`
  color: ${({ theme }): string => theme.color.error};
`

const NameText = styled.p`
  color: ${({ theme }): string => theme.color.white};
  font-weight: ${({ theme }): number => theme.fontWeight.semiBold};
  margin-bottom: 0;
`

const ComparisonWrapper = styled.div<{ singleLine?: boolean }>`
  display: flex;
  margin-top: ${({ singleLine }): string => (singleLine ? '0' : spacingIncrement(6))};
`

const OneLineWrapper = styled.div`
  display: flex;
`

const StatsWrapper = styled.div`
  margin-top: ${spacingIncrement(6)};
  padding-left: ${spacingIncrement(6)};
`

const WhiteText = styled(BoldText)`
  color: ${({ theme }): string => theme.color.white};
`

const Wrapper = styled.div`
  font-family: ${({ theme }): string => theme.fontFamily.secondary};
  font-size: ${({ theme }): string => theme.fontSize.sm};
  font-style: italic;
`

const Stat: React.FC<{ singleLine?: boolean } & CompareItem> = ({
  after,
  before,
  formatAfter,
  formatBefore,
  hideBefore,
  label,
  labelColor = 'white',
  unit,
  singleLine,
}) => {
  let BeforeStyle = WhiteText
  let AfterStyle = HiddenText
  if (after !== undefined && before !== undefined) {
    if (after > before || after < before) {
      BeforeStyle = Before
    }
    if (after > before) {
      AfterStyle = GreenText
    }
    if (after < before) {
      AfterStyle = RedText
    }
  }

  const format = (data: number, formatter?: Format): string =>
    formatter ? formatter(data) : `${data}`

  return (
    <ComparisonWrapper singleLine={singleLine}>
      {Boolean(label) && <Label color={labelColor}>{label}&nbsp;</Label>}
      {!hideBefore && before !== undefined && (
        <BeforeStyle>
          {format(before, formatBefore)} {unit}&nbsp;
        </BeforeStyle>
      )}
      {after !== undefined && (
        <AfterStyle>
          {format(after, formatAfter)} {unit}&nbsp;
        </AfterStyle>
      )}
    </ComparisonWrapper>
  )
}

const StatsComparison: React.FC<ComparisonProps> = ({ burned, name, stats }) => {
  const oneLineStat = useMemo(() => {
    // if it's burned, don't need to show stats
    if (!stats || stats.length !== 1 || burned) {
      return null
    }
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Stat singleLine {...stats[0]} />
  }, [burned, stats])

  const makeStats = useMemo(() => {
    if (burned || !stats || stats.length <= 1) return null
    return (
      <StatsWrapper>
        {stats.map((stat) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <Stat key={`${stat.after}_${stat.unit}`} {...stat} />
        ))}
      </StatsWrapper>
    )
  }, [burned, stats])

  return (
    <Wrapper>
      <OneLineWrapper>
        <NameText>{name}:</NameText>&nbsp;
        {oneLineStat}
        {burned === true && <RedText>Burned</RedText>}
      </OneLineWrapper>
      {makeStats}
    </Wrapper>
  )
}

export default StatsComparison
