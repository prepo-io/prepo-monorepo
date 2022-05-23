import styled, { keyframes } from 'styled-components'
import { spacingIncrement } from '../utils/theme/utils'

type Props = {
  loading?: boolean
  size?: number
}

const StyledImage = styled.img<{ $height: number }>`
  height: ${({ $height }): string => ($height === undefined ? 'auto' : spacingIncrement($height))};
  object-fit: cover;
`

const skeletonAnimation = keyframes`
  0% { opacity: 0.8; }
  50% { opacity: 0.3; }
  100% { opacity: 0.8; }
`

const Wrapper = styled.div<{ shouldAnimate: boolean }>`
  animation: ${skeletonAnimation}
    ${({ shouldAnimate }): string => (shouldAnimate ? '1.5s infinite' : '0s none')};
  height: 100%;
  width: inherit;
`

const LoadingCarouselCard: React.FC<Props> = ({ loading, size }) => (
  <Wrapper shouldAnimate={loading}>
    <StyledImage $height={size} width="100%" src="/assets/nft-placeholder.svg" />
  </Wrapper>
)

export default LoadingCarouselCard
