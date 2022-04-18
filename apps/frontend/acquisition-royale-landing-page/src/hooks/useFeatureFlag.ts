// import { useInterval } from 'react-use'
import { useCallback, useEffect, useState } from 'react'
import { getFeature } from '../utils/services/configCat'

type UseFeatureFlag = {
  enabled: boolean
  loading: boolean
  error: boolean
}

// const ONE_SECOND = 1000
// const POLLING_INTERVAL = ONE_SECOND * 5

const useFeatureFlag = (featureFlagName: string): UseFeatureFlag => {
  const [enabled, setEnabled] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  const fetchData = useCallback(async (): Promise<void> => {
    setError(false)
    setLoading(true)

    try {
      const user = {
        identifier: '', // Temp way to select the whitelist wallet
      }
      const result = await getFeature(featureFlagName, user)
      setEnabled(result)
    } catch (e) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [featureFlagName])

  useEffect(() => {
    fetchData()
  }, [fetchData, featureFlagName])

  // Remove fetching interval, it's not working properly atm
  // useInterval(async () => {
  //   fetchData()
  // }, POLLING_INTERVAL)

  return { enabled, loading, error }
}

export default useFeatureFlag
