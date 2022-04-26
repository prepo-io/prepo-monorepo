import SEO from '../components/SEO'
import GamePage from '../features/mvp/GamePage'

const Index: React.FC = () => (
  <div>
    <SEO
      ogImageUrl="https://acquisitionroyale.com/preview-card.png"
      url="https://acquisitionroyale.com/"
      twitterUsername="AcqRoyale"
    />
    <GamePage />
  </div>
)

export default Index
