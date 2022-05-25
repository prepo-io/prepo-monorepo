import { NextPage } from 'next'
import SEO from '../components/SEO'
import ExploreMarkets from '../features/explore-markets/ExploreMarkets'

const Markets: NextPage = () => (
  <>
    <SEO
      title="Core dApp | prePO"
      description="The decentralized Pre-IPO & Pre-Token trading platform"
      ogImageUrl="/prepo-og-image.png"
    />
    <ExploreMarkets />
  </>
)

export default Markets
