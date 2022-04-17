import { ChangeEvent } from 'react'
import { Checkbox } from '@chakra-ui/react'
import { Box, Center, Text } from '@chakra-ui/layout'
import styled from 'styled-components'
import { utils } from 'ethers'
import { observer } from 'mobx-react-lite'
import PartnershipFoundButton from './PartnershipFoundButton'
import PartnershipInformation from './PartnershipInformation'
import { PartnertshipTokensContracts } from './partnertship-contracts'
import PartnershipLowBalance from './PartnershipLowBalance'
import { spacingIncrement } from '../../utils/theme/theme-utils'
import FoundingNumberInput from '../../components/FoundingNumberInput'
import { useRootStore } from '../../context/RootStoreProvider'
import FoundingInformation from '../founding-component/FoundingInformation'
import { PRIMARY_COLOR } from '../../utils/theme/theme'
import { formatNumber } from '../../utils/number-utils'
import { getExternalContractAddress } from '../../lib/external-contracts'

const { formatUnits } = utils

// This is extremely ugly, but I was not able to access the primary color
// using the colorScheme prop of the  Checkbox for some reason.
// We're ditching Chakra in the future so figure these are special
// circumstances we can do this.
const StyledCheckbox = styled(Checkbox)`
  && {
    .chakra-checkbox__control[data-checked] {
      background: ${PRIMARY_COLOR};
      border-color: ${PRIMARY_COLOR};
    }
  }
`

const Wrapper = styled.div`
  margin: ${spacingIncrement(1)};
`

type Props = {
  partnerTokenSymbol: PartnertshipTokensContracts
}

const PartnershipFounding: React.FC<Props> = ({ partnerTokenSymbol }) => {
  const {
    partnershipStore,
    acquisitionRoyalePartnershipContractStore,
    web3Store,
    partnershipTokenContractStore,
  } = useRootStore()
  const { partnerPrice } = acquisitionRoyalePartnershipContractStore
  const { symbolOverride, balanceOfSigner } = partnershipTokenContractStore
  const partnerTokenAddress = getExternalContractAddress(
    partnerTokenSymbol,
    web3Store.network.name
  ) as string
  const [partnerIdLoading] =
    acquisitionRoyalePartnershipContractStore.getPartnerId(partnerTokenAddress)
  const { formattedAuctionPrice } = acquisitionRoyalePartnershipContractStore
  const normalizedAmount = partnershipStore.amountToFound || 0

  const {
    network: {
      nativeCurrency: { decimals },
    },
  } = web3Store

  const needsMoreTokens = partnershipTokenContractStore.signerNeedsMoreTokens(
    partnerPrice?.mul(normalizedAmount)
  )

  const decimalBalance =
    balanceOfSigner &&
    decimals &&
    formatNumber(formatUnits(balanceOfSigner, decimals), { maximumFractionDigits: 4 })

  return (
    <Wrapper>
      <PartnershipInformation />
      <Box mt={6} mb={2} color="brand.yang">
        <FoundingNumberInput
          defaultValue={`${partnershipStore.defaultAmountToFound}`}
          max={partnershipStore.maxAmountToFound}
          onChange={(value: string): void => {
            partnershipStore.setAmountToFound(parseInt(value, 10))
          }}
        />
        <FoundingInformation
          formattedAuctionPrice={formattedAuctionPrice}
          auctionPriceLoading={partnerIdLoading}
          decimalBalance={decimalBalance}
          symbol={symbolOverride}
          balance={balanceOfSigner}
        />
      </Box>

      {web3Store.signerState.address && needsMoreTokens && symbolOverride ? (
        <PartnershipLowBalance symbol={symbolOverride} />
      ) : null}

      <Box my={2}>
        {web3Store.signerState.address && (
          <Center>
            <StyledCheckbox
              mb={2}
              textAlign="center"
              checked={partnershipStore.disclaimerChecked}
              onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                partnershipStore.setDisclaimerChecked(e.target.checked)
              }}
            >
              <Text
                fontFamily="Eurostile"
                textAlign="center"
                lineHeight="normal"
                mt="2px"
                color="brand.yang"
              >
                I have read and understand the game rules.
              </Text>
            </StyledCheckbox>
          </Center>
        )}
        <PartnershipFoundButton />
      </Box>
    </Wrapper>
  )
}

export default observer(PartnershipFounding)
