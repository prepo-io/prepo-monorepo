import { SEC_IN_MS } from '@prepo-io/constants'
import { useCallback, useState } from 'react'
import { useInterval } from 'react-use'
import { formatPeriod, FormatPeriodOptions } from '../utils/date-utils'

const useCountdown = (deadlineInMs: number, formatOptions?: FormatPeriodOptions): string => {
  const [period, setPeriod] = useState('')
  const handleResetPeriod = useCallback(() => {
    const newResetPeriod = formatPeriod(deadlineInMs, formatOptions)
    setPeriod(newResetPeriod)
  }, [deadlineInMs, formatOptions])

  useInterval(handleResetPeriod, SEC_IN_MS)
  return period
}

export default useCountdown
