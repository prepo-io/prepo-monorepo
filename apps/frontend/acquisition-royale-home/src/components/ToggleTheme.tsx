import { Button } from 'antd'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { useRootStore } from '../context/RootStoreProvider'
import { spacingIncrement } from '../utils/theme/utils'

const Wrapper = styled(Button)`
  margin-left: ${spacingIncrement(32)};
`

// In the future if we have light version of the theme, we can update it here. We only have dark theme for now.
const ToggleTheme: React.FC = () => {
  const { uiStore } = useRootStore()
  // const newTheme = uiStore.selectedTheme === 'light' ? 'dark' : 'light'
  return (
    <Wrapper
      type="primary"
      size="large"
      onClick={(): void => {
        uiStore.setTheme('dark')
      }}
    >
      Toggle Theme
    </Wrapper>
  )
}

export default observer(ToggleTheme)
