import Reward from 'react-rewards'
import { Skeleton } from '@chakra-ui/react'
import { Box } from '@chakra-ui/layout'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import PartnershipTotalAmount from './PartnershipTotalAmount'
import { LETTER_SPACE_PIXEL, spacingIncrement } from '../../utils/theme/theme-utils'
import { useRootStore } from '../../context/RootStoreProvider'
import { formatNumber } from '../../utils/number-utils'
import { SpanText } from '../../components/Text'
import { rewardConfig } from '../founding-component/founding-constants'

const InformationWrapper = styled.div`
  margin-top: ${spacingIncrement(2)};
`

const PartnershipInformation: React.FC = () => {
  const { uiStore, acquisitionRoyalePartnershipContractStore } = useRootStore()
  const { signerNftBalance } = acquisitionRoyalePartnershipContractStore

  return (
    <InformationWrapper>
      <PartnershipTotalAmount />
      {signerNftBalance !== undefined && (
        <Reward
          type="emoji"
          ref={(ref): void => {
            if (ref === null) return
            uiStore.setRewardRef('foundedPartnership', ref)
          }}
          config={rewardConfig}
        >
          <Box
            fontFamily="Eurostile"
            fontSize="md"
            color="brand.yang"
            textAlign="center"
            justifyContent="center"
            alignItems="center"
            letterSpacing={LETTER_SPACE_PIXEL}
          >
            You have founded
            <Skeleton isLoaded={signerNftBalance !== undefined} display="inline-block">
              <SpanText display="inline-block" fontSize="md">
                &nbsp;{formatNumber(signerNftBalance)}&nbsp;
              </SpanText>
            </Skeleton>
            {signerNftBalance !== 1 ? 'rare collaboration NFTs.' : 'rare collaboration NFT.'}
          </Box>
        </Reward>
      )}
    </InformationWrapper>
  )
}

export default observer(PartnershipInformation)
