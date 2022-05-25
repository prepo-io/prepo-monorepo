import { GetStaticPaths, GetStaticProps } from 'next'
import TradePage from '../../../features/trade/TradePage'
import { Market, SupportedMarketID } from '../../../types/market.types'
import { getValuationRangeString } from '../../../features/market-overview/market-utils'
import SEO from '../../../components/SEO'
import { markets, marketsMap } from '../../../lib/markets'

type Props = {
  selectedMarket: Market
}

const TradeMarketPage: React.FC<Props> = ({ selectedMarket }) => (
  <>
    <SEO
      title={`Trade ${selectedMarket.name} | prePO`}
      description={`${selectedMarket.companyName} with valuation range: ${getValuationRangeString(
        selectedMarket.static.valuationRange
      )}`}
      ogImageUrl="/prepo-og-image.png"
    />
    <TradePage staticSelectedMarket={selectedMarket} markets={markets} />
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

  // Pass post data to the page via props
  return { props: { selectedMarket } }
}

export default TradeMarketPage
