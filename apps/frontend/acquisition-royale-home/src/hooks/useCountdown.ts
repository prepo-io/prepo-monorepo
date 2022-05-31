import { SEC_IN_MS } from '@prepo-io/constants'
import { useEffect, useState } from 'react'
import { useInterval } from 'react-use'
import { formatPeriod, FormatPeriodOptions } from '../utils/date-utils'

const useCountdown = (deadlineInMs: number, formatOptions?: FormatPeriodOptions): string => {
  const [period, setPeriod] = useState(formatPeriod(deadlineInMs, formatOptions))

  useInterval(() => {
    const newResetPeriod = formatPeriod(deadlineInMs, formatOptions)
    setPeriod(newResetPeriod)
  }, SEC_IN_MS)

  useEffect(() => {
    const latestPeriod = formatPeriod(deadlineInMs, formatOptions)
    if (latestPeriod !== period) setPeriod(latestPeriod)
  }, [deadlineInMs, formatOptions, period])

  return period
}

export default useCountdown
