import { BigNumber, utils } from 'ethers'
// import Reward from 'react-rewards'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import Button from '../../components/Button'
import { useRootStore } from '../../context/RootStoreProvider'
import { formatNumber } from '../../utils/number-utils'

const { formatUnits } = utils

type Props = {
  foundPrice: BigNumber | undefined
  decimals: number | undefined
  hasEnoughBalance: boolean
  disclaimerChecked?: boolean
  selectedAmountEnterprises: number
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  // Make reward centered
  flex-direction: column;
  div:nth-child(3) {
    width: 100%;
  }
`

const MIN_FOUND_ENTERPRISES = 1

const getEnterpriseLabel = (amount: number): string => {
  if (amount === 1) {
    return `${formatNumber(amount)} Enterprise`
  }

  return `${formatNumber(amount)} Enterprises`
}

const getButtonText = ({
  nativeCurrencySymbol,
  selectedAmountEnterprises,
  foundPrice,
  hasEnoughBalance,
  decimals,
}: {
  nativeCurrencySymbol: string | undefined
  selectedAmountEnterprises: number
  foundPrice: BigNumber | undefined
  decimals: number | undefined
  hasEnoughBalance: boolean
}): string => {
  const decimalFoundPrice =
    foundPrice && formatNumber(formatUnits(foundPrice, decimals), { maximumFractionDigits: 4 })
  const amountText = `${decimalFoundPrice} ${nativeCurrencySymbol}`
  let buttonText = `Found ${getEnterpriseLabel(selectedAmountEnterprises)} for ${amountText}`

  if (!hasEnoughBalance) {
    buttonText = `Insufficient ${nativeCurrencySymbol} balance`
  }

  if (!selectedAmountEnterprises || selectedAmountEnterprises < MIN_FOUND_ENTERPRISES) {
    buttonText = 'Please add a valid amount'
  }

  return buttonText
}

const FoundEnterpriseButton: React.FC<Props> = ({
  foundPrice,
  hasEnoughBalance,
  selectedAmountEnterprises,
  decimals,
  disclaimerChecked = true,
}) => {
  const { acquisitionRoyaleContractStore, uiStore, web3Store } = useRootStore()
  const { foundingEnterprise } = acquisitionRoyaleContractStore
  const { network } = web3Store
  if (!acquisitionRoyaleContractStore.address) return null

  const isDisabled =
    disclaimerChecked === false ||
    !hasEnoughBalance ||
    selectedAmountEnterprises < MIN_FOUND_ENTERPRISES ||
    foundingEnterprise

  const buttonText = getButtonText({
    selectedAmountEnterprises,
    nativeCurrencySymbol: network.nativeCurrency.symbol,
    foundPrice,
    decimals,
    hasEnoughBalance,
  })

  const onClick = async (): Promise<void> => {
    if (!acquisitionRoyaleContractStore.address || !foundPrice) return
    const success = await acquisitionRoyaleContractStore.foundAuctioned(selectedAmountEnterprises)
    if (success) uiStore.reward('foundedEnterprise')
  }

  return (
    <Wrapper>
      <Button isLoading={foundingEnterprise} onClick={onClick} disabled={isDisabled} padding={0}>
        {buttonText}
      </Button>
    </Wrapper>
  )
}

export default observer(FoundEnterpriseButton)
