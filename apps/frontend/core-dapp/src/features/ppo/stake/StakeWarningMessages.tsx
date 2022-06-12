import { Icon } from 'prepo-ui'
import styled from 'styled-components'
import useResponsive from '../../../hooks/useResponsive'

const StyledLink = styled.a`
  align-items: center;
  color: ${({ theme }): string => theme.color.primary};
  cursor: pointer;
  display: inline-flex;
  &:hover {
    color: ${({ theme }): string => theme.color.primary};
  }
`

const WarningText = styled.span`
  color: ${({ theme }): string => theme.color.warning};
`

const InfoText = styled.span`
  color: ${({ theme }): string => theme.color.primary};
`

const DangerText = styled.span`
  color: ${({ theme }): string => theme.color.error};
`

export const LearnMore: React.FC<{ href: string }> = ({ href }) => {
  const { isDesktop } = useResponsive()
  const size = isDesktop ? '16' : '12'

  // TODO: fix all missing hrefs
  if (!href) {
    return null
  }

  return (
    <StyledLink href={href} target="_blank">
      <span>Learn More</span>
      &nbsp;
      <Icon name="share" width={size} height={size} />
    </StyledLink>
  )
}

export const CooldownPeriod: React.FC = () => (
  <span>
    There is a cooldown on period to unstake and a penalty if you have not staked long enough.&nbsp;
    <LearnMore href="" />
  </span>
)

export const UnstakingFee: React.FC<{ fee: number }> = ({ fee }) => (
  <span>
    Your <WarningText>unstaking fee is {fee}%.</WarningText> Stake for longer to reduce this fee.
  </span>
)

export const UnstakeImmediately: React.FC = () => (
  <span>
    Your <WarningText>unstaking fee is 15.0%.</WarningText> Unstake non-immediately, or stake for
    longer, to reduce this fee.
  </span>
)

export const DuringUnstaking: React.FC = () => (
  <span>
    During the unstaking process, the amount being unstacked will lose all associated PPO
    Power.&nbsp;
    <LearnMore href="" />
  </span>
)

export const UnstakeRequest: React.FC<{ unstakePpo: number; fee: number }> = ({
  unstakePpo,
  fee,
}) => (
  <span>
    You requested to unstake <WarningText>{unstakePpo} PPO</WarningText>, subject to an&nbsp;
    <WarningText>unstaking fee of {fee}%.</WarningText>
  </span>
)

export const UnstakeRequestDuringCooldown: React.FC<{ unstakePpo: number; fee: number }> = ({
  unstakePpo,
  fee,
}) => (
  <span>
    You requested to unstake <WarningText>{unstakePpo} PPO</WarningText>, subject to an{' '}
    <WarningText>unstaking fee of {fee}%.</WarningText> Cancel and stake for longer to reduce this
    fee.
  </span>
)

export const DateChanges: React.FC<{ from: string; to: string }> = ({ from, to }) => (
  <span>
    Your weighted average staking date will increase from {from} to <InfoText>{to}.</InfoText>
  </span>
)

export const UnstakingPeriod: React.FC = () => (
  <span>
    Unstaking is subject to a cooldown period of 21 days, followed by a 7 day period for your final
    confirmation.&nbsp;
    <LearnMore href="" />
  </span>
)

export const FeeForAllUnstaking: React.FC = () => (
  <span>
    All unstaking will be subject to a fee. The longer you stake, the lower the unstaking fee.
  </span>
)

export const UnstakingAll: React.FC = () => (
  <span>
    You will immediately lose <DangerText>all PPO Power</DangerText>.&nbsp;
    <LearnMore href="" />
  </span>
)

export const UnstakingPartially: React.FC<{ unstakePpo: number }> = ({ unstakePpo }) => (
  <span>
    You will immediately lose <DangerText>{unstakePpo} PPO Power</DangerText> for the amount being
    unstacked.&nbsp;
    <LearnMore href="" />
  </span>
)

export const CooldownEnds: React.FC<{ cooldown: string }> = ({ cooldown }) => (
  <span>
    Cooldown period ends in: <InfoText>{cooldown}.</InfoText>
  </span>
)
