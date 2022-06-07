import { Flex, Icon, Typography } from 'prepo-ui'
import { useMemo } from 'react'
import styled from 'styled-components'
import SectionAccordion from './SectionAccordion'
import Details, { loadValue } from './Details'
import useResponsive from '../../hooks/useResponsive'

const StyledAccordion = styled(SectionAccordion)`
  border-bottom: 1px solid ${({ theme }): string => theme.color.neutral8};
`

const TotalMultiplier: React.FC<{
  totalMulitplier?: number | string
  stakeTime?: number | string
  timeMultiplier?: number | string
  nextTimeMultiplier?: number | string
  daysTillNextTimeMultiplier?: number | string
  temporaryMultiplier?: number
  permanentMultiplier?: number
  connected: boolean
}> = ({
  totalMulitplier,
  stakeTime,
  timeMultiplier,
  nextTimeMultiplier,
  daysTillNextTimeMultiplier,
  temporaryMultiplier,
  permanentMultiplier,
  connected,
}) => {
  const { isDesktop } = useResponsive()
  const infoSize = isDesktop ? '16' : '12'
  const achievementMultiplier = useMemo((): number | undefined => {
    if (temporaryMultiplier === undefined || permanentMultiplier === undefined) return undefined
    return temporaryMultiplier + permanentMultiplier
  }, [permanentMultiplier, temporaryMultiplier])

  return (
    <StyledAccordion
      title={
        <Flex flexDirection="column" gap={4} alignItems="flex-start">
          <Typography variant="text-medium-md" color="neutral3">
            Total Multiplier
          </Typography>
          <Typography textAlign="left" variant="text-semiBold-xl">
            {loadValue(totalMulitplier, 'x', connected)}
          </Typography>
        </Flex>
      }
    >
      <Details
        title="Time Multiplier"
        value={connected ? `${timeMultiplier}x` : '-'}
        description={
          <>
            <Flex justifyContent="flex-start" as="span">
              Next Mutliplier:&nbsp;
              {loadValue(nextTimeMultiplier, 'x', connected)}
              &nbsp;(in&nbsp;
              {loadValue(daysTillNextTimeMultiplier, '', connected)}
              &nbsp;days)
            </Flex>
            <Flex justifyContent="flex-start" as="span">
              Avg. Staking Time: &nbsp;
              {loadValue(stakeTime, '', connected)}
              &nbsp;Weeks&nbsp;
              {/* TODO: add tooltip text */}
              {false && <Icon name="info" width={infoSize} height={infoSize} color="neutral5" />}
            </Flex>
          </>
        }
      />
      <Details
        title="Achievements Multiplier"
        value={connected ? `${achievementMultiplier}x` : '-'}
        description={
          <Flex justifyContent="flex-start" as="span">
            {loadValue(temporaryMultiplier, 'x', connected)}
            &nbsp;Temporary +&nbsp;
            {loadValue(permanentMultiplier, 'x', connected)}
            &nbsp; Permanent
          </Flex>
        }
      />
    </StyledAccordion>
  )
}

export default TotalMultiplier
