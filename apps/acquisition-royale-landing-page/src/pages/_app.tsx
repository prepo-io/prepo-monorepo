import { ChakraProvider } from '@chakra-ui/react'
import { AppProps } from 'next/app'
import { usePanelbear } from '@panelbear/panelbear-nextjs'
import theme from '../utils/theme/theme'
import { RootStoreProvider } from '../context/RootStoreProvider'
import AppBootstrap from '../components/AppBootstrap'
import 'antd/dist/antd.css'

const App = ({ Component, pageProps }: AppProps): React.ReactElement => {
  usePanelbear('AgLMulf92an')
  return (
    <RootStoreProvider>
      <ChakraProvider theme={theme}>
        <AppBootstrap>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <Component {...pageProps} />
        </AppBootstrap>
      </ChakraProvider>
    </RootStoreProvider>
  )
}

export default App
