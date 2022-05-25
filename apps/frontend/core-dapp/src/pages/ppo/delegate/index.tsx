import SEO from '../../../components/SEO'
import DelegatePage from '../../../features/delegate/DelegatePage'

const Delegate: React.FC = () => (
  <>
    <SEO
      title="Delegate | PPO | prePO"
      description="Delegate an address"
      ogImageUrl="/prepo-og-image.png"
    />
    <DelegatePage />
  </>
)

export default Delegate
