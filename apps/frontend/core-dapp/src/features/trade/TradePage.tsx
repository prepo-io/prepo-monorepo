import styled from 'styled-components'
import { RadioChangeEvent } from 'antd'
import { observer } from 'mobx-react-lite'
import { useRouter } from 'next/router'
import { spacingIncrement, Alert, media, Icon, TokenInput } from '@prepo-io/ui'
import TradeTransactionSummary from './TradeTransactionSummary'
import Link from '../../components/Link'
import RadioGroup from '../../components/RadioGroup'
import Radio from '../../components/Radio'
import SecondaryNavigation from '../../components/SecondaryNavigation'
import Card from '../../components/Card'
import { useRootStore } from '../../context/RootStoreProvider'
import { Market } from '../../types/market.types'
import MarketDropdown from '../../components/MarketDropdown'
import useResponsive from '../../hooks/useResponsive'
import CurrenciesBreakdown from '../../components/CurrenciesBreakdown'
import useSelectedMarket from '../../hooks/useSelectedMarket'
import { Routes } from '../../lib/routes'

type Props = {
  markets: Market[]
  staticSelectedMarket: Market
}

const AlertWrapper = styled.div`
  div[class*='ant-alert-message'] {
    ${media.desktop`
      font-size: ${({ theme }): string => theme.fontSize.base};
    `}
  }
`

const CardWrapper = styled(Card)`
  padding: 0 ${spacingIncrement(10)};
  width: ${spacingIncrement(720)};
`

const FormItem = styled.div`
  margin-bottom: ${spacingIncrement(24)};
  &&& {
    ${media.desktop`
      p {
        font-size: ${({ theme }): string => theme.fontSize.md};
      }
    `}
  }
`

const MartketDropdownWrapper = styled.div`
  div[class*='Dropdown__DropdownButton'] {
    ${media.desktop`
      height: auto;
      padding-bottom: ${spacingIncrement(16)};
      padding-top: ${spacingIncrement(16)};
    `}
  }
  span {
    font-size: ${({ theme }): string => theme.fontSize.base};
    ${media.desktop`
      font-size: ${({ theme }): string => theme.fontSize.xl};
    `}
  }
  svg,
  div[class*='IconTitle__IconWrapper'] {
    height: ${spacingIncrement(30)};
    width: ${spacingIncrement(30)};
    ${media.desktop`
      height: ${spacingIncrement(38)};
      width: ${spacingIncrement(38)};
    `}
  }
`

const Navigation = styled(SecondaryNavigation)`
  margin-bottom: ${spacingIncrement(32)};
`

const StyledRadio = styled(Radio)<{ active: boolean }>`
  ${media.desktop<{ active: boolean }>`
    font-size: ${({ active, theme }): string => (active ? theme.fontSize.xl : theme.fontSize.lg)};
  `}
`

const Message = styled.div`
  a {
    &:hover {
      color: ${({ theme }): string => theme.color.darkPrimary};
    }

    text-decoration: underline;
  }
`

const Wrapper: React.FC = ({ children }) => {
  const { isPhone } = useResponsive()
  if (isPhone) {
    return <>{children}</>
  }
  return <CardWrapper>{children}</CardWrapper>
}

const TradePage: React.FC<Props> = ({ markets, staticSelectedMarket }) => {
  const router = useRouter()
  const { tradeStore, web3Store, preCTTokenStore } = useRootStore()
  const {
    direction,
    openTradeAmount,
    openTradeAmountBigNumber,
    setDirection,
    setOpenTradeAmount,
    tradeMaxAmountString,
  } = tradeStore
  const { balanceOfSigner } = preCTTokenStore
  const {
    connected,
    network: { testNetwork = true },
  } = web3Store
  const selectedMarket = useSelectedMarket()

  const onSelectDirection = (e: RadioChangeEvent): void => {
    setDirection(e.target.value, selectedMarket)
  }

  const onSelectMarket = (key: string): void => {
    const url = `/markets/${key}/trade`
    router.push(url)
  }

  if (selectedMarket === undefined) return null

  return (
    <Wrapper>
      <Navigation backUrl={`/markets/${selectedMarket.urlId}`} title="Trade" showAdvancedSettings />
      <FormItem>
        <MartketDropdownWrapper>
          <MarketDropdown
            label="I want to trade"
            selectedMarket={staticSelectedMarket}
            markets={markets}
            onSelectMarket={onSelectMarket}
          />
        </MartketDropdownWrapper>
      </FormItem>
      <FormItem>
        <RadioGroup label="I want to go" value={direction} onChange={onSelectDirection}>
          <StyledRadio
            active={direction === 'long'}
            value="long"
            color="success"
            icon={<Icon name="long" />}
          >
            Long
          </StyledRadio>
          <StyledRadio
            active={direction === 'short'}
            value="short"
            color="error"
            icon={<Icon name="short" />}
          >
            Short
          </StyledRadio>
        </RadioGroup>
      </FormItem>
      <FormItem>
        <TokenInput
          balance={tradeMaxAmountString}
          connected={connected}
          onChange={setOpenTradeAmount}
          showSlider
          max={tradeMaxAmountString}
          usd
          value={openTradeAmount}
        />
      </FormItem>
      <FormItem>
        <CurrenciesBreakdown />
      </FormItem>
      <FormItem>
        <TradeTransactionSummary />
      </FormItem>
      {(balanceOfSigner?.lt(openTradeAmountBigNumber) || balanceOfSigner?.eq(0)) && (
        <FormItem>
          <AlertWrapper>
            <Alert
              message={
                <Message>
                  You need to <Link href={Routes.Deposit}>deposit more funds</Link> to make this
                  trade.
                </Message>
              }
              type="warning"
              showIcon
              icon={<Icon name="info" color="warning" />}
            />
          </AlertWrapper>
        </FormItem>
      )}
      <FormItem>
        {!testNetwork && (
          <AlertWrapper>
            <Alert
              message="prePO is still in alpha - use at your own risk."
              type="warning"
              showIcon
              icon={<Icon name="info" color="warning" />}
            />
          </AlertWrapper>
        )}
      </FormItem>
    </Wrapper>
  )
}

export default observer(TradePage)
