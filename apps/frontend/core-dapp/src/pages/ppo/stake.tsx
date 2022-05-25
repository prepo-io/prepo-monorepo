import SEO from '../../components/SEO'
import StakePage from '../../features/ppo/stake/StakePage'

const Stake: React.FC = () => (
  <>
    <SEO title="Stake | PPO | prePO" description="Stake PPO" ogImageUrl="/prepo-og-image.png" />
    <StakePage />
  </>
)

export default Stake
