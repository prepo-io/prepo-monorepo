type GetDateDiffInObjectType = (dateInMillisec: number) => {
  days: number
  hours: number
  minutes: number
  seconds: number
  hasTimePast: boolean
}

export const getDateDiffInObject: GetDateDiffInObjectType = (dateInMillisec) => {
  const hasTimePast = dateInMillisec > 0
  const millisec = Math.abs(dateInMillisec)
  const seconds = parseInt((millisec / 1000).toFixed(0), 10)
  const minutes = parseInt((millisec / (1000 * 60)).toFixed(0), 10)
  const hours = parseInt((millisec / (1000 * 60 * 60)).toFixed(0), 10)
  const days = parseInt((millisec / (1000 * 60 * 60 * 24)).toFixed(0), 10)
  if (seconds < 60) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds,
      hasTimePast,
    }
  }
  if (minutes < 60) {
    return {
      days: 0,
      hours: 0,
      minutes,
      seconds: seconds % 60,
      hasTimePast,
    }
  }
  if (hours < 24) {
    return {
      days: 0,
      hours,
      minutes: minutes % 60,
      seconds: seconds % 60,
      hasTimePast,
    }
  }
  return {
    days,
    hours: hours % 24,
    minutes: minutes % 60,
    seconds: seconds % 60,
    hasTimePast,
  }
}

export const getDateNth = (day: number): string => {
  if (day > 3 && day < 21) return 'th'
  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}
