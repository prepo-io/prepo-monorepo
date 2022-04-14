/* eslint-disable import/no-unresolved */
import {
  Swiper as SwiperComponent,
  SwiperSlide as SwiperSlideComponent,
  SwiperProps,
} from 'swiper/react'
import { useResizeDetector } from 'react-resize-detector'
import SwiperCore, { Navigation, Pagination, Mousewheel, Keyboard } from 'swiper'
import { useEffect, useMemo, useState } from 'react'
import styled, {
  CSSProperties,
  css,
  DefaultTheme,
  FlattenInterpolation,
  ThemeProps,
} from 'styled-components'
import Icon from './icon'
import 'swiper/css'
import LoadingCarouselCard from './LoadingCarouselCard'
import { centered, spacingIncrement } from '../utils/theme/utils'
import useResponsive from '../hooks/useResponsive'
import { generateDummyArray } from '../utils/enterprise-utils'
import { Z_INDEX } from '../utils/theme/general-settings'

const StyledSwiperStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}
type ArrowProps = {
  direction: 'left' | 'right'
  height: number
  onClick?: () => void
}

export type OverlayProps = {
  action?: React.ReactNode
  message?: React.ReactNode
}
type Props = {
  enterprises?: { id: number; component: React.ReactNode }[]
  loading?: boolean
  overlay?: OverlayProps
  onActiveSlidesChange?: (slides: number) => unknown
} & SwiperProps

const ArrowWrapper = styled.div<Omit<ArrowProps, 'onClick'>>`
  ${({ direction }): FlattenInterpolation<ThemeProps<DefaultTheme>> =>
    direction === 'left'
      ? css`
          border-radius: 12px 6px 6px 12px;
          left: 0;
        `
      : css`
          border-radius: 6px 12px 12px 6px;
          right: 0;
        `}
  background-color: ${({ theme }): string => theme.color.accentPrimary};
  cursor: pointer;
  height: ${({ height }): string => spacingIncrement(height)};
  position: absolute;
  top: ${spacingIncrement(16)};
  width: ${spacingIncrement(39)};
  z-index: 1;
`

const ArrowIconWrapper = styled(Icon)`
  ${centered};
  height: 100%;
`

const InnerWrapper = styled.div`
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
  margin: 0 ${spacingIncrement(50)};
`

const Wrapper = styled.div`
  ${centered}
  position: relative;
  width: 100%;
`

const ArrowComponent: React.FC<ArrowProps> = ({ direction = 'left', height, onClick }) => (
  <ArrowWrapper height={height} direction={direction} onClick={onClick}>
    <ArrowIconWrapper name={`${direction}Arrow`} color="primary" />
  </ArrowWrapper>
)

const EnterpriseCarousel: React.FC<Props> = ({
  enterprises,
  loading,
  onActiveSlidesChange,
  overlay,
  ...swiperProps
}) => {
  const { isDesktop, isTablet } = useResponsive()
  const { height, ref } = useResizeDetector()
  const [activeIndex, setActiveIndex] = useState(0)

  SwiperCore.use([Navigation, Pagination, Mousewheel, Keyboard])
  const [swiperRef, setSwiperRef] = useState<SwiperCore>()

  const onSlideNext = (): void => swiperRef?.slideNext()
  const onSlidePrev = (): void => swiperRef?.slidePrev()

  const slidesPerView = useMemo(() => {
    if (isDesktop) return 3
    if (isTablet) return 2
    return 1
  }, [isDesktop, isTablet])

  useEffect(() => {
    if (typeof onActiveSlidesChange === 'function') {
      onActiveSlidesChange(slidesPerView + activeIndex)
    }
  }, [activeIndex, onActiveSlidesChange, slidesPerView])

  const showArrow = enterprises && enterprises.length > slidesPerView

  // 32 is the padding outside of EnterpriseCard. The padding is required for glowing effect because swiper has overflow hidden, which will cut off the glow effect
  const arrowHeight = useMemo(() => (height || 345) - 32, [height])

  const placeholderEnterprises = generateDummyArray(slidesPerView).map((id) => ({
    id,
    component: <LoadingCarouselCard key={id.toString()} loading={loading} />,
  }))

  const renderContent = (): React.ReactNode => {
    const cards =
      enterprises === undefined || enterprises.length === 0 ? placeholderEnterprises : enterprises
    return (
      <div ref={ref}>
        <SwiperComponent
          onActiveIndexChange={(swiper): void => {
            setActiveIndex(swiper.activeIndex)
          }}
          spaceBetween={20}
          slidesPerView={slidesPerView}
          onSwiper={setSwiperRef}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...swiperProps}
        >
          {cards.map(({ id, component }) => (
            <SwiperSlideComponent key={id} style={StyledSwiperStyle}>
              {component}
            </SwiperSlideComponent>
          ))}
        </SwiperComponent>
      </div>
    )
  }

  const renderOverlay = (): React.ReactNode => {
    if (!overlay) return null
    return (
      <MessageOverlay>
        <Message>{overlay.message}</Message>
        {overlay.action !== undefined && (
          <OverlayActionWrapper>{overlay.action}</OverlayActionWrapper>
        )}
      </MessageOverlay>
    )
  }
  return (
    <Wrapper>
      {renderOverlay()}
      <InnerWrapper>
        {showArrow && (
          <ArrowComponent height={arrowHeight} direction="left" onClick={onSlidePrev} />
        )}
        <SwiperWrapper>{renderContent()}</SwiperWrapper>
        {showArrow && (
          <ArrowComponent height={arrowHeight} direction="right" onClick={onSlideNext} />
        )}
      </InnerWrapper>
    </Wrapper>
  )
}

export default EnterpriseCarousel
