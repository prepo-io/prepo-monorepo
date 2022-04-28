/* eslint-disable import/no-unresolved */
import {
  Swiper as SwiperComponent,
  SwiperSlide as SwiperSlideComponent,
  SwiperProps,
} from 'swiper/react'
import SwiperCore from 'swiper'
import { useEffect, useMemo, useState } from 'react'
import styled, { CSSProperties } from 'styled-components'
import Icon from './icon'
import 'swiper/css'
import LoadingCarouselCard from './LoadingCarouselCard'
import { centered, spacingIncrement } from '../utils/theme/utils'
import { generateDummyArray } from '../utils/enterprise-utils'
import { Z_INDEX } from '../utils/theme/general-settings'

const SwiperStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}
type ArrowProps = {
  direction: 'left' | 'right'
  onClick?: () => void
}

export type OverlayProps = {
  action?: React.ReactNode
  message?: React.ReactNode
}
type Props = {
  activeIndex?: number
  enterprises?: { id: number; component: React.ReactNode }[]
  loading?: boolean
  overlay?: OverlayProps
  onActiveSlidesChange?: (props: { enterpriseId?: number; slides: number }) => unknown
} & SwiperProps

const ArrowWrapper = styled.div<Omit<ArrowProps, 'onClick'>>`
  align-self: stretch;
  background-color: ${({ theme }): string => theme.color.accentPrimary};
  border-radius: ${({ direction }): string =>
    direction === 'left' ? '12px 6px 6px 12px' : '6px 12px 12px 6px'};
  cursor: pointer;
  top: ${spacingIncrement(16)};
  width: ${spacingIncrement(39)};
  z-index: 5;
`

const ArrowIconWrapper = styled(Icon)`
  ${centered};
  height: 100%;
`

const InnerWrapper = styled.div`
  align-items: stretch;
  display: flex;
  justify-content: center;
  max-width: ${spacingIncrement(1200)};
  position: relative;
  width: 100%;
`

const Message = styled.div`
  color: ${({ theme }): string => theme.color.accentPrimary};
  font-size: ${({ theme }): string => theme.fontSize.md};
  margin-bottom: 0;
`

const MessageOverlay = styled.div`
  ${centered}
  flex-direction: column;
  font-family: ${({ theme }): string => theme.fontFamily.secondary};
  font-size: ${({ theme }): string => theme.fontSize.xl};
  height: 100%;
  position: absolute;
  text-align: center;
  width: 100%;
  z-index: ${Z_INDEX.actionCardOverlay};
`

const OverlayActionWrapper = styled.div`
  ${centered}
  margin-top: ${spacingIncrement(12)};
  width: 100%;
`

const SwiperWrapper = styled.div`
  display: flex;
  flex: 1;
  max-width: ${spacingIncrement(400)};
  width: 100%;
`

const Wrapper = styled.div`
  ${centered}
  flex-direction: column;
  position: relative;
  width: 100%;
`

const ArrowComponent: React.FC<ArrowProps> = ({ direction = 'left', onClick }) => (
  <ArrowWrapper direction={direction} onClick={onClick}>
    <ArrowIconWrapper name={`${direction}Arrow`} color="primary" />
  </ArrowWrapper>
)

const SLIDES_PER_VIEW = 1

const EnterpriseCarousel: React.FC<Props> = ({
  activeIndex,
  enterprises,
  loading,
  onActiveSlidesChange,
  overlay,
  ...swiperProps
}) => {
  const [swiperRef, setSwiperRef] = useState<SwiperCore>()

  const showArrow = enterprises && enterprises.length > SLIDES_PER_VIEW

  const placeholderEnterprises = generateDummyArray(SLIDES_PER_VIEW).map((id) => ({
    id,
    component: <LoadingCarouselCard key={id} loading={loading} />,
  }))

  useEffect(() => {
    if (swiperRef && swiperRef.activeIndex !== activeIndex) swiperRef.slideTo(activeIndex)
  }, [activeIndex, swiperRef])

  const renderContent = useMemo(() => {
    const cards =
      enterprises === undefined || enterprises.length === 0 ? placeholderEnterprises : enterprises

    return (
      <SwiperWrapper>
        <SwiperComponent
          onActiveIndexChange={(swiper): void => {
            onActiveSlidesChange?.({
              enterpriseId: enterprises?.[swiper.activeIndex].id,
              slides: swiper.activeIndex + SLIDES_PER_VIEW,
            })
          }}
          spaceBetween={20}
          slidesPerView={SLIDES_PER_VIEW}
          onSwiper={setSwiperRef}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...swiperProps}
        >
          {cards.map(({ id, component }) => (
            <SwiperSlideComponent key={id} style={SwiperStyle}>
              {component}
            </SwiperSlideComponent>
          ))}
        </SwiperComponent>
      </SwiperWrapper>
    )
  }, [enterprises, onActiveSlidesChange, placeholderEnterprises, swiperProps])

  return (
    <Wrapper>
      {overlay && (
        <MessageOverlay>
          <Message>{overlay.message}</Message>
          {overlay.action !== undefined && (
            <OverlayActionWrapper>{overlay.action}</OverlayActionWrapper>
          )}
        </MessageOverlay>
      )}
      <InnerWrapper>
        {showArrow && (
          <ArrowComponent direction="left" onClick={(): void => swiperRef?.slidePrev()} />
        )}
        {renderContent}
        {showArrow && (
          <ArrowComponent direction="right" onClick={(): void => swiperRef?.slideNext()} />
        )}
      </InnerWrapper>
    </Wrapper>
  )
}

export default EnterpriseCarousel
