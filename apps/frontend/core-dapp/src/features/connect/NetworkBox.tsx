import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import { spacingIncrement } from 'prepo-ui'
import { useRootStore } from '../../context/RootStoreProvider'

const Wrapper = styled.div`
  align-items: center;
  background: ${({ theme }): string => theme.color.primary};
  border-radius: ${({ theme }): string => `${theme.borderRadius}px`};
  color: ${({ theme }): string => theme.color.white};
  display: flex;
  margin-right: ${spacingIncrement(16)};
  padding: 0 ${spacingIncrement(16)};
`

const NetworkBox: React.FC = () => {
  const { web3Store } = useRootStore()
  const { network } = web3Store

  if (!network) return null

  return (
    <Wrapper>
      <div>{network.name}</div>
    </Wrapper>
  )
}

export default observer(NetworkBox)
