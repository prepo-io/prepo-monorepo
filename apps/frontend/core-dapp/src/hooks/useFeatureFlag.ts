import { useCallback, useEffect, useState } from 'react'

export enum FeatureFlag {
  enableCoreDapp = 'enableCoreDapp',
}

type UseFeatureFlag = {
  enabled: boolean | undefined
  loading: boolean
  error: boolean
}

const fetchFunction = async (featureName: FeatureFlag, userAddress?: string): Promise<boolean> => {
  const body = {
    featureName,
    userAddress,
  }

  const result = await fetch('/api/application', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  return result.json()
}

const useFeatureFlag = (
  featureFlagName: FeatureFlag,
  userAddress?: string | undefined
): UseFeatureFlag => {
  const [enabled, setEnabled] = useState<boolean | undefined>(undefined)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  const fetchData = useCallback(async (): Promise<void> => {
    try {
      const body = {
        featureName: featureFlagName,
        userAddress,
      }

      const result = await fetch('/api/application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const isEnabled = await result.json()

      setEnabled(isEnabled)
    } catch (e) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [userAddress, featureFlagName])

  useEffect(() => {
    setError(false)
    setLoading(true)
    let isActive = true

    fetchFunction(featureFlagName, userAddress)
      .then((result) => {
        if (isActive) setEnabled(result)
      })
      .catch(() => {
        if (isActive) setError(true)
      })
      .finally(() => {
        if (isActive) setLoading(false)
      })
    return (): void => {
      isActive = false
    }
  }, [featureFlagName, fetchData, userAddress])

  return { enabled, loading, error }
}

export default useFeatureFlag
