import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { ThemeProvider } from 'styled-components'
import GlobalStyle, { AntdGlobalStyle } from './GlobalStyle'
import { useRootStore } from '../context/RootStoreProvider'
// import { SupportedThemes } from '../utils/theme/theme.types'

const AppBootstrap: React.FC = ({ children }) => {
  const { localStorageStore, uiStore } = useRootStore()

  useEffect(() => {
    localStorageStore.load()
  }, [localStorageStore])

  useEffect(() => {
    if (localStorageStore) {
      // const theme = (localStorageStore.getFromKey('selectedTheme') ?? 'light') as SupportedThemes
      uiStore.setTheme('dark')
    }
  }, [localStorageStore, uiStore, uiStore.selectedTheme])

  return (
    <ThemeProvider theme={uiStore.themeObject}>
      <GlobalStyle />
      <AntdGlobalStyle />
      {children}
    </ThemeProvider>
  )
}

export default observer(AppBootstrap)
