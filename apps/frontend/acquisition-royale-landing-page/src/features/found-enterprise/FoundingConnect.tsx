import { Skeleton } from '@chakra-ui/react'
import { Box, Flex } from '@chakra-ui/layout'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import ProgressiveText from '../../components/ProgressiveText'
import { useRootStore } from '../../context/RootStoreProvider'
import { LETTER_SPACE_PIXEL, spacingIncrement } from '../../utils/theme/theme-utils'
import ConnectButton from '../connect/ConnectButton'

const Container = styled.div`
  margin: ${spacingIncrement(1)};
`

const SHOW_PERCENT_FOUNDED = false

const FoundingConnect: React.FC = () => {
  const {
    acquisitionRoyaleContractStore,
    web3Store: {
      network: {
        nativeCurrency: { symbol },
      },
    },
  } = useRootStore()
  const { percentageFounded, formattedAuctionPrice } = acquisitionRoyaleContractStore

  return (
    <>
      <Container>
        <Box
          fontFamily="Eurostile"
          fontSize="lg"
          color="brand.yang"
          textAlign="center"
          letterSpacing={LETTER_SPACE_PIXEL}
        >
          <Flex
            textAlign="center"
            alignItems="center"
            justifyContent="center"
            letterSpacing={LETTER_SPACE_PIXEL}
            whiteSpace="nowrap"
          >
            <span>Mint your Enterprise NFT for</span>&nbsp;&nbsp;
            <Skeleton isLoaded={formattedAuctionPrice !== undefined}>
              {formattedAuctionPrice || '12'}
            </Skeleton>
            &nbsp;&nbsp;
            <span>{symbol}</span>
          </Flex>
          <span>(while supplies last)</span>
        </Box>
      </Container>
      <Container>
        {SHOW_PERCENT_FOUNDED && (
          <ProgressiveText
            isLoaded={percentageFounded !== undefined}
            percentage={percentageFounded}
            textAlign="center"
            my={12}
          >
            Founded
          </ProgressiveText>
        )}
        <ConnectButton />
      </Container>
    </>
  )
}

export default observer(FoundingConnect)
