import SEO from '../components/SEO'
import LandingPage from '../features/landing-page/LandingPage'

const Index: React.FC = () => (
  <div>
    <SEO
      title="Acquisition Royale by prePO"
      description="Found an enterprise and become an empire in a battle-royale game for runway, wealth, and domination."
      ogImageUrl="https://acquisitionroyale.com/preview-card.png"
      url="https://acquisitionroyale.com/"
      twitterUsername="AcqRoyale"
    />
    <LandingPage />
  </div>
)

export default Index
