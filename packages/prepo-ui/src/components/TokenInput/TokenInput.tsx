// eslint-disable-next-line import/no-extraneous-dependencies
import { truncateAmountString, validateNumber } from 'prepo-utils'
import Skeleton from 'react-loading-skeleton'
import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import Icon from '../Icon'
import { IconName } from '../Icon/icon.types'
import Input, { Alignment } from '../Input'
import Slider, { SliderValue } from '../Slider'
import { media, spacingIncrement } from '../../common-utils'
import useResponsive from '../../hooks/useResponsive'

type Props = {
  alignInput?: Alignment
  balance?: number | string
  connected?: boolean
  disabled?: boolean
  disableClickBalance?: boolean
  hideBalance?: boolean
  hideInput?: boolean
  iconName?: IconName
  label?: string
  onChange?: (value: number | string) => void
  max?: number | string
  shadowSuffix?: string
  showSlider?: boolean
  symbol?: string
  usd?: boolean
  value?: number
  balanceLabel?: string
}

const BalanceText = styled.p<{ $clickable?: boolean }>`
  color: ${({ theme }): string => theme.color.neutral4};
  font-size: ${({ theme }): string => theme.fontSize.xs};
  font-weight: ${({ theme }): number => theme.fontWeight.medium};
  margin-bottom: 0;
  ${({ $clickable }): string => ($clickable ? 'cursor: pointer;' : '')}
  ${media.desktop`
    font-size: ${({ theme }): string => theme.fontSize.md};
  `}
  :hover {
    span {
      color: ${({ $clickable, theme }): string =>
        theme.color[$clickable ? 'primary' : 'secondary']};
    }
  }
`

const SemiboldText = styled.span`
  color: ${({ theme }): string => theme.color.secondary};
  font-size: inherit;
  font-weight: ${({ theme }): number => theme.fontWeight.semiBold};
  ${media.desktop`
    font-size: inherit;
  `}
`

const FlexCenterWrapper = styled.div`
  align-items: center;
  display: flex;
  gap: ${spacingIncrement(8)};
  ${media.desktop`
    gap: ${spacingIncrement(10)};
  `}
`

const CurrencyWrapper = styled(FlexCenterWrapper)`
  font-size: ${({ theme }): string => theme.fontSize.sm};
  ${media.desktop`
    font-size: ${({ theme }): string => theme.fontSize.lg};
  `}
`

const SliderWrapper = styled.div`
  margin: ${spacingIncrement(24)} 0;
`

const TokenInput: React.FC<Props> = ({
  alignInput,
  balance,
  connected,
  disabled,
  disableClickBalance,
  hideBalance,
  hideInput,
  iconName,
  label = 'Amount',
  onChange,
  max = 0,
  shadowSuffix,
  showSlider,
  symbol = '',
  balanceLabel = 'Balance',
  usd,
  value,
}) => {
  const { isDesktop } = useResponsive()
  const [stringValue, setStringValue] = useState(`${value ?? ''}`)
  const canInteract = !disabled && connected
  const defaultValue = connected && stringValue !== '' ? value ?? stringValue : ''
  const size = isDesktop ? '40' : '31'

  const handleClickBalance = useCallback(
    (amount: number | string): void => {
      if (!disableClickBalance) {
        setStringValue(`${amount}`)
        if (onChange) onChange(amount)
      }
    },
    [disableClickBalance, onChange]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value: inputValue } = e.target
    if (validateNumber(inputValue)) {
      setStringValue(inputValue)
      if (onChange) onChange(+inputValue)
    }
  }

  // input with number type will allow +/- in the middle or at the end
  // the captured value will be '' but when setting that value, it will preserve the plus minus
  // e.g. if we enter 100++ and console log the `inputValue`, we will see '', and +inputValue will be 0
  // but when we setStringValue(inputValue), it will show 100++ in the input field
  // this handleKeyDown will prevent +/- sign from proceeding to `onChange`
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === '+' || e.key === '-') e.preventDefault()
  }

  const handleSliderChange = (e: SliderValue): void => {
    if (typeof e === 'number' && canInteract) {
      setStringValue(`${e}`)
      if (onChange) onChange(e)
    }
  }

  // balanceUI will show by default. If balance is undefined, it will assume it's loading
  // if we want to hide balance, use  hideBalance
  const balanceUI = useMemo(() => {
    if (hideBalance) return null
    if (balance === undefined && connected)
      return (
        <FlexCenterWrapper>
          <BalanceText>{balanceLabel}: </BalanceText>
          <Skeleton height={20} width={80} />
        </FlexCenterWrapper>
      )
    return (
      <BalanceText
        $clickable={canInteract && !disableClickBalance}
        onClick={(): void => {
          if (canInteract) handleClickBalance(balance ?? 0)
        }}
      >
        {balanceLabel}:&nbsp;
        <SemiboldText>
          {usd && '$'}
          {truncateAmountString(`${!connected ? 0 : balance}`)}&nbsp;
          {!usd && symbol}
        </SemiboldText>
      </BalanceText>
    )
  }, [
    hideBalance,
    balance,
    connected,
    balanceLabel,
    canInteract,
    disableClickBalance,
    usd,
    symbol,
    handleClickBalance,
  ])

  const tokenSymbol = useMemo(() => {
    if (!iconName && !symbol) return null
    return (
      <CurrencyWrapper>
        {iconName !== undefined && <Icon name={iconName} height={size} width={size} />}
        {symbol !== undefined && <SemiboldText>{symbol}</SemiboldText>}
      </CurrencyWrapper>
    )
  }, [iconName, size, symbol])

  return (
    <div>
      {!hideInput && (
        <Input
          alignInput={alignInput}
          disabled={!canInteract}
          label={label}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="0"
          prefix={tokenSymbol}
          secondaryLabel={balanceUI}
          shadowSuffix={shadowSuffix ?? (usd ? 'USD' : undefined)}
          step="0.01"
          type="number"
          value={defaultValue}
        />
      )}
      {showSlider && (
        <SliderWrapper>
          <Slider
            labelPosition="none"
            min={0}
            max={+max}
            onChange={handleSliderChange}
            step={0.01}
            thickness="small"
            thumbStyles={['circle', 'circle']}
            trackColor="primary"
            trackUnderlyingColor="neutral7"
            value={+defaultValue}
          />
        </SliderWrapper>
      )}
    </div>
  )
}

export default TokenInput
