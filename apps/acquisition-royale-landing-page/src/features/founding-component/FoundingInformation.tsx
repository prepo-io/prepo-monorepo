import styled from 'styled-components'
import { BigNumber } from 'ethers'
import { observer } from 'mobx-react-lite'
import FoundingInformationSection from './FoundingInformationSection'
import { LETTER_SPACE_PIXEL, spacingIncrement } from '../../utils/theme/theme-utils'
import { useRootStore } from '../../context/RootStoreProvider'

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  letter-spacing: ${LETTER_SPACE_PIXEL};
  margin: ${spacingIncrement(1)};
`

type Props = {
  formattedAuctionPrice: string | undefined
  auctionPriceLoading: boolean
  decimalBalance: string | 0 | undefined
  symbol: string | undefined
  balance: BigNumber | undefined
}

const FoundingInformation: React.FC<Props> = ({
  formattedAuctionPrice,
  auctionPriceLoading,
  decimalBalance,
  symbol,
  balance,
}) => {
  const { web3Store } = useRootStore()
  const foundingCost = `${formattedAuctionPrice} ${symbol}`

  return (
    <Wrapper>
      <FoundingInformationSection
        align="left"
        title="Founding Cost"
        description={foundingCost}
        isLoaded={!auctionPriceLoading}
      />
      {web3Store.signerState.address && (
        <FoundingInformationSection
          align="right"
          title="Wallet Balance"
          description={`${decimalBalance} ${symbol}`}
          isLoaded={balance !== undefined}
        />
      )}
    </Wrapper>
  )
}

export default observer(FoundingInformation)
