import { Flex, Icon, media, Subtitle, Typography } from 'prepo-ui'
import styled from 'styled-components'
import Details, { loadValue } from './Details'
import SectionAccordion from './SectionAccordion'
import useResponsive from '../../hooks/useResponsive'
import { DelegateEntity } from '../../stores/entities/DelegateEntity'
import { numberFormatter } from '../../utils/numberFormatter'

const { significantDigits } = numberFormatter

const StyledSubtitle = styled(Subtitle)`
  color: ${({ theme }): string => theme.color.neutral1};
  font-size: ${({ theme }): string => theme.fontSize.sm};
  ${media.desktop`
    font-size: ${({ theme }): string => theme.fontSize.md};
  `}
`

const ProfileVotingPower: React.FC<{ delegate?: DelegateEntity }> = ({ delegate }) => {
  const { isDesktop } = useResponsive()

  const governIconSize = isDesktop ? '32' : '24'
  const ppoPowerValue =
    delegate?.ppoPower !== undefined ? significantDigits(delegate.ppoPower) : undefined
  const delegatorsPowerValue =
    delegate?.delegatorsPower !== undefined
      ? significantDigits(delegate.delegatorsPower)
      : undefined
  return (
    <SectionAccordion
      title={
        <Flex gap={14}>
          <Flex p={{ phone: 9, desktop: 10 }} background="primary" borderRadius="50%">
            <Icon name="legal" color="white" width={governIconSize} height={governIconSize} />
          </Flex>
          <Flex flexDirection="column" gap={4} alignItems="flex-start">
            <Typography variant="text-medium-md" color="neutral3">
              Total Voting Power
            </Typography>
            <Typography textAlign="left" variant="text-semiBold-xl">
              {loadValue(delegate?.totalPPOPower?.toLocaleString(), '')}
            </Typography>
          </Flex>
        </Flex>
      }
    >
      <Details title="From PPO Power" value={ppoPowerValue} />
      <Details
        title={<StyledSubtitle tooltip="Power delegated to you">From Delegators</StyledSubtitle>}
        value={delegatorsPowerValue}
        description={<Flex as="span">{loadValue(delegate?.delegatorsCount)} Delegates</Flex>}
      />
    </SectionAccordion>
  )
}

export default ProfileVotingPower
