import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
import { useRootStore } from '../context/RootStoreProvider'
import { SectionsEnum } from '../features/landing-page/sections/SectionStore'

type UseSectionType = (key: SectionsEnum) => {
  ref: (node?: Element | null | undefined) => void
}

const useSection: UseSectionType = (key) => {
  const { ref, inView } = useInView({ threshold: 0 })
  const {
    sectionStore: { setSectionActive },
  } = useRootStore()

  useEffect(() => {
    setSectionActive(key, inView)
  }, [inView, key, setSectionActive])

  return { ref }
}

export default useSection
