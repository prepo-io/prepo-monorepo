import SEO from '../../components/SEO'
import PpoHistoryPage from '../../features/ppo/history/PpoHistoryPage'

const History: React.FC = () => (
  <>
    <SEO title="History | PPO | prePO" description="History PPO" ogImageUrl="/prepo-og-image.png" />
    <PpoHistoryPage />
  </>
)

export default History
