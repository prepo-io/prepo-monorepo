import { Col } from 'antd'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'
import styled from 'styled-components'
import {
  media,
  spacingIncrement,
  Button,
  Icon,
  ButtonProps,
  Flex,
  Typography,
  Grid,
} from 'prepo-ui'
import PortfolioBreakdownItem from './PortfolioBreakdownItem'
import PositionsAndHistory from './PositionsAndHistory'
import { makeRepeatedValue } from '../../utils/generic-utils'
import useResponsive from '../../hooks/useResponsive'
import { useRootStore } from '../../context/RootStoreProvider'
import { formatUsd } from '../../utils/number-utils'

const Box = styled(Col)`
  border: 1px solid ${({ theme }): string => theme.color.neutral8};
  border-radius: ${({ theme }): number => theme.borderRadius}px;
`

const BalanceText = styled.p`
  color: ${({ theme }): string => theme.color.secondary};
  font-size: ${({ theme }): string => theme.fontSize.md};
  font-weight: ${({ theme }): number => theme.fontWeight.semiBold};
  line-height: ${({ theme }): string => theme.fontSize.md};
  margin: 0;
  ${media.desktop`
    font-size: ${({ theme }): string => theme.fontSize['4xl']};
    line-height: ${({ theme }): string => theme.fontSize['4xl']};
  `}
`
const BlackText = styled.p`
  color: ${({ theme }): string => theme.color.neutral2};
  font-size: ${({ theme }): string => theme.fontSize.sm};
  line-height: ${spacingIncrement(18)};
  margin: 0;
  margin-right: ${spacingIncrement(17)};
  ${media.desktop`
    font-size: ${({ theme }): string => theme.fontSize.md};
  `}
`

const IconWrapper = styled.div`
  cursor: pointer;
  line-height: 1;
`

const PortfolioBreakdownWrapper = styled.div<{ show: boolean }>`
  max-height: ${({ show }): string => (show ? spacingIncrement(500) : '0')};
  overflow: hidden;
  transition: 0.3s ease-out;
`

const commonButtonProps: ButtonProps = {
  sizes: {
    desktop: {
      height: 54,
      fontSize: 'md',
    },
    mobile: {
      height: 38,
      fontSize: 'xs',
    },
  },
}

const Portfolio: React.FC = () => {
  const {
    localStorageStore,
    portfolioStore,
    preCTTokenStore,
    web3Store: { connected },
  } = useRootStore()
  const { tokenBalanceFormat } = preCTTokenStore
  const { isPortfolioVisible } = localStorageStore.storage
  const { isDesktop } = useResponsive()

  const { portfolioValue, tradingPositionsValue } = portfolioStore
  const toggleShowPortfolio = (): void => {
    runInAction(() => {
      localStorageStore.storage.isPortfolioVisible = !isPortfolioVisible
    })
  }

  const renderPortfolioValue = useMemo(() => {
    if (!connected) return '-'
    if (!isPortfolioVisible) return makeRepeatedValue('*', 9)
    if (portfolioValue === undefined) return <Skeleton width={120} />
    return `${formatUsd(portfolioValue)}`
  }, [connected, isPortfolioVisible, portfolioValue])

  const renderPortfolioBreakdown = useMemo(
    () => (
      <PortfolioBreakdownWrapper show={isPortfolioVisible}>
        <PortfolioBreakdownItem
          iconName="money-bag"
          label="Cash Balance"
          value={tokenBalanceFormat}
        />
        <PortfolioBreakdownItem
          iconName="growth"
          label="Trading Positions"
          value={tradingPositionsValue}
        />
        {/*  reserving this code for post mvp
        <PortfolioBreakdownItem comingSoon iconName="percent" label="Interest Earned" value={0} />
        <PortfolioBreakdownItem comingSoon iconName="water-drop" label="Liquidity PNL" value={0} /> */}
      </PortfolioBreakdownWrapper>
    ),
    [isPortfolioVisible, tokenBalanceFormat, tradingPositionsValue]
  )

  return (
    <Flex alignItems="flex-start" flex={1} gap={24}>
      <Col flex="5">
        <Box>
          <Flex flexDirection="column" alignItems="flex-start" padding={25}>
            <Flex alignItems="flex-start" flexDirection="column" gap={8}>
              <Flex justifyContent="flex-start">
                <BlackText>Portfolio Value</BlackText>
                <IconWrapper onClick={toggleShowPortfolio}>
                  <Icon
                    color="secondary"
                    height="26"
                    name={isPortfolioVisible ? 'eye' : 'eye-slash'}
                    width="25"
                  />
                </IconWrapper>
              </Flex>
              <BalanceText>{renderPortfolioValue}</BalanceText>
            </Flex>
            <Grid gap={22} gridTemplateColumns="1fr 1fr" maxWidth={540} mt={17} width="100%">
              {/* eslint-disable-next-line react/jsx-props-no-spreading */}
              <Button type="primary" block href="/portfolio/deposit" {...commonButtonProps}>
                Deposit
              </Button>
              {/* eslint-disable-next-line react/jsx-props-no-spreading */}
              <Button href="/portfolio/withdraw" {...commonButtonProps}>
                Withdraw
              </Button>
            </Grid>
          </Flex>
          {!isDesktop && renderPortfolioBreakdown}
        </Box>
        <PositionsAndHistory />
      </Col>
      {isDesktop && (
        <Col flex={2}>
          <Box>
            <Typography color="neutral4" variant="text-semiBold-base" pb={8} pl={27} pt={20}>
              Portfolio Breakdown
            </Typography>
            {renderPortfolioBreakdown}
          </Box>
        </Col>
      )}
    </Flex>
  )
}

export default observer(Portfolio)
