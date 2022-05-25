import { configure } from 'mobx'
import { AppProps } from 'next/app'
import Script from 'next/script'

import { RootStoreProvider } from '../context/RootStoreProvider'
import AppBootstrap from '../components/AppBootstrap'
import Layout from '../components/layout/Layout'

import 'antd/dist/antd.css'
import 'react-loading-skeleton/dist/skeleton.css'
import { LightWeightChartProvider } from '../components/charts'
import '../styles/default.css'

// mobx config
configure({
  enforceActions: 'observed',
  computedRequiresReaction: true,
  reactionRequiresObservable: false,
  observableRequiresReaction: false,
  disableErrorBoundaries: false,
})

const App = ({ Component, pageProps }: AppProps): React.ReactElement => (
  <RootStoreProvider>
    <LightWeightChartProvider>
      <AppBootstrap>
        <Layout>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <Component {...pageProps} />
        </Layout>
      </AppBootstrap>
      <Script src="/scripts/userback.js" />
    </LightWeightChartProvider>
  </RootStoreProvider>
)

export default App
