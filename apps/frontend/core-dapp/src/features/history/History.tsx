import { observer } from 'mobx-react-lite'
import { Box, centered, coreDappTheme, Flex, Typography } from 'prepo-ui'
import styled from 'styled-components'
import HistoryItem from './HistoryItem'
import { useRootStore } from '../../context/RootStoreProvider'
import { getFullDateTimeFromSeconds } from '../../utils/date-utils'
import Record from '../portfolio/Record'
import { PositionItemSkeleton } from '../position/PositionItem'

const { Z_INDEX } = coreDappTheme

const Overlay = styled.div`
  ${centered}
  background-color: rgba(255, 255, 255, 0.7);
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: ${Z_INDEX.onboardModal};
`
const History: React.FC = () => {
  const { portfolioStore, web3Store } = useRootStore()
  const { historicalEvents } = portfolioStore
  const { connected } = web3Store

  if (!connected)
    return (
      <Flex p={24} flexDirection="column">
        <Typography color="neutral3" mb={12} textAlign="center" variant="text-regular-base">
          Your wallet is not connected.
        </Typography>
      </Flex>
    )

  if (historicalEvents === undefined)
    return (
      <Box>
        <PositionItemSkeleton />
        <PositionItemSkeleton />
        <PositionItemSkeleton />
      </Box>
    )

  if (historicalEvents.length === 0)
    return (
      <Flex p={24} flexDirection="column">
        <Typography color="neutral3" mb={12} variant="text-regular-base">
          No transaction history.
        </Typography>
      </Flex>
    )

  return (
    <Box>
      {historicalEvents.map(
        ({ iconName, event, name, timestamp, transactionHash, usdValue, eventType }) => (
          <Record
            key={transactionHash}
            iconName={iconName}
            name={name}
            nameRedirectUrl="/"
            position={eventType}
            data={[
              {
                label: 'Value',
                amount: usdValue,
              },
              {
                label: 'Transaction Time',
                amount: getFullDateTimeFromSeconds(timestamp),
                usd: false,
              },
            ]}
            buttonLabel={event}
          />
        )
      )}
    </Box>
  )
}

export default observer(History)
