import { Box, Heading } from '@chakra-ui/layout'
import { Skeleton } from '@chakra-ui/react'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import FoundingTimerView from '../../components/FoundingTimerView'
import Text from '../../components/Text'
import { useRootStore } from '../../context/RootStoreProvider'
import useFeatureFlag from '../../hooks/useFeatureFlag'
import { FoundingStatus } from '../../stores/AcquisitionRoyaleContractStore'
import { FeatureFlag } from '../../utils/feature-flags'

type Metadata = {
  title: string
  timeStamp: Date | undefined
  showTimer: boolean
  loaded: boolean
}

const getMetadata = (
  foundingStartTime: Date | undefined,
  foundingEndTime: Date | undefined,
  foundingStatus: FoundingStatus | undefined,
  gameStartTime: Date | undefined,
  gameStarted: boolean | undefined
): Metadata => {
  const loading =
    foundingStartTime === undefined ||
    foundingEndTime === undefined ||
    foundingStatus === undefined ||
    gameStarted === undefined ||
    gameStartTime === undefined

  // Handle loading
  if (loading) {
    return {
      title: '',
      timeStamp: undefined,
      showTimer: false,
      loaded: false,
    }
  }

  // Handle game countdown
  if (gameStarted === false) {
    return {
      timeStamp: gameStartTime,
      title: 'The Game Begins',
      showTimer: true,
      loaded: true,
    }
  }

  // Handle game started
  const timeStamp = foundingStatus === 'upcoming' ? foundingStartTime : foundingEndTime
  const title = 'Found your Enterprise'

  return {
    title,
    timeStamp,
    showTimer: false,
    loaded: true,
  }
}

const FoundingHeader: React.FC = () => {
  const { acquisitionRoyaleContractStore } = useRootStore()
  const { enabled: foundingPaused, loading } = useFeatureFlag(FeatureFlag.pauseEnterpriseFounding)
  const { foundingStartTime, foundingEndTime, foundingStatus, gameStartTime, gameStarted } =
    acquisitionRoyaleContractStore

  const metadata = useMemo(
    () =>
      getMetadata(foundingStartTime, foundingEndTime, foundingStatus, gameStartTime, gameStarted),
    [foundingStartTime, foundingEndTime, foundingStatus, gameStartTime, gameStarted]
  )

  const { showTimer, loaded } = metadata
  let { title, timeStamp } = metadata
  if (foundingPaused) {
    title = 'Founding Paused'
    timeStamp = undefined
  }

  // Wrapping the default return value with Skeleton doesn't work for some reason
  if (!loaded || loading)
    return (
      <>
        <Skeleton mb="5" height="1rem" width="10rem" />
        <Skeleton mb="3" height="2rem" width="16rem" />
      </>
    )

  const largeTitle = foundingPaused || foundingStatus === 'ongoing'

  return (
    <Heading as="h3" display="flex" flexDirection="column" padding="0 4rem">
      <Text
        color="brand.primary"
        fontFamily="Eurostile"
        fontSize={largeTitle ? { base: '2xl', lg: '4xl' } : 'md'}
        fontWeight="bold"
        casing="uppercase"
        as="span"
        textAlign="center"
        pb={2}
      >
        {title}
      </Text>
      {showTimer && (
        <Box mb={{ base: 0, lg: 2 }} as="span" textAlign="center">
          {timeStamp && <FoundingTimerView timeStamp={timeStamp} />}
        </Box>
      )}
    </Heading>
  )
}

export default observer(FoundingHeader)
