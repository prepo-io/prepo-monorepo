import { GetStaticPaths, GetStaticProps } from 'next'
import { Market, SupportedMarketID } from '../../../types/market.types'
import LiquidityPage from '../../../features/liquidity/LiquidityPage'
import SEO from '../../../components/SEO'
import { getValuationRangeString } from '../../../features/market-overview/market-utils'
import { markets, marketsMap } from '../../../lib/markets'

type Props = {
  selectedMarket: Market
}

const Liquidity: React.FC<Props> = ({ selectedMarket }) => (
  <>
    <SEO
      title={`Add Liquidity to ${selectedMarket.name} | prePO`}
      description={`${selectedMarket.companyName} with valuation range: ${getValuationRangeString(
        selectedMarket.static.valuationRange
      )}`}
      ogImageUrl="/prepo-og-image.png"
    />
    <LiquidityPage staticSelectedMarket={selectedMarket} />
  </>
)

export const getStaticPaths: GetStaticPaths = () => {
  // Get the paths we want to pre-render based on posts
  const paths = markets.map((market) => ({
    params: { marketUrlId: market.urlId },
  }))

  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps<Partial<Props>, { marketUrlId: string }> = ({
  params,
}) => {
  // this should never happens
  if (!params) return { props: {} }

  // Fetch single market
  const selectedMarket = marketsMap[params.marketUrlId.toLowerCase() as SupportedMarketID]
  return { props: { selectedMarket } }
}

export default Liquidity
