import { Box, Text } from '@chakra-ui/layout'
import { format, subMilliseconds } from 'date-fns'
import { useEffect, useState } from 'react'
import { ONE_DAY } from '../lib/constants'
import { getDateNth } from '../utils/date-utils'

type Props = {
  timeStamp: Date
}

const FoundingTimerView: React.FC<Props> = ({ timeStamp }) => {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return (): void => {
      clearInterval(interval)
    }
  }, [])

  const dist = subMilliseconds(timeStamp, now)
  const isFutureTimeStamp = now < timeStamp.getTime()
  if (isFutureTimeStamp && dist.getTime() < ONE_DAY) {
    const hrs = dist.getUTCHours()
    const mins = dist.getUTCMinutes()

    if (hrs === 0 && mins === 0) {
      return (
        <Box>
          <Text as="span" color="brand.yang" fontSize="4xl" fontWeight="900">
            Standby...
          </Text>
        </Box>
      )
    }

    return (
      <Box>
        <Text as="span" color="brand.yang" fontSize="4xl" fontWeight="900">
          {hrs}
        </Text>
        <Text as="span" color="brand.yang" fontSize="2xl" fontWeight="900">
          {hrs === 1 ? 'hr' : 'hrs'}
        </Text>{' '}
        <Text as="span" color="brand.yang" fontSize="4xl" fontWeight="900">
          {mins}
        </Text>
        <Text as="span" color="brand.yang" fontSize="2xl" fontWeight="900">
          {mins === 1 ? 'min' : 'mins'}
        </Text>
      </Box>
    )
  }
  return (
    <Box>
      <Text as="span" color="brand.yang" fontSize="4xl" fontWeight="900">
        {format(timeStamp, 'MMM d')}
      </Text>
      <Text as="span" color="brand.yang" fontSize="2xl" fontWeight="900">
        {getDateNth(timeStamp.getDate())}
      </Text>
    </Box>
  )
}

export default FoundingTimerView
