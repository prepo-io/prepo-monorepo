import { Card } from 'antd'
import styled, { keyframes } from 'styled-components'
import { spacingIncrement } from '../utils/theme/utils'

type Props = {
  loading?: boolean
}

const StyledImage = styled.img`
  height: auto;
  object-fit: cover;
`

const skeletonAnimation = keyframes`
    0% {
        opacity: 0.8;
    }
    50% { 
        opacity: 0.3;
    }
    100% {
        opacity: 0.8;
    }
`
const Wrapper = styled.div<{ shouldAnimate: boolean }>`
  animation: ${skeletonAnimation}
    ${({ shouldAnimate }): string => (shouldAnimate ? '1.5s infinite' : '0s none')};
  opacity: 0.6;
  &&& {
    .ant-card {
      background: transparent;
      border: none;
      flex-direction: column;
      margin: ${spacingIncrement(16)} ${spacingIncrement(14)};
    }
    .ant-card-body {
      padding: 0;
    }
  }
`

const LoadingCarouselCard: React.FC<Props> = ({ loading }) => (
  <Wrapper shouldAnimate={loading || false}>
    <Card cover={<StyledImage alt="loading" src="/assets/nft-placeholder.svg" />} />
  </Wrapper>
)

export default LoadingCarouselCard
