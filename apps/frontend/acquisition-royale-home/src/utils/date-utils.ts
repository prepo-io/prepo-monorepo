import { DAY_IN_SEC, SEC_IN_MS } from '../lib/constants'

export type FormatPeriodOptions = {
  withSec?: boolean
}

export const formatPeriod = (timestamp: number, options?: FormatPeriodOptions): string => {
  const curTimestamp = new Date().getTime()

  const timeDiff = (timestamp - curTimestamp) / SEC_IN_MS

  const daysLeft = Math.floor(timeDiff / 60 / 60 / 24)
  const hoursLeft = Math.floor(timeDiff / 60 / 60) - daysLeft * 24
  const minsLeft = Math.floor(timeDiff / 60) - daysLeft * 24 * 60 - hoursLeft * 60
  const parts = []
  if (daysLeft > 0) {
    parts.push(`${daysLeft}d`)
  }
  if (parts.length > 0 || hoursLeft > 0) {
    parts.push(`${hoursLeft}h`)
  }
  if (parts.length > 0 || minsLeft > 0) {
    parts.push(`${minsLeft}m`)
  }
  if (options?.withSec) {
    const secsLeft = Math.floor(timeDiff % 60)
    parts.push(`${secsLeft}s`)
  }
  return parts.join(' ')
}

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleString().slice(0, -3)
}

export const getNextStartDayTimestamp = (): number => {
  const now = Math.floor(new Date().getTime() / SEC_IN_MS)
  const newDay = now + DAY_IN_SEC
  return newDay - (newDay % DAY_IN_SEC)
}
