import { Card, CardProps } from 'antd'
import styled, { DefaultTheme, FlattenInterpolation, ThemeProps } from 'styled-components'
import LoadingCarouselCard from './LoadingCarouselCard'
import { formatPeriod } from '../utils/date-utils'
import { Z_INDEX } from '../utils/theme/general-settings'
import { centered, primaryBoxShadowGlow, spacingIncrement } from '../utils/theme/utils'
import { Enterprise } from '../types/enterprise.types'

type Props = {
  active?: boolean
  enterprise?: Enterprise
  isCompetitor?: boolean
}

const Burnt = styled.p`
  color: ${({ theme }): string => theme.color.error};
  font-size: ${({ theme }): string => theme.fontSize.md};
  font-weight: ${({ theme }): number => theme.fontWeight.bold};
  margin-bottom: 0;
  text-align: center;
  z-index: ${Z_INDEX.enterpriseBurnt};
`

const ImmunityLabel = styled.p`
  color: ${({ theme }): string => theme.color.error};
  font-family: ${({ theme }): string => theme.fontFamily.secondary};
  margin-bottom: 0;
  margin-top: ${spacingIncrement(12)};
  text-align: center;
`

const NoWrap = styled.span`
  white-space: nowrap;
`

const OverlayWrapper = styled.div`
  ${centered}
  height: 100%;
  left: 0;
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

const Wrapper = styled.div<{ active?: boolean; burned?: boolean }>`
  ${({ burned }): string => (burned ? 'cursor: not-allowed;' : '')}
  &&& {
    .ant-card {
      background-color: transparent;
      margin: 0 ${spacingIncrement(14)};
      .ant-card-cover {
        ${({ active }): FlattenInterpolation<ThemeProps<DefaultTheme>> | undefined =>
          active ? primaryBoxShadowGlow : undefined};
        background-color: ${({ theme }): string => theme.color.primary};
        border: 1px solid ${({ theme }): string => theme.color.accentPrimary};
        cursor: pointer;
      }
      .ant-card-body {
        padding: 0 ${spacingIncrement(5)};
        padding-bottom: 0;
      }
    }
  }
`

const StyledCard = styled(Card)<CardProps>`
  position: relative;
`

const StyledImage = styled.img`
  height: auto;
  object-fit: cover;
`

const EnterpriseCard: React.FC<Props> = ({ active = false, enterprise }) => {
  if (
    !enterprise ||
    !enterprise.art ||
    enterprise.immune === undefined ||
    enterprise.burned === undefined
  ) {
    return <LoadingCarouselCard />
  }

  const { burned, id, art, immune, immuneUntil } = enterprise

  return (
    <Wrapper active={active} burned={burned}>
      <StyledCard bordered={false} cover={<StyledImage alt={id.toString()} src={art.image} />}>
        <TextWrapper active={active} />
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
      </StyledCard>
      {immune && (
        <ImmunityLabel>
          Enterprise immune for <NoWrap>{formatPeriod(immuneUntil)}</NoWrap>
        </ImmunityLabel>
      )}
    </Wrapper>
  )
}

export type EnterpriseCardProps = Props

export type EnterpriseProps = Omit<EnterpriseCardProps, 'isCompetitor'>

export default EnterpriseCard
