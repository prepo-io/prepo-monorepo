import { Box } from '@chakra-ui/layout'
import { Skeleton } from '@chakra-ui/react'
import { observer } from 'mobx-react-lite'
import { SpanText } from '../../components/Text'
import { useRootStore } from '../../context/RootStoreProvider'
import { formatNumber } from '../../utils/number-utils'
import { LETTER_SPACE_PIXEL } from '../../utils/theme/theme-utils'

const PartnershipTotalAmount: React.FC = () => {
  const { acquisitionRoyalePartnershipContractStore } = useRootStore()
  const { remainingNFTs } = acquisitionRoyalePartnershipContractStore

  const loading = remainingNFTs === undefined

  return (
    <Box
      fontFamily="Eurostile"
      fontSize="md"
      color="brand.yang"
      textAlign="center"
      justifyContent="center"
      alignItems="center"
      letterSpacing={LETTER_SPACE_PIXEL}
    >
      There are
      {loading ? (
        <Skeleton isLoaded={!loading} display="inline-block" width="3rem" height="20px" mx={1} />
      ) : (
        <SpanText fontSize="md" display="inline-block">
          &nbsp;{formatNumber(remainingNFTs)}&nbsp;
        </SpanText>
      )}
      rare collaboration NFTs remaining.
    </Box>
  )
}

export default observer(PartnershipTotalAmount)
