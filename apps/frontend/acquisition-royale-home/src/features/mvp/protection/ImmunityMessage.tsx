import styled from 'styled-components'
import InfoTooltip from '../../../components/InfoTooltip'
import Link from '../../../components/Link'
import useCountdown from '../../../hooks/useCountdown'
import { LINKS } from '../../../lib/links'
import { media } from '../../../utils/theme/media'
import { spacingIncrement } from '../../../utils/theme/utils'

type Props = {
  competition?: boolean
  immune: boolean
  immuneUntil: number
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
  align-items: center;
  display: flex;
  gap: ${spacingIncrement(4)};
`

const ImmunityMessage: React.FC<Props> = ({ competition, immune, immuneUntil }) => {
  const immunedPeriod = useCountdown(immuneUntil)
  if (!immune) return null
  return (
    <Wrapper>
      <Label $competition={competition}>
        Enterprise immune for <NoWrap>{immunedPeriod}</NoWrap>{' '}
        <TooltipContainer>
          <InfoTooltip iconSize={14}>
            Enterprise with immunity cannot be acquired or competed against.{' '}
            <Link href={LINKS.immunityDoc}>Read More</Link>
          </InfoTooltip>
        </TooltipContainer>
      </Label>
    </Wrapper>
  )
}

export default ImmunityMessage
