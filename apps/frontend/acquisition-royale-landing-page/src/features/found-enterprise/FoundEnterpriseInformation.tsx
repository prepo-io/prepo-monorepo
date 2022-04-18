import Reward from 'react-rewards'
import { Flex } from '@chakra-ui/layout'
import { Skeleton } from '@chakra-ui/react'
import { observer } from 'mobx-react-lite'
import { SpanText } from '../../components/Text'
import { useRootStore } from '../../context/RootStoreProvider'
import { formatNumber } from '../../utils/number-utils'
import { LETTER_SPACE_PIXEL } from '../../utils/theme/theme-utils'
import { rewardConfig } from '../founding-component/founding-constants'

const FoundEnterpriseInformation: React.FC = () => {
  const { acquisitionRoyaleContractStore, uiStore } = useRootStore()
  const { foundedEnterprises } = acquisitionRoyaleContractStore

  return (
    <>
      {foundedEnterprises !== undefined && (
        <Flex
          fontFamily="Eurostile"
          fontSize="lg"
          color="brand.yang"
          textAlign="center"
          justifyContent="center"
          alignItems="center"
          letterSpacing={LETTER_SPACE_PIXEL}
        >
          You have founded
          <Reward
            type="emoji"
            ref={(ref): void => {
              if (ref === null) return
              uiStore.setRewardRef('foundedEnterprise', ref)
            }}
            config={rewardConfig}
          >
            <Skeleton isLoaded={foundedEnterprises !== undefined} display="inline-block">
              <SpanText fontSize="md">&nbsp;{formatNumber(foundedEnterprises)}&nbsp;</SpanText>
            </Skeleton>
          </Reward>
          {foundedEnterprises !== 1 ? 'Enterprises so far.' : 'Enterprise so far.'}
        </Flex>
      )}
    </>
  )
}

export default observer(FoundEnterpriseInformation)
