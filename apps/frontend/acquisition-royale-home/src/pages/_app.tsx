import { configure } from 'mobx'
import { AppProps } from 'next/app'
import { usePanelbear } from '@panelbear/panelbear-nextjs'
import Script from 'next/script'
import { RootStoreProvider } from '../context/RootStoreProvider'
import AppBootstrap from '../components/AppBootstrap'
import Layout from '../components/layout'

import '../styles/default.css'
import 'antd/dist/antd.css'
import { PANELBEAR_SITE_ID } from '../lib/constants'

// mobx config
configure({
  enforceActions: 'observed',
  computedRequiresReaction: true,
  reactionRequiresObservable: true,
  observableRequiresReaction: true,
  disableErrorBoundaries: false,
})

const App = ({ Component, pageProps }: AppProps): React.ReactElement => {
  usePanelbear(PANELBEAR_SITE_ID)
  return (
    <RootStoreProvider>
      <AppBootstrap>
        <Layout>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <Component {...pageProps} />
        </Layout>
      </AppBootstrap>
      <Script src="/scripts/userback.js" />
    </RootStoreProvider>
  )
}

export default App
