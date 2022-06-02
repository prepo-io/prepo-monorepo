// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const makeError = (error: any, log = true): Error => {
  const errorMessage =
    typeof error === 'string'
      ? error
      : error.data?.message ?? error.reason ?? error.message ?? JSON.stringify(error)
  // eslint-disable-next-line no-console
  if (log) console.error(errorMessage, error)
  return new Error(errorMessage)
}
