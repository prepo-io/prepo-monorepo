import React from 'react'
import styled from 'styled-components'

const Link = styled.a`
  font-weight: ${({ theme }): number => theme.fontWeight.bold};
  text-decoration: underline;
  white-space: nowrap;
`

const LearnMore: React.FC<{ link: string }> = ({ link }) => (
  <Link target="_blank" href={link} rel="noopener noreferrer">
    Learn More
  </Link>
)

const Paragraph = styled.p`
  margin: 0;
`

export const EstimatedReceivedAmount: React.FC = () => (
  <Paragraph>Estimated deposit amount after fees.</Paragraph>
)

export const EstimatedWithdrawAmount: React.FC = () => (
  <Paragraph>Estimated USD amount withdrawn after fees.</Paragraph>
)

export const EstimatedValuation: React.FC<{ marketName: string }> = ({ marketName }) => (
  <Paragraph>The estimated fully-diluted valuation of {marketName}.</Paragraph>
)

export const EstimateYourProfitLoss: React.FC = () => (
  <Paragraph>
    This is just an illustration to show how much you will gain/lose when you close your position.
  </Paragraph>
)

export const ExpiryDate: React.FC = () => (
  <Paragraph>
    After this date, the market will automatically resolve at the lower bound of the valuation
    range.
  </Paragraph>
)

export const PayoutRange: React.FC = () => (
  <Paragraph>
    A percentage range representing the minimum and maximum portion of a market&apos;s total USD
    collateral that can be redeemed by Long positions vs. Short positions.&nbsp;
    <LearnMore link="https://docs.prepo.io/concepts/markets#payout-range" />
  </Paragraph>
)

export const TransactionFee: React.FC = () => <Paragraph>Fee paid to the prePO Treasury</Paragraph>

export const ValuationRange: React.FC = () => (
  <Paragraph>
    A range between two fully-diluted valuations, typically expressed in millions or billions or
    dollars. <LearnMore link="https://docs.prepo.io/concepts/markets#valuation-range" />
  </Paragraph>
)
