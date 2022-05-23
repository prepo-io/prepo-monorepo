/* eslint-disable import/no-unresolved */
import {
  Swiper as SwiperComponent,
  SwiperSlide as SwiperSlideComponent,
  SwiperProps,
} from 'swiper/react'
import SwiperCore from 'swiper'
import { useEffect, useMemo, useRef, useState } from 'react'
import styled, { CSSProperties } from 'styled-components'
import Icon from './icon'
import 'swiper/css'
import EnterpriseCard from './EnterpriseCard'
import { centered, spacingIncrement } from '../utils/theme/utils'
import { generateDummyArray, isFirstEnterpriseLoaded } from '../utils/enterprise-utils'
import { Z_INDEX } from '../utils/theme/general-settings'
import { Enterprises } from '../types/enterprise.types'

const SWIPER_PADDING_PERCENTAGE = 12
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
  enterprises?: Enterprises
  loading?: boolean
  overlay?: OverlayProps
  onActiveSlidesChange?: (props: { enterpriseId?: number; slides: number }) => unknown
  title?: string
} & SwiperProps

const ArrowWrapper = styled.div<Omit<ArrowProps, 'onClick'>>`
  align-self: stretch;
  background-color: ${({ theme }): string => theme.color.accentPrimary};
  border-radius: ${({ direction }): string =>
    direction === 'left' ? '12px 6px 6px 12px' : '6px 12px 12px 6px'};
  cursor: pointer;
  height: 100%;
  position: absolute;
  ${({ direction }): string => (direction === 'left' ? 'left: 0' : 'right: 0')};
  width: 8%;
  z-index: 1;
`

const ArrowIconWrapper = styled(Icon)`
  ${centered};
  height: 100%;
`

const InnerWrapper = styled.div`
  align-items: stretch;
  display: flex;
  gap: ${spacingIncrement(14)};
  justify-content: center;
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
  max-width: ${spacingIncrement(280)};
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

const Labels = styled.p`
  color: ${({ theme }): string => theme.color.white};
  font-size: ${({ theme }): string => theme.fontSize.base};
  font-weight: ${({ theme }): number => theme.fontWeight.bold};
  margin-bottom: 0;
  text-align: center;
`

const SwiperWrapper = styled.div`
  display: flex;
  padding: 0 ${SWIPER_PADDING_PERCENTAGE}%;
  width: 100%;
`

const Wrapper = styled.div`
  ${centered}
  flex-direction: column;
  gap: ${spacingIncrement(12)};
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
  title,
  ...swiperProps
}) => {
  // 385 is the max width EnterpriseCard will ever get
  const [cardWidth, setCardWidth] = useState(385)
  const [swiperRef, setSwiperRef] = useState<SwiperCore>()
  const swiperWrapperRef = useRef<HTMLDivElement>(null)

  const showArrow = enterprises && enterprises.length > SLIDES_PER_VIEW

  const placeholderEnterprises = generateDummyArray(SLIDES_PER_VIEW).map((id) => id)

  useEffect(() => {
    if (swiperRef && swiperRef.activeIndex !== activeIndex) swiperRef.slideTo(activeIndex)
  }, [activeIndex, swiperRef])

  useEffect(() => {
    const getCardHeight = (): void => {
      if (swiperWrapperRef.current) {
        const WIDTH_MULTIPLIER = (100 - 2 * SWIPER_PADDING_PERCENTAGE) / 100
        const width = swiperWrapperRef.current.clientWidth * WIDTH_MULTIPLIER
        setCardWidth(Math.ceil(width))
      }
    }
    getCardHeight()
    window.addEventListener('resize', getCardHeight)
    return () => {
      window.removeEventListener('resize', getCardHeight)
    }
  }, [])

  const renderCards = useMemo(() => {
    const enterpriseList =
      enterprises !== undefined && enterprises.length > 0 && isFirstEnterpriseLoaded(enterprises)
        ? enterprises
        : placeholderEnterprises

    return enterpriseList.map((enterprise, index) => (
      <SwiperSlideComponent
        // enterprise can be number when it is placeholder, check how enterpriseList is made
        key={typeof enterprise === 'number' ? enterprise : enterprise.id}
        style={SwiperStyle}
      >
        <EnterpriseCard
          active={index === activeIndex}
          enterprise={enterprise}
          loading={loading}
          size={cardWidth}
        />
      </SwiperSlideComponent>
    ))
  }, [activeIndex, cardWidth, enterprises, loading, placeholderEnterprises])

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
      {Boolean(title) && <Labels>{title}</Labels>}
      <InnerWrapper>
        {showArrow && (
          <ArrowComponent direction="left" onClick={(): void => swiperRef?.slidePrev()} />
        )}
        <SwiperWrapper ref={swiperWrapperRef}>
          <SwiperComponent
            onActiveIndexChange={(swiper): void => {
              onActiveSlidesChange?.({
                enterpriseId: enterprises?.[swiper.activeIndex]?.id,
                slides: swiper.activeIndex + SLIDES_PER_VIEW,
              })
            }}
            spaceBetween={20}
            slidesPerView={SLIDES_PER_VIEW}
            onSwiper={setSwiperRef}
            width={cardWidth}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...swiperProps}
          >
            {renderCards}
          </SwiperComponent>
        </SwiperWrapper>
        {showArrow && (
          <ArrowComponent direction="right" onClick={(): void => swiperRef?.slideNext()} />
        )}
      </InnerWrapper>
      {enterprises && enterprises.length > 1 && activeIndex !== undefined && (
        <Labels>
          {activeIndex + 1}/{enterprises.length}
        </Labels>
      )}
    </Wrapper>
  )
}

export default EnterpriseCarousel
