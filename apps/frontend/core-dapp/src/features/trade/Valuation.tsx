import { useEffect, useState } from 'react'
import { useRootStore } from '../../context/RootStoreProvider'
import useSelectedMarket from '../../hooks/useSelectedMarket'
import { numberFormatter } from '../../utils/numberFormatter'

const { significantDigits } = numberFormatter

const Valuation: React.FC = () => {
  const { tradeStore } = useRootStore()
  const selectedMarket = useSelectedMarket()

  const [value, setValue] = useState<string | undefined>()
  useEffect(() => {
    if (!selectedMarket) {
      return
    }
    tradeStore.valuation(selectedMarket).then((valuation) => {
      if (valuation) setValue(significantDigits(valuation))
    })
  }, [selectedMarket, tradeStore])

  return <>{value}</>
}

export default Valuation
