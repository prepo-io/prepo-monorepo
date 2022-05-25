import { Icon, spacingIncrement, TokenInput } from '@prepo-io/ui'
import { truncateAmountString } from '@prepo-io/utils'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import styled from 'styled-components'
import TransactionSummary from '../../components/TransactionSummary'
import { Position } from '../portfolio/PortfolioStore'
import { useRootStore } from '../../context/RootStoreProvider'
import { RowData } from '../../components/Table'
import { Callback } from '../../types/common.types'
import AdvancedSettingsModal from '../../components/AdvancedSettingsModal'

type Props = {
  position: Required<Position>
}

const FormItem = styled.div<{ showBorderTop?: boolean }>`
  border-top: 1px solid
    ${({ theme, showBorderTop }): string =>
      showBorderTop ? theme.color.primaryAccent : 'transparent'};
  margin-bottom: ${spacingIncrement(24)};
  padding-top: ${({ showBorderTop }): string => (showBorderTop ? spacingIncrement(12) : '0')};
`

const SettingsIconWrapper = styled.div`
  cursor: pointer;
  :hover {
    svg,
    path {
      fill: ${({ theme }): string => theme.color.primary};
    }
  }
`

const TitleWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding-right: ${spacingIncrement(36)};
`

const ClosePositionSummary: React.FC<Props> = ({ position }) => {
  const { advancedSettingsStore, portfolioStore, tradeStore, web3Store } = useRootStore()
  const { isSettingsOpen, setIsSettingsOpen } = advancedSettingsStore
  const { closeTrade, closeTradeHash, setCloseTradeHash } = tradeStore
  const { setSelectedPosition } = portfolioStore
  const { connected } = web3Store
  const positionValue = +truncateAmountString(`${position.data.totalValue}`, { hideCommas: true })
  const [amount, setAmount] = useState(positionValue)

  const tokenAmount = amount / position.data.price

  const onClickSettings = (): void => setIsSettingsOpen(true)

  const handleClose = (): void => {
    setSelectedPosition(undefined)
    setCloseTradeHash(undefined)
  }

  const handleClosePosition = async (
    successCallback: Callback<string>,
    failedCallback: Callback<string>
  ): Promise<void> => {
    const {
      data: { token },
    } = position

    const { error } = await closeTrade(token, tokenAmount, amount, position.market)

    if (error) {
      failedCallback(error)
    } else {
      successCallback()
    }
  }

  const tableData: RowData[] = [
    {
      label: 'Market',
      market: {
        name: position.market.name,
        position: position.position,
      },
    },
    {
      label: 'Position Value',
      amount: positionValue,
    },
  ]

  if (isSettingsOpen) return <AdvancedSettingsModal />

  return (
    <TransactionSummary
      data={tableData}
      onCancel={handleClose}
      onComplete={handleClose}
      onConfirm={handleClosePosition}
      onRetry={handleClosePosition}
      successButtonText="Close"
      title={
        <TitleWrapper>
          <span>Close Position</span>
          <SettingsIconWrapper onClick={onClickSettings}>
            <Icon name="settings" color="neutral5" width="19" height="20" />
          </SettingsIconWrapper>
        </TitleWrapper>
      }
      transactionHash={closeTradeHash}
      unlock={{
        amount: tokenAmount,
        contentType: 'closeTrade',
        token: position.data.token,
      }}
      withoutModalButton
    >
      <FormItem showBorderTop>
        <TokenInput
          connected={connected}
          hideBalance
          onChange={(value: string | number): void => {
            setAmount(+value)
          }}
          max={positionValue}
          showSlider
          usd
          value={amount}
        />
      </FormItem>
    </TransactionSummary>
  )
}

export default observer(ClosePositionSummary)
