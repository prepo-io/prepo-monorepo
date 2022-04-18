import { configure } from 'mobx'
import { AppProps } from 'next/app'
import { RootStoreProvider } from '../context/RootStoreProvider'
import AppBootstrap from '../components/AppBootstrap'
import Layout from '../components/layout'

import 'antd/dist/antd.css'
import '../styles/default.css'

// mobx config
configure({
  enforceActions: 'observed',
  computedRequiresReaction: true,
  disableErrorBoundaries: false,
  // Disable these rules to prevent warnings logged due to mst-gql dependency
  reactionRequiresObservable: false,
  observableRequiresReaction: false,
})

const App = ({ Component, pageProps }: AppProps): React.ReactElement => (
  <RootStoreProvider>
    <AppBootstrap>
      <Layout>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Component {...pageProps} />
      </Layout>
    </AppBootstrap>
  </RootStoreProvider>
)

export default App
