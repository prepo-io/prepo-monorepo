import { observer } from 'mobx-react-lite'
import { BigNumber, BigNumberish, utils } from 'ethers'
import { useRootStore } from '../../context/RootStoreProvider'
import Button from '../../components/Button'
import ConnectButton from '../connect/ConnectButton'
import { formatNumber } from '../../utils/number-utils'

const { formatUnits } = utils

const getFoundPrice = (amountEnterprises: BigNumberish, auctionPrice: BigNumber): BigNumber =>
  auctionPrice.mul(amountEnterprises)

const getLabelAmount = (amount: number): string => {
  if (amount === 1) {
    return `${formatNumber(amount)} NFT`
  }

  return `${formatNumber(amount)} NFTs`
}

const getButtonText = ({
  needsMoreTokens,
  partnerPrice,
  amountValue,
  shouldAllowTokens,
  tokenSymbol,
  decimalsNumber,
}: {
  needsMoreTokens: boolean | undefined
  partnerPrice: BigNumber | undefined
  amountValue: number
  shouldAllowTokens: boolean | undefined
  tokenSymbol: string | undefined
  decimalsNumber: number | undefined
}): string => {
  const normalizedAmount = amountValue || 0
  const invalidAmount = !amountValue || amountValue < 1
  const decimalFoundPrice =
    partnerPrice &&
    formatNumber(formatUnits(partnerPrice.mul(normalizedAmount), decimalsNumber), {
      maximumFractionDigits: 4,
    })

  if (invalidAmount) {
    return 'Please add a valid amount'
  }

  if (needsMoreTokens) {
    return `You need more ${tokenSymbol}`
  }

  if (shouldAllowTokens) {
    return `Unlock ${tokenSymbol} for Purchase`
  }

  return `Purchase ${getLabelAmount(amountValue)} for ${decimalFoundPrice} ${tokenSymbol}`
}

const PartnershipFoundButton: React.FC = () => {
  const {
    partnershipStore,
    acquisitionRoyalePartnershipContractStore,
    web3Store,
    partnershipTokenContractStore,
    uiStore,
  } = useRootStore()
  const { symbolOverride, approving, decimalsNumber } = partnershipTokenContractStore
  const { partnerPrice, purchasingNFT } = acquisitionRoyalePartnershipContractStore
  const invalidAmount = !partnershipStore.amountToFound || partnershipStore.amountToFound < 1
  const isDisabled =
    !partnershipStore.disclaimerChecked || purchasingNFT || approving || invalidAmount
  const isLoading = purchasingNFT || approving
  const normalizedAmount = partnershipStore.amountToFound || 0

  const totalFoundPrice =
    partnerPrice && !Number.isNaN(partnershipStore.amountToFound)
      ? getFoundPrice(partnershipStore.amountToFound, partnerPrice)
      : undefined

  const shouldAllowTokens = partnershipTokenContractStore.needsToAllowTokens(
    acquisitionRoyalePartnershipContractStore.address,
    totalFoundPrice
  )

  const needsMoreTokens = partnershipTokenContractStore.signerNeedsMoreTokens(
    partnerPrice?.mul(normalizedAmount)
  )

  const onClick = async (): Promise<void> => {
    if (!acquisitionRoyalePartnershipContractStore.address || !totalFoundPrice) return

    if (shouldAllowTokens) {
      partnershipTokenContractStore.approve(
        acquisitionRoyalePartnershipContractStore.address,
        totalFoundPrice.mul(partnershipStore.amountToFound).toString()
      )
    } else {
      const success = await acquisitionRoyalePartnershipContractStore.purchase(
        partnershipStore.amountToFound
      )
      if (success) {
        uiStore.reward('foundedPartnership')
      }
    }
  }

  if (!web3Store.signerState.address) {
    return <ConnectButton />
  }

  return (
    <Button type="button" onClick={onClick} disabled={isDisabled} isLoading={isLoading}>
      {getButtonText({
        needsMoreTokens,
        partnerPrice,
        amountValue: partnershipStore.amountToFound,
        shouldAllowTokens,
        tokenSymbol: symbolOverride,
        decimalsNumber,
      })}
    </Button>
  )
}

export default observer(PartnershipFoundButton)
