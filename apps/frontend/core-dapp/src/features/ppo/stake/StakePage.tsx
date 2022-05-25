import styled from 'styled-components'
import { Checkbox, Flex, Icon, media, spacingIncrement, TokenInput } from '@prepo-io/ui'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import StakeUnstakeLayout from './StakeUnstakeLayout'
import StakeDelegate from './StakeDelegate'
import { CooldownPeriod } from './StakeWarningMessages'
import { MessageType } from './StakeWarning'
import TimeMultiplierChart from '../timeMultiplier/TimeMultiplierChart'
import Input, { LabelWrapper } from '../../../components/Input'
import { useRootStore } from '../../../context/RootStoreProvider'
import UnstakingFeeChart from '../timeMultiplier/UnstakingFeeChart'
import useResponsive from '../../../hooks/useResponsive'

export const PrefixWrapper = styled.div`
  align-items: center;
  color: ${({ theme }): string => theme.color.neutral1};
  display: flex;
  font-size: ${({ theme }): string => theme.fontSize.sm};
  font-weight: ${({ theme }): number => theme.fontWeight.semiBold};
  line-height: ${spacingIncrement(24)};
  ${media.desktop`
    font-size: ${({ theme }): string => theme.fontSize.md};
    line-height: ${spacingIncrement(30)};
  `}
  div {
    display: flex;
  }
`

export const StyledInput = styled(Input)`
  input {
    text-align: right;
  }
  &&& .ant-input-disabled {
    color: ${({ theme }): string => theme.color.neutral5};
  }
`

export const StyledLabel = styled(LabelWrapper)`
  display: flex;
`

const StyledCheckbox = styled(Checkbox)`
  background: ${({ theme }): string => theme.color.primaryAccent};
  border-radius: ${({ theme }): number => theme.borderRadius}px;
  padding: ${spacingIncrement(10)} ${spacingIncrement(11)};
  ${media.desktop`
    padding: ${spacingIncrement(18)} ${spacingIncrement(12)};
  `}
  &:hover {
    &&& * {
      border-color: ${({ theme }): string => theme.color.darkPrimary};
    }
  }
`

const StakePage: React.FC = () => {
  const {
    ppoTokenStore: { tokenBalance },
    unstakeStore: { confirm, setConfirm, currentUnstakingValue, setCurrentUnstakingValue },
    stakeStore,
    web3Store: { connected },
  } = useRootStore()
  const { currentStakingValue, setCurrentStakingValue } = stakeStore
  const { isDesktop } = useResponsive()
  const size = isDesktop ? '24' : '16'

  const pageMap = {
    stake: {
      chart: <TimeMultiplierChart />,
      messages: [
        { type: 'warning', key: 'cooldown', message: <CooldownPeriod /> },
      ] as MessageType[],
      body: (
        <>
          <TokenInput
            alignInput="right"
            balance={tokenBalance}
            connected={connected}
            iconName="ppo-logo"
            max={tokenBalance}
            onChange={setCurrentStakingValue}
            showSlider
            symbol="PPO"
            value={currentStakingValue}
          />
          <StakeDelegate />
        </>
      ),
    },
    unstake: {
      chart: <UnstakingFeeChart />,
      messages: [
        { type: 'warning', key: 'cooldown', message: <CooldownPeriod /> },
        // { type: 'warning', key: 'fee', message: <UnstakingFee fee={fee} /> }, // Example on how to load messages dynamically
      ] as MessageType[],
      body: (
        <>
          <TokenInput
            alignInput="right"
            disableClickBalance
            balance={tokenBalance}
            connected={connected}
            iconName="ppo-logo"
            max={tokenBalance}
            onChange={setCurrentUnstakingValue}
            symbol="PPO"
            value={currentUnstakingValue}
          />
          <StyledCheckbox checked={confirm} onChange={setConfirm}>
            <Flex gap={6}>
              Unstake PPO Immediately
              {/* TODO: add tooltip text */}
              {false && <Icon name="info" color="neutral5" width={size} height={size} />}
            </Flex>
          </StyledCheckbox>
        </>
      ),
    },
  }
  const [tab, changeTab] = useState<'stake' | 'unstake'>('stake')
  const content = pageMap[tab]

  return (
    <StakeUnstakeLayout
      onTabChange={changeTab}
      chart={content.chart}
      messages={content.messages}
      tab={tab}
    >
      {content.body}
    </StakeUnstakeLayout>
  )
}

export default observer(StakePage)
