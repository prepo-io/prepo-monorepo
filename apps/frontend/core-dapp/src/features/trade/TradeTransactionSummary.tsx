import { useRouter } from 'next/router'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import EstimateProfitLoss from './EstimateProfitLoss'
import TransactionSummary from '../../components/TransactionSummary/TransactionSummary'
import { Callback } from '../../types/common.types'
import { useRootStore } from '../../context/RootStoreProvider'
import useSelectedMarket from '../../hooks/useSelectedMarket'
import { EstimatedValuation } from '../definitions'
import { Routes } from '../../lib/routes'
import { numberFormatter } from '../../utils/numberFormatter'

const { significantDigits } = numberFormatter

const TradeTransactionSummary: React.FC = () => {
  const router = useRouter()
  const { tradeStore, preCTTokenStore } = useRootStore()
  const { openTradeAmount, openTradeHash, openTradeUILoading, setOpenTradeHash, tradeDisabled } =
    tradeStore
  const selectedMarket = useSelectedMarket()
  const { valuation } = tradeStore

  useEffect(() => {
    if (!selectedMarket) return

    tradeStore.quoteExactInput(selectedMarket)
  }, [selectedMarket, tradeStore, openTradeAmount])

  const onCancel = (): void => {
    setOpenTradeHash(undefined)
  }

  const onComplete = (): void => {
    setOpenTradeHash(undefined)
    router.push(Routes.Portfolio)
  }

  const handlePlaceTrade = async (
    successCallback: Callback<string>,
    failedCallback: Callback<string>
  ): Promise<void> => {
    if (selectedMarket === undefined) {
      // this shouldn't ever happen unless we use this component in pages where markets aren't selected
      failedCallback('No market selected!')
      return
    }
    const { error } = await tradeStore.openTrade(selectedMarket)

    if (error) {
      failedCallback(error)
    } else {
      successCallback()
    }
  }

  if (selectedMarket === undefined) return null

  const estimatedValuation = valuation ? `$${significantDigits(valuation)}` : undefined

  const tradeTransactionSummary = [
    {
      label: 'Trade Size',
      amount: openTradeAmount,
    },
    {
      label: 'Average Valuation Price',
      tooltip: <EstimatedValuation marketName={selectedMarket.name} />,
      amount: estimatedValuation,
      ignoreFormatAmount: true,
    },
  ]

  return (
    <TransactionSummary
      loading={openTradeUILoading(selectedMarket)}
      data={tradeTransactionSummary}
      disabled={tradeDisabled}
      onComplete={onComplete}
      onConfirm={handlePlaceTrade}
      onRetry={handlePlaceTrade}
      onCancel={onCancel}
      transactionHash={openTradeHash}
      successButtonText="View Portfolio"
      unlock={{
        amount: openTradeAmount,
        token: preCTTokenStore,
        contentType: 'openTrade',
      }}
    >
      {selectedMarket.sliderSettings && (
        <EstimateProfitLoss
          sliderSettings={selectedMarket.sliderSettings}
          getProfitLossOnExit={selectedMarket.getProfitLossOnExit}
          openTradeAmount={openTradeAmount}
        />
      )}
    </TransactionSummary>
  )
}

export default observer(TradeTransactionSummary)
