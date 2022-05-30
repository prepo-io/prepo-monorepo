import { ButtonProps } from 'antd'
import { observer } from 'mobx-react-lite'
import { useMemo, useState } from 'react'
import styled from 'styled-components'
import Reward, { RewardConfig } from 'react-rewards'
import { defaultRewardConfig } from './reward-constants'
import StatsComparison, { ComparisonProps } from './StatsComparison'
import { centered, spacingIncrement } from '../../utils/theme/utils'
import FancyTitle from '../../components/FancyTitle'
import LowMatic from '../../components/LowMatic'
import { DEFAULT_DECIMAL, formatNumber } from '../../utils/number-utils'
import ConnectButton from '../connect/ConnectButton'
import Button from '../../components/Button'
import InfoTooltip from '../../components/InfoTooltip'
import { RewardElements } from '../../stores/UiStore'
import { useRootStore } from '../../context/RootStoreProvider'
import { CARDS_MAX_WIDTH } from '../../lib/constants'
import { media } from '../../utils/theme/media'
import Icon from '../../components/icon'

export type CostBreakdown = {
  amount: string
  unit: string
  label?: string
}

export type CostBalance = {
  amount: string
  unit: string
  breakdown?: CostBreakdown[]
  tooltip?: string
}

type RewardOptions = {
  key: keyof RewardElements
  config?: RewardConfig
}
type Props = {
  action?: () => unknown
  balances?: CostBalance[]
  balanceLabel?: string
  buttonProps?: ButtonProps
  input?: React.ReactNode
  comingSoon?: boolean
  comparisons?: ComparisonProps[]
  costLabel?: string
  costs?: CostBalance[]
  description?: React.ReactNode
  expandable?: boolean
  loading?: boolean
  lowMatic?: boolean
  messageBelowButton?: React.ReactNode
  rewardOptions?: RewardOptions
  title?: string
}

const ActionWrapper = styled.div`
  margin-top: ${spacingIncrement(12)};
`

const BreakdownItemWrapper = styled.div`
  display: flex;
  margin-top: ${spacingIncrement(3)};
`

const CostWrapper = styled.div`
  color: ${({ theme }): string => theme.color.white};
  font-family: ${({ theme }): string => theme.fontSize.sm};
`

const BalanceWrapper = styled(CostWrapper)`
  text-align: right;
`

const Center = styled.div`
  ${centered}
  width :100%;
`

const ComingSoon = styled.p`
  color: ${({ theme }): string => theme.color.accentPrimary};
  margin-bottom: 0;
  text-align: center;
`

const ComparisonWrapper = styled.div`
  margin-top: ${spacingIncrement(8)};
`

const SmallWhiteText = styled.p`
  margin-bottom: 0;
`

const CostLabel = styled.p`
  color: ${({ theme }): string => theme.color.accentPrimary};
  font-weight: ${({ theme }): number => theme.fontWeight.bold};
  margin-bottom: ${spacingIncrement(6)};
`

const CostBalanceWrapper = styled.div`
  align-items: center;
  display: flex;
`

const CostTooltipWrapper = styled.div`
  margin-left: ${spacingIncrement(4)};
`

const InputWrapper = styled.div`
  margin-top: ${spacingIncrement(12)};
`

const ExpandableContent = styled.form<{ expanded: boolean }>`
  max-height: ${({ expanded }): string =>
    expanded ? spacingIncrement(9999) : spacingIncrement(0)};
  overflow: hidden;
  transition: 0.3s;
`

const Description = styled.div`
  color: ${({ theme }): string => theme.color.grey};
  font-size: ${({ theme }): string => theme.fontSize.base};
  margin: 0;
  padding-top: ${spacingIncrement(24)};
  text-align: center;
  ${media.tablet`
  font-size: ${({ theme }): string => theme.fontSize.sm};
  `}
`

const ExpandIconWrapper = styled.div<{ expanded: boolean }>`
  cursor: pointer;
  transform: rotate(${({ expanded }): string => (expanded ? '180deg' : '0deg')});
`
const LowMaticWrapper = styled.div`
  margin-top: ${spacingIncrement(4)};
`

const Header = styled.div`
  align-items: center;
  display: flex;
  gap: ${spacingIncrement(12)};
`

const SemiboldUnderlinedSmallText = styled.p`
  font-size: ${({ theme }): string => theme.fontSize.xs};
  font-weight: ${({ theme }): number => theme.fontWeight.semiBold};
  margin-bottom: 0;
`

const BreakdownTitle = styled(SemiboldUnderlinedSmallText)`
  color: ${({ theme }): string => theme.color.accentPrimary};
  margin-bottom: ${spacingIncrement(6)};
`

const SmallText = styled.p`
  font-size: ${({ theme }): string => theme.fontSize.xs};
  font-weight: ${({ theme }): number => theme.fontWeight.regular};
  margin-bottom: 0;
`

const SummaryWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${spacingIncrement(8)} ${spacingIncrement(4)};
`

const Wrapper = styled.div`
  background-color: ${({ theme }): string => theme.color.secondary};
  border: solid 1px ${({ theme }): string => theme.color.accentPrimary};
  box-shadow: 0px 2px 24px ${({ theme }): string => theme.color.accentPrimary};
  font-family: ${({ theme }): string => theme.fontFamily.secondary};
  letter-spacing: 1px;
  line-height: 1;
  max-width: ${spacingIncrement(CARDS_MAX_WIDTH)};
  padding: ${spacingIncrement(16)};
  position: relative;
  transition: 0.3s;
  width: 100%;
`

const ActionCard: React.FC<Props> = ({
  action,
  balances,
  balanceLabel = 'Balance',
  buttonProps,
  children,
  comparisons,
  comingSoon,
  costs,
  costLabel = 'Total Cost',
  description,
  expandable,
  input,
  loading,
  lowMatic,
  messageBelowButton,
  rewardOptions,
  title,
}) => {
  const { web3Store, uiStore } = useRootStore()
  const [expanded, setExpanded] = useState(!expandable)

  const { connected } = web3Store
  const balance = useMemo(() => {
    if (!balances) return null
    return (
      <BalanceWrapper>
        <CostLabel>{balanceLabel}</CostLabel>
        {balances?.map(({ amount, unit }) => (
          <SmallWhiteText key={`${unit}_balance`}>
            {formatNumber(amount, { maximumFractionDigits: DEFAULT_DECIMAL })} {unit}
          </SmallWhiteText>
        ))}
      </BalanceWrapper>
    )
  }, [balanceLabel, balances])

  const reward = useMemo(() => {
    if (rewardOptions) {
      return (
        <Reward
          config={rewardOptions.config || defaultRewardConfig}
          ref={(ref): void => {
            if (ref === null) return
            uiStore.setRewardRef(rewardOptions.key, ref)
          }}
          type="emoji"
        >
          {/** Return an empty div to silence "children is undefined" warning */}
          <div />
        </Reward>
      )
    }
    return null
  }, [rewardOptions, uiStore])

  const button = useMemo(() => {
    if (!buttonProps && !action && !buttonProps.href) {
      return null
    }
    if (!connected) {
      return <ConnectButton block />
    }

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Button block loading={loading} onClick={action} {...buttonProps} />
  }, [action, buttonProps, connected, loading])

  const cost = useMemo(() => {
    if (!costs) return <CostLabel />
    return (
      <CostWrapper>
        <CostLabel>{costLabel}</CostLabel>
        {costs.map(({ amount, unit, breakdown, tooltip }) => (
          <CostBalanceWrapper key={`${unit}_cost`}>
            <SmallWhiteText>
              {formatNumber(amount, { maximumFractionDigits: DEFAULT_DECIMAL })} {unit}
            </SmallWhiteText>
            {breakdown && (
              <CostTooltipWrapper>
                <InfoTooltip iconSize={14}>
                  <BreakdownTitle>Breakdown</BreakdownTitle>
                  {breakdown.map(({ amount: breakdownAmount, label, unit: brakdownUnit }) => (
                    <BreakdownItemWrapper key={label}>
                      <SmallText>-&nbsp;</SmallText>
                      <SmallText>
                        {breakdownAmount} {brakdownUnit} {label}
                      </SmallText>
                    </BreakdownItemWrapper>
                  ))}
                </InfoTooltip>
              </CostTooltipWrapper>
            )}
            {tooltip && (
              <CostTooltipWrapper>
                <InfoTooltip iconSize={14}>{tooltip}</InfoTooltip>
              </CostTooltipWrapper>
            )}
          </CostBalanceWrapper>
        ))}
      </CostWrapper>
    )
  }, [costLabel, costs])

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (typeof action === 'function') action()
  }

  const toggleExpanded = (): void => setExpanded(!expanded)

  return (
    <Wrapper>
      <Header>
        <FancyTitle>{title}</FancyTitle>
        {expandable && (
          <ExpandIconWrapper expanded={expanded} onClick={toggleExpanded}>
            <Icon name="downArrow" />
          </ExpandIconWrapper>
        )}
      </Header>
      <ExpandableContent expanded={expanded}>
        <Description>{description}</Description>
        {children}
        <form onSubmit={handleSubmit}>
          {Boolean(input) && <InputWrapper>{input}</InputWrapper>}
          {(cost !== null || balance !== null) && (
            <SummaryWrapper>
              {cost}
              {balance}
            </SummaryWrapper>
          )}
          {lowMatic && (
            <LowMaticWrapper>
              <LowMatic />
            </LowMaticWrapper>
          )}
          <Center>{reward}</Center>
          <ActionWrapper>{button}</ActionWrapper>
        </form>
        {messageBelowButton}
        {comparisons &&
          comparisons.map((comparison) => (
            <ComparisonWrapper key={comparison.id.toString()}>
              {/* eslint-disable-next-line react/jsx-props-no-spreading */}
              <StatsComparison {...comparison} />
            </ComparisonWrapper>
          ))}
        {comingSoon && <ComingSoon>...Coming Soon...</ComingSoon>}
      </ExpandableContent>
    </Wrapper>
  )
}

export default observer(ActionCard)
