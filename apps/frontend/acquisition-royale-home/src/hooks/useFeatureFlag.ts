import { useInterval } from 'react-use'
import { useCallback, useEffect, useState } from 'react'
import { getFeature } from '../utils/services/configCat'
import { SEC_IN_MS } from '../lib/constants'

type UseFeatureFlag = {
  enabled: boolean | undefined
  loading: boolean
  error: boolean
}

const POLLING_INTERVAL = SEC_IN_MS * 5

const useFeatureFlag = (featureFlagName: string, address: string | undefined): UseFeatureFlag => {
  const [enabled, setEnabled] = useState<boolean | undefined>(undefined)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  const fetchData = useCallback(async (): Promise<void> => {
    setError(false)
    setLoading(true)

    try {
      const user = {
        identifier: address,
      }
      const result = await getFeature(featureFlagName, user)
      setEnabled(result)
    } catch (e) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [address, featureFlagName])

  useEffect(() => {
    fetchData()
  }, [fetchData, featureFlagName])

  useInterval(() => {
    fetchData()
  }, POLLING_INTERVAL)

  return { enabled, loading, error }
}

export default useFeatureFlag
