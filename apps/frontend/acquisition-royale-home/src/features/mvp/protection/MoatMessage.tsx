import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import InfoTooltip from '../../../components/InfoTooltip'
import Link from '../../../components/Link'
import { useRootStore } from '../../../context/RootStoreProvider'
import useCountdown from '../../../hooks/useCountdown'
import { LINKS } from '../../../lib/links'
import { media } from '../../../utils/theme/media'
import { spacingIncrement } from '../../../utils/theme/utils'

const TOOLTIP_ICON_SIZE = 14

type Props = {
  competition?: boolean
  hasMoat: boolean
  moatUntil: number
}

const Label = styled.span<{ $competition?: boolean }>`
  color: ${({ $competition, theme }): string => theme.color[$competition ? 'error' : 'success']};
  font-family: ${({ theme }): string => theme.fontFamily.secondary};
  font-size: ${({ theme }): string => theme.fontSize.base};
  margin-bottom: 0;
  text-align: center;
  ${media.phone`
    font-size: ${({ theme }): string => theme.fontSize.sm};
  `}
`

const NoWrap = styled.span`
  white-space: nowrap;
`

const TooltipContainer = styled.span`
  display: inline-block;
  vertical-align: middle;
`

const Wrapper = styled.div`
  gap: ${spacingIncrement(4)};
  text-align: center;
`

const MoatMessage: React.FC<Props> = ({ competition, hasMoat, moatUntil }) => {
  const { moatContractStore } = useRootStore()
  const { moatThreshold } = moatContractStore
  const moatPeriod = useCountdown(moatUntil)

  if (!hasMoat) return null

  if (moatUntil)
    return competition ? (
      <Wrapper>
        <Label $competition>
          Moat protection will be lost if not restored within <NoWrap>{moatPeriod}</NoWrap>{' '}
          <TooltipContainer>
            <InfoTooltip iconSize={TOOLTIP_ICON_SIZE}>
              Moat protection will be recovered if the owner restores the Enterprise balance to{' '}
              <NoWrap>&gt;{moatThreshold} RP</NoWrap> before time runs out.{' '}
              <Link href={LINKS.moatDoc}>Read More</Link>
            </InfoTooltip>
          </TooltipContainer>
        </Label>
      </Wrapper>
    ) : (
      <Wrapper>
        <Label $competition>
          Moat protection in danger! <NoWrap>{moatPeriod}</NoWrap> to restore{' '}
          <TooltipContainer>
            <InfoTooltip iconSize={TOOLTIP_ICON_SIZE}>
              Restore your Enterprise&apos;s RP balance to <NoWrap>&gt;{moatThreshold} RP</NoWrap>{' '}
              to recover your moat! <Link href={LINKS.moatDoc}>Read More</Link>
            </InfoTooltip>
          </TooltipContainer>
        </Label>
      </Wrapper>
    )

  return (
    <Wrapper>
      <Label $competition={competition}>
        Protected by Moat{' '}
        <TooltipContainer>
          <InfoTooltip iconSize={TOOLTIP_ICON_SIZE}>
            Moated Enterprises cannot be acquired immediately.{' '}
            <Link href={LINKS.moatDoc}>Read More</Link>
          </InfoTooltip>
        </TooltipContainer>
      </Label>
    </Wrapper>
  )
}

export default observer(MoatMessage)
