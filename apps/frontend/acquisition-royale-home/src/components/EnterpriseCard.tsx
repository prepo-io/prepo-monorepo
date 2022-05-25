import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import LoadingCarouselCard from './LoadingCarouselCard'
import { Z_INDEX } from '../utils/theme/general-settings'
import { centered, spacingIncrement } from '../utils/theme/utils'
import { Enterprise } from '../types/enterprise.types'
import { isEnterpriseLoaded } from '../utils/enterprise-utils'
import { useRootStore } from '../context/RootStoreProvider'

type Props = {
  active?: boolean
  enterprise: Enterprise
  loading?: boolean
}

const Burnt = styled.p`
  color: ${({ theme }): string => theme.color.error};
  font-size: ${({ theme }): string => theme.fontSize.md};
  font-weight: ${({ theme }): number => theme.fontWeight.bold};
  margin-bottom: 0;
  text-align: center;
  z-index: ${Z_INDEX.enterpriseBurnt};
`

const OverlayWrapper = styled.div`
  ${centered}
  height: 100%;
  left: 0;
  padding: ${spacingIncrement(20)};
  position: absolute;
  top: 0;
  width: 100%;
`
const Overlay = styled.div`
  ${centered}
  background-color: ${({ theme }): string => theme.color.secondary};
  height: 100%;
  left: 0;
  opacity: 0.8;
  position: absolute;
  top: 0;
  width: 100%;
`

const TextWrapper = styled.div<{ active?: boolean }>`
  color: ${({ active, theme }): string => (active ? theme.color.white : theme.color.grey)};
  font-family: ${({ theme }): string => theme.fontFamily.secondary};
  text-align: center;
`

const Wrapper = styled.div<{ $burned?: boolean }>`
  ${({ $burned }): string => ($burned ? 'cursor: not-allowed;' : '')}
  height: 100%;
  position: relative;
  width: inherit;
`

const StyledImage = styled.img<{ $height?: number }>`
  height: ${({ $height }): string => ($height === undefined ? 'auto' : spacingIncrement($height))};
  min-height: ${spacingIncrement(1)};
  object-fit: cover;
`

const EnterpriseCard: React.FC<Props> = ({ active = false, enterprise, loading }) => {
  const { uiStore } = useRootStore()
  const { enterpriseCardWidth } = uiStore
  if (!isEnterpriseLoaded(enterprise))
    return <LoadingCarouselCard size={enterpriseCardWidth} loading={loading} />
  const { burned, id, art } = enterprise

  return (
    <Wrapper $burned={burned}>
      <StyledImage $height={enterpriseCardWidth} width="100%" alt={id.toString()} src={art.image} />
      <TextWrapper active={active}>
        {burned && (
          <OverlayWrapper>
            <Burnt>
              BURNT{' '}
              <span aria-label="Skeleton" role="img">
                ☠️
              </span>
            </Burnt>
            <Overlay />
          </OverlayWrapper>
        )}
      </TextWrapper>
    </Wrapper>
  )
}

export type EnterpriseCardProps = Props

export default observer(EnterpriseCard)
