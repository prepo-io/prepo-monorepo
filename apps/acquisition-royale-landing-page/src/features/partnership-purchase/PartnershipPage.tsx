import { Text } from '@chakra-ui/react'
import { Box } from '@chakra-ui/layout'
import styled from 'styled-components'
import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import PartnershipFounding from './PartnershipFounding'
import { PartnertshipTokensContracts } from './partnertship-contracts'
import { BORDER_WIDTH_PIXEL, centered, spacingIncrement } from '../../utils/theme/theme-utils'
import { useRootStore } from '../../context/RootStoreProvider'
import { NETWORKS, SupportedNetworks } from '../../lib/constants'
import { getExternalContractAddress } from '../../lib/external-contracts'
import ResponsiveImage from '../../components/ResponsiveImage'

const Wrapper = styled.div`
  ${centered};
  height: 90vh;
  margin: 0 auto;
  min-height: 950px;
  width: 100%;
`

const Container = styled.div`
  margin: ${spacingIncrement(1)};
`

type Props = {
  imageUrl: string
  description: string | React.ReactElement
  network: SupportedNetworks
  partnerTokenSymbol: PartnertshipTokensContracts
  partnershipBuyTokenUrl: string
}

const PartnershipPage: React.FC<Props> = ({
  imageUrl,
  description,
  network,
  partnerTokenSymbol,
  partnershipBuyTokenUrl,
}) => {
  const {
    web3Store,
    acquisitionRoyalePartnershipContractStore,
    partnershipTokenContractStore,
    partnershipStore,
    uiStore,
  } = useRootStore()
  const { partnerTokenAddress } = acquisitionRoyalePartnershipContractStore
  const partnerAddress = getExternalContractAddress(partnerTokenSymbol, web3Store.network.name)

  useEffect(() => {
    web3Store.setNetwork(NETWORKS[network])
  }, [web3Store, network])

  useEffect(() => {
    partnershipTokenContractStore.initContract(partnerTokenSymbol, partnerTokenSymbol)
  }, [partnershipTokenContractStore, partnerTokenSymbol])

  useEffect(() => {
    if (partnerAddress) {
      acquisitionRoyalePartnershipContractStore.setPartnerTokenAddress(partnerAddress)
      acquisitionRoyalePartnershipContractStore.getPartnerId(partnerAddress)
    }
  }, [acquisitionRoyalePartnershipContractStore, partnerAddress, partnerTokenAddress])

  useEffect(() => {
    partnershipStore.setPartnershipBuyTokenUrl(partnershipBuyTokenUrl)
  }, [partnershipStore, partnershipBuyTokenUrl])

  useEffect(() => {
    uiStore.setShowHeaderHomeButton(true)
    uiStore.setHeaderText('Acquisition Royale')
  }, [uiStore])

  return (
    <Wrapper>
      <Box
        width={{ base: '18.8rem', md: '20.8rem', lg: '28rem' }}
        borderColor="brand.primary"
        borderWidth={BORDER_WIDTH_PIXEL}
      >
        <ResponsiveImage alt="PrePO Partnership" src={imageUrl} />
        <Container>
          <Text color="brand.yang" fontFamily="Eurostile" fontSize="md" textAlign="center">
            {description}
          </Text>
        </Container>
        <Box height={BORDER_WIDTH_PIXEL} mx={2} my={1.5} bg="brand.primary" />
        <Box height={BORDER_WIDTH_PIXEL} mx={4} my={1.5} bg="brand.primary" />
        <PartnershipFounding partnerTokenSymbol={partnerTokenSymbol} />
      </Box>
    </Wrapper>
  )
}

export default observer(PartnershipPage)
