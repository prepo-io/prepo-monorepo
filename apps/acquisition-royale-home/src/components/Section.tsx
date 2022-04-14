import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { useRootStore } from '../context/RootStoreProvider'
import { centered, spacingIncrement } from '../utils/theme/utils'

type Props = {
  action?: React.ReactNode
  title?: string
  description?: string
  greyOnUnconnected?: boolean
}

const ActionWrapper = styled.div`
  margin-top: ${spacingIncrement(32)};
  width: 100%;
`

const Description = styled.p`
  color: ${({ theme }): string => theme.color.white};
  font-family: ${({ theme }): string => theme.fontFamily.secondary};
  font-size: ${({ theme }): string => theme.fontSize.base};
  letter-spacing: 1px;
  margin-bottom: 0;
  margin-top: ${spacingIncrement(24)};
  text-align: center;
`

const Title = styled.h1<{ connected: boolean }>`
  color: ${({ theme }): string => theme.color.accentPrimary};
  font-size: ${({ theme }): string => theme.fontSize['4xl']};
  font-weight: ${({ theme }): number => theme.fontWeight.extraBold};
  margin-bottom: 0;
  opacity: ${({ connected }): number => (connected ? 1 : 0.6)};
  text-align: center;
  transition: opacity 0.3s;
`

const ContentWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin-top: ${spacingIncrement(60)};
  width: 100%;
`

const Wrapper = styled.section`
  ${centered}
  flex-direction: column;
  padding: ${spacingIncrement(60)} 0;
`

const Section: React.FC<Props> = ({ action, children, description, greyOnUnconnected, title }) => {
  const { web3Store } = useRootStore()
  const { connected } = web3Store
  return (
    <Wrapper>
      {Boolean(title) && <Title connected={!greyOnUnconnected || connected}>{title}</Title>}
      {Boolean(description) && <Description>{description}</Description>}
      {Boolean(action) && <ActionWrapper>{action}</ActionWrapper>}
      <ContentWrapper>{children}</ContentWrapper>
    </Wrapper>
  )
}

export default observer(Section)
