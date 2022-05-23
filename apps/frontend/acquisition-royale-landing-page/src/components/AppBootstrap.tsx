import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { Global } from '@emotion/react'
import Layout from './Layout'
import { useRootStore } from '../context/RootStoreProvider'

const Fonts: React.FC = () => (
  <Global
    styles={`
      @font-face {
        font-family: 'Geometos Neue';
        src: local('Geometos Neue'), url('/fonts/GeometosNeue/GeometosNeue.ttf');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Geometos Neue';
        src: local('Geometos Neue'), url('/fonts/GeometosNeue/GeometosNeueBold.ttf');
        font-weight: bold;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Geometos Neue';
        src: local('Geometos Neue'), url('/fonts/GeometosNeue/GeometosNeueBlack.ttf');
        font-weight: 900;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Eurostile';
        src: url('/fonts/Eurostile/EuroStyleNormal.ttf');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Eurostile';
        src: url('/fonts/Eurostile/EurostileBold.ttf');
        font-weight: bold;
        font-style: normal;
        font-display: swap;
      }
      `}
  />
)

const AppBootstrap: React.FC = ({ children }) => {
  const { localStorageStore } = useRootStore()

  useEffect(() => {
    localStorageStore.load()
  }, [localStorageStore])

  return (
    <Layout>
      <Fonts />
      {children}
    </Layout>
  )
}

export default observer(AppBootstrap)
