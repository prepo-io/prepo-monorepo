import styled from 'styled-components'
import Icon from '../../components/icon'
import { IconName } from '../../components/icon/icon.types'
import { spacingIncrement } from '../../utils/theme/utils'

const DescriptionWithIconWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  padding: 0 ${spacingIncrement(20)};
`

const DescriptionWithIconTextWrapper = styled.div`
  margin-left: ${spacingIncrement(24)};
  text-align: left;
`

export const DescriptionWithIcon: React.FC<{ iconName: IconName }> = ({ children, iconName }) => (
  <DescriptionWithIconWrapper>
    <Icon name={iconName} />
    <DescriptionWithIconTextWrapper>{children}</DescriptionWithIconTextWrapper>
  </DescriptionWithIconWrapper>
)

export const internDescription = (
  <DescriptionWithIcon iconName="coffeeCup">
    <span>Want to kickstart your Wall Street career?</span>
    <br />
    <br />
    <span>
      Earn FREE daily RP by completing intern tasks! <br />
      No Enterprise or MATIC required (except gas costs).
    </span>
  </DescriptionWithIcon>
)

export const acquireActionDescription = (
  <span>
    Consolidate your empire through a hostile takeover of your adversaries!
    <br />
    <br />
    Forcibly acquire an Enterprise by competing their RP to zero.
    <br />
    The Enterprise you keep will earn RP at an accelerated rate.
  </span>
)

export const competeActionDescription = (
  <span>
    Disrupt the market share of your rivals!
    <br />
    <br />
    Spend RP to reduce the RP of other Enterprises, making them more vulnerable to an acquisition.
  </span>
)

export const depositActionDescription = (
  <span>
    Need some external capital?
    <br />
    <br />
    Deposit RP from your wallet into your Enterprise.
  </span>
)

export const mergeActionDescription = (
  <span>
    Fortify your competitive advantage through synergetic efficiencies!
    <br />
    <br />
    Voluntarily merge two of your Enterprises together to earn RP at an accelerated rate and combine
    your RP balances.
  </span>
)

export const leaderboardContestsDescription = (
  <span>
    Win Enterprises and other prizes for ranking highly in various leaderboard categories!
  </span>
)

export const rebrandActionDescription = (
  <span>
    Communicate your corporate positioning with a revitalized appearance!
    <br />
    <br />
    Consume a Rebrand Token to change your Enterprise&apos;s image.
  </span>
)

export const renameActionDescription = (
  <span>
    Is it vanity, or normative destiny?
    <br />
    <br />
    Consume a Rename Token to change your Enterprise&apos;s name.
  </span>
)

export const reviveActionDescription = (
  <span>
    Bail out a distressed entity and restore it to its former glory!
    <br />
    <br />
    Consume a Revive Token to take ownership of a bankrupt Enterprise.
  </span>
)

export const rpShopDescription = (
  <DescriptionWithIcon iconName="shop">
    <span>
      Have some spare RP?
      <br />
      <br />
      Use RP to buy Enterprises or Rename/Rebrand/Revive Tokens.
    </span>
  </DescriptionWithIcon>
)

export const withdrawActionDescription = (
  <span>
    Want to distribute some dividends?
    <br />
    <br />
    Withdraw RP from your Enterprise into your wallet, with some RP burnt as a tax.
  </span>
)
