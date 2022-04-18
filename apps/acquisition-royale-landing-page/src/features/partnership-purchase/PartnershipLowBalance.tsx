import { Box } from '@chakra-ui/layout'
import { observer } from 'mobx-react-lite'
import { SpanText } from '../../components/Text'
import { useRootStore } from '../../context/RootStoreProvider'
import { LETTER_SPACE_PIXEL } from '../../utils/theme/theme-utils'

const PartnershipLowBalance: React.FC<{
  symbol: string
}> = ({ symbol }) => {
  const { partnershipStore } = useRootStore()

  return (
    <Box
      fontFamily="Eurostile"
      fontSize="lg"
      color="brand.yang"
      textAlign="center"
      letterSpacing={LETTER_SPACE_PIXEL}
      mb={6}
    >
      {`Running low on ${symbol}?`}
      <br />
      Buy some{' '}
      <SpanText>
        <a href={partnershipStore.partnershipBuyTokenUrl} target="_blank" rel="noreferrer">
          on Uniswap
        </a>
      </SpanText>
      .
    </Box>
  )
}

export default observer(PartnershipLowBalance)
