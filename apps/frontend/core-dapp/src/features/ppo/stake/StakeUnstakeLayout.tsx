import { spacingIncrement, media, Flex, Box, Typography, Button } from 'prepo-ui'
import React from 'react'
import styled, { useTheme } from 'styled-components'
import { observer } from 'mobx-react-lite'
import StakeTitle from './StakeTitle'
import StakeUnstakeNavigationButtons from './StakeUnstakeNavigationButtons'
import StakeWarning, { MessageType } from './StakeWarning'
import { LearnMore } from './StakeWarningMessages'
import UnstakeButtons from './UnstakeButtons'
import { useRootStore } from '../../../context/RootStoreProvider'

const ControlPanel = styled.div`
  border: 1px solid ${({ theme }): string => theme.color.neutral6};
  border-radius: ${({ theme }): number => theme.borderRadius}px;
  display: flex;
  flex-direction: column;
  gap: ${spacingIncrement(16)};
  padding: ${spacingIncrement(15)} ${spacingIncrement(12)} ${spacingIncrement(16)}
    ${spacingIncrement(15)};
  width: 100%;
  ${media.desktop`
    padding: ${spacingIncrement(20)} ${spacingIncrement(15)}
      ${spacingIncrement(20)} ${spacingIncrement(19)};
  `}
`

const pageMap = {
  stake: {
    title: 'Time Multiplier',
    description:
      'The longer your average staking time, the higher the time multiplier on your staked PPO.',
    href: '',
  },
  unstake: {
    title: 'Unstaking Fee',
    description: 'Stake for longer for a lower fee.',
    href: '',
  },
}

const StakeUnstakeLayout: React.FC<{
  chart: React.ReactElement
  messages: MessageType[]
  onTabChange: (tab: 'stake' | 'unstake') => void
  tab: 'stake' | 'unstake'
}> = ({ chart, children, messages, onTabChange, tab }) => {
  const theme = useTheme()
  const {
    delegateStore: { selectedDelegate: delegate },
    stakeStore: { isCurrentStakingValueValid, stake },
    ppoStakingStore: { staking },
    uiStore: { disableMocks },
  } = useRootStore()

  const loading = (delegate && !delegate.delegateAddress) || staking

  const isStake = tab === 'stake'
  const content = pageMap[tab]

  return (
    <Box mx="auto">
      <StakeTitle />
      <Flex
        flexDirection={{ phone: 'column', desktop: 'row' }}
        alignItems={{ phone: 'stretch', desktop: 'stretch' }}
        gap={30}
        mt={{ phone: 24, desktop: 75 }}
      >
        <Flex
          alignItems="flex-start"
          flexDirection="column"
          border={`1px solid ${theme.color.neutral6}`}
          borderRadius={`${theme.borderRadius}px`}
          pt={20}
          pr={20}
          pb={{ phone: 35, desktop: 60 }}
          pl={{ phone: 0, desktop: 20 }}
          flex={1}
        >
          <Typography
            as="h5"
            variant="text-semiBold-xl"
            color="neutral1"
            ml={{ phone: 20, desktop: 0 }}
          >
            {content.title}
          </Typography>
          <Typography
            ml={{ phone: 20, desktop: 0 }}
            variant="text-medium-base"
            color="neutral5"
            mt={8}
            mb={{ phone: 30, desktop: 50 }}
          >
            {content.description}
            <LearnMore href={content.href} />
          </Typography>
          {disableMocks ? (
            <Typography
              variant="text-medium-md"
              flex={1}
              display="flex"
              alignItems="center"
              justifyContent="center"
              alignSelf="stretch"
            >
              Coming Soon
            </Typography>
          ) : (
            chart
          )}
        </Flex>
        <Flex maxWidth={{ phone: '100%', desktop: 400 }} alignSelf="flex-start">
          <Flex flexDirection="column" gap={[15, 20]} width={['100%', null]} alignItems="stretch">
            <ControlPanel>
              <StakeUnstakeNavigationButtons isStake={isStake} onTabChange={onTabChange} />
              {children}
            </ControlPanel>
            <StakeWarning messages={messages} />
            {isStake ? (
              <Button
                type="primary"
                block
                disabled={loading || !isCurrentStakingValueValid}
                loading={loading}
                onClick={stake}
              >
                Stake PPO
              </Button>
            ) : (
              <UnstakeButtons />
            )}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  )
}

export default observer(StakeUnstakeLayout)
