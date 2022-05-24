import { SEC_IN_MS } from '@prepo-io/constants'
import { useCallback, useEffect, useState } from 'react'
import { useInterval } from 'react-use'
import { formatPeriod, FormatPeriodOptions } from '../utils/date-utils'

const useCountdown = (deadlineInMs: number, formatOptions?: FormatPeriodOptions): string => {
  const [period, setPeriod] = useState(formatPeriod(deadlineInMs, formatOptions))
  const handleResetPeriod = useCallback(() => {
    const newResetPeriod = formatPeriod(deadlineInMs, formatOptions)
    setPeriod(newResetPeriod)
  }, [deadlineInMs, formatOptions])

  useEffect(() => {
    setPeriod(formatPeriod(deadlineInMs, formatOptions))
  }, [deadlineInMs, formatOptions])

  useInterval(handleResetPeriod, SEC_IN_MS)

  return period
}

export default useCountdown
