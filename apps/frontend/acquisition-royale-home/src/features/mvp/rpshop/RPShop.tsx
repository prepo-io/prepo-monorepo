import { notification } from 'antd'
import { observer } from 'mobx-react-lite'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import Input from '../../../components/Input'
import Select, { Option } from '../../../components/Select'
import { useRootStore } from '../../../context/RootStoreProvider'
import { Consumables } from '../../../types/consumables.type'
import { ConsumablesPrices } from '../../../utils/consumables-utils'
import { numberInput } from '../../../utils/number-utils'
import { spacingIncrement } from '../../../utils/theme/utils'
import ActionCard from '../ActionCard'
import { rpShopDescription } from '../Descriptions'

const SelectWrapper = styled.div`
  margin-bottom: ${spacingIncrement(16)};
  width: 100%;
`

const consumables: {
  consumable: Consumables
  priceGetter: ConsumablesPrices
}[] = [
  { consumable: Consumables.Enterprise, priceGetter: 'enterpriseRpPrice' },
  { consumable: Consumables.RenameToken, priceGetter: 'renameTokenRpPrice' },
  { consumable: Consumables.RebrandToken, priceGetter: 'rebrandTokenRpPrice' },
  { consumable: Consumables.ReviveToken, priceGetter: 'reviveTokenRpPrice' },
]

const RPShop: React.FC = () => {
  const { acquisitionRoyaleRPShopContractStore, rpShopStore, uiStore } = useRootStore()
  const [clearSelect, setClearSelect] = useState(false)
  const {
    approveSpending,
    approving,
    buying,
    enterpriseRpPrice,
    needsApproval,
    purchase,
    quantity,
    rebrandTokenRpPrice,
    renameTokenRpPrice,
    reviveTokenRpPrice,
    setQuantity,
    setSelectedConsumable,
  } = acquisitionRoyaleRPShopContractStore
  const { rpShopBalances, rpShopButtonProps, rpShopCosts, rpShopComparisons } = rpShopStore

  const prices = useMemo(
    () => ({ enterpriseRpPrice, rebrandTokenRpPrice, renameTokenRpPrice, reviveTokenRpPrice }),
    [enterpriseRpPrice, rebrandTokenRpPrice, renameTokenRpPrice, reviveTokenRpPrice]
  )

  const handleApprove = async (): Promise<void> => {
    const approved = await approveSpending()
    if (approved) {
      notification.success({
        message: 'RP Approved! 🎉',
      })
    }
  }

  const handleConsumablesChange = (consumable: Consumables): void => {
    setSelectedConsumable(consumable)
  }

  const handleClear = (): void => {
    setSelectedConsumable(undefined)
    setClearSelect(false)
  }

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target
      numberInput(value, setQuantity, { preventNegative: true })
    },
    [setQuantity]
  )

  const handlePurchase = async (): Promise<void> => {
    const purchased = await purchase()
    if (!purchased) return
    const { cost, successful } = purchased
    if (successful) {
      notification.success({
        message: 'Purchase successful! 🎉',
      })
      if (cost >= 15) uiStore.reward('purchasedFromShop')
      setClearSelect(true)
      setQuantity('')
    }
  }

  const options = useMemo(
    (): Option[] =>
      consumables.map(({ consumable, priceGetter }) => {
        const price = prices[priceGetter]
        const priceText = price === undefined ? '' : `(${price} RP)`
        return {
          id: consumable,
          displayContent: `${consumable} ${priceText}`,
          searchValue: consumable,
          value: consumable,
          filterValue: consumable,
        }
      }),
    [prices]
  )

  const input = (
    <>
      <SelectWrapper>
        <Select
          onSelect={(value): void => handleConsumablesChange(value as Consumables)}
          options={options}
          onClear={handleClear}
          placeholder="What do you want to purchase?"
          shouldClear={clearSelect}
        />
      </SelectWrapper>
      <Input
        onChange={handleInputChange}
        placeholder="How many do you want to purchase?"
        value={quantity}
      />
    </>
  )

  return (
    <ActionCard
      action={needsApproval ? handleApprove : handlePurchase}
      balances={rpShopBalances}
      buttonProps={rpShopButtonProps}
      costs={rpShopCosts}
      comparisons={rpShopComparisons}
      description={rpShopDescription}
      input={input}
      loading={buying || approving}
      rewardOptions={{
        key: 'purchasedFromShop',
      }}
      title="RP Shop"
    />
  )
}

export default observer(RPShop)
