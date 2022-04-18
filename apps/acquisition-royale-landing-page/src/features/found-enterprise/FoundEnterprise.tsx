import { Box } from '@chakra-ui/layout'
import { Checkbox, Center } from '@chakra-ui/react'
import { observer } from 'mobx-react-lite'
import { ChangeEvent, useState } from 'react'
import styled from 'styled-components'
import { BigNumber, BigNumberish, utils } from 'ethers'
import FoundEnterpriseInformation from './FoundEnterpriseInformation'
import FoundEnterpriseButton from './FoundEnterpriseButton'
import { LowMaticBalance } from './LowMaticBalance'
import FoundingNumberInput from '../../components/FoundingNumberInput'
import Text from '../../components/Text'
import { useRootStore } from '../../context/RootStoreProvider'
import { spacingIncrement } from '../../utils/theme/theme-utils'
import { formatNumber } from '../../utils/number-utils'
import { PRIMARY_COLOR } from '../../utils/theme/theme'
import FoundingInformation from '../founding-component/FoundingInformation'
import LowBalance from '../founding-component/LowBalance'

const { formatUnits } = utils

const DEFAULT_FOUND_ENTERPRISES = 10
const MAX_FOUND_ENTERPRISES = 50

const Wrapper = styled.div`
  margin: ${spacingIncrement(1)};
`

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

const getFoundPrice = (amountEnterprises: BigNumberish, auctionPrice: BigNumber): BigNumber =>
  auctionPrice.mul(amountEnterprises)

const FoundEnterprise: React.FC = () => {
  const [selectedAmountEnterprises, setSelectedAmountEnterprises] =
    useState<number>(DEFAULT_FOUND_ENTERPRISES)
  const [disclaimerChecked, setDisclaimerChecked] = useState<boolean>(false)
  const { acquisitionRoyaleContractStore, web3Store } = useRootStore()
  const { formattedAuctionPrice } = acquisitionRoyaleContractStore
  const [auctionPriceLoading, auctionPrice] = acquisitionRoyaleContractStore.getAuctionPrice()
  const {
    lowBalance: lowMaticBalance,
    network: {
      nativeCurrency: { symbol, decimals },
    },
    signerState,
  } = web3Store
  const { balance } = signerState

  const totalFoundPrice =
    auctionPrice && !Number.isNaN(selectedAmountEnterprises)
      ? getFoundPrice(selectedAmountEnterprises, auctionPrice)
      : undefined

  const hasEnoughBalance = Boolean(balance && totalFoundPrice && balance.gte(totalFoundPrice))

  const decimalBalance =
    balance &&
    decimals &&
    formatNumber(formatUnits(balance, decimals), { maximumFractionDigits: 4 })

  return (
    <Wrapper>
      <FoundEnterpriseInformation />
      <Box mt={6} mb={2} color="brand.yang">
        <FoundingNumberInput
          defaultValue={`${DEFAULT_FOUND_ENTERPRISES}`}
          max={MAX_FOUND_ENTERPRISES}
          onChange={(value: string): void => {
            setSelectedAmountEnterprises(parseInt(value, 10))
          }}
        />
        <FoundingInformation
          formattedAuctionPrice={formattedAuctionPrice}
          auctionPriceLoading={auctionPriceLoading}
          decimalBalance={decimalBalance}
          symbol={symbol}
          balance={balance}
        />
      </Box>

      {!hasEnoughBalance && symbol ? <LowBalance symbol={symbol} /> : null}
      {hasEnoughBalance && lowMaticBalance ? <LowMaticBalance /> : null}
      <Box my={2}>
        <Center>
          <StyledCheckbox
            mb={2}
            textAlign="center"
            checked={disclaimerChecked}
            onChange={(e: ChangeEvent<HTMLInputElement>): void => {
              setDisclaimerChecked(e.target.checked)
            }}
          >
            <Text
              fontFamily="Eurostile"
              fontSize="lg"
              textAlign="center"
              lineHeight="normal"
              mt="2px"
            >
              I have read and understand the game rules.
            </Text>
          </StyledCheckbox>
        </Center>
        <FoundEnterpriseButton
          foundPrice={totalFoundPrice}
          decimals={decimals}
          hasEnoughBalance={hasEnoughBalance}
          selectedAmountEnterprises={selectedAmountEnterprises}
          disclaimerChecked={disclaimerChecked}
        />
        <Text fontFamily="Eurostile" textAlign="center" opacity={0.5} mt={3}>
          5% of proceeds go toward effective charities{' '}
          <span role="img" aria-label="heart">
            💛
          </span>
        </Text>
      </Box>
    </Wrapper>
  )
}

export default observer(FoundEnterprise)
