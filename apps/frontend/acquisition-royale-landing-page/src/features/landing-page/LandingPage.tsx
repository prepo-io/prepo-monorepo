import { useEffect } from 'react'
import FoundingSection from './sections/FoundingSection'
import IntroSection from './sections/IntroSection'
import { useRootStore } from '../../context/RootStoreProvider'
import SocialLinks from '../../components/SocialLinks'

const LandingPage: React.FC = () => {
  const { uiStore } = useRootStore()

  useEffect(() => {
    uiStore.setShowAnnouncementBanner(true)
  }, [uiStore])

  return (
    <>
      <IntroSection />
      <FoundingSection />
      <SocialLinks />
    </>
  )
}

export default LandingPage
