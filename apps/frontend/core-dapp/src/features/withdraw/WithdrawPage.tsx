import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import { spacingIncrement, TokenInput } from '@prepo-io/ui'
import WithdrawTransactionSummary from './WithdrawTransactionSummary'
import SecondaryNavigation from '../../components/SecondaryNavigation'
import Card from '../../components/Card'
import { useRootStore } from '../../context/RootStoreProvider'
import useResponsive from '../../hooks/useResponsive'
import CurrenciesBreakdown from '../../components/CurrenciesBreakdown'

const CardWrapper = styled(Card)`
  padding: 0 ${spacingIncrement(10)};
  width: ${spacingIncrement(720)};
`

const Wrapper: React.FC = ({ children }) => {
  const { isPhone } = useResponsive()
  if (isPhone) {
    return <>{children}</>
  }
  return <CardWrapper>{children}</CardWrapper>
}

const Navigation = styled(SecondaryNavigation)`
  margin-bottom: ${spacingIncrement(32)};
`

const FormItem = styled.div`
  margin-bottom: ${spacingIncrement(24)};
`

const WithdrawPage: React.FC = () => {
  const { web3Store, withdrawStore } = useRootStore()
  const { connected } = web3Store
  const { setWithdrawalAmount, withdrawalMaxAmountString, withdrawalAmount } = withdrawStore

  return (
    <Wrapper>
      <Navigation backUrl="/portfolio" title="Withdraw" showAdvancedSettings />
      <FormItem>
        <TokenInput
          alignInput="right"
          balance={withdrawalMaxAmountString}
          connected={connected}
          disableClickBalance
          max={withdrawalMaxAmountString}
          onChange={setWithdrawalAmount}
          shadowSuffix=""
          symbol="USD"
          usd
          value={withdrawalAmount}
        />
      </FormItem>
      <FormItem>
        <CurrenciesBreakdown />
      </FormItem>

      <FormItem>
        <WithdrawTransactionSummary />
      </FormItem>
    </Wrapper>
  )
}

export default observer(WithdrawPage)
