import { Box, Button, Flex, Typography } from 'prepo-ui'
import { observer } from 'mobx-react-lite'
import PositionItem, { PositionItemSkeleton } from './PositionItem'
import ClosePositionSummary from './ClosePositionSummary'
import { useRootStore } from '../../context/RootStoreProvider'
import { Routes } from '../../lib/routes'

const Positions: React.FC = () => {
  const { portfolioStore, web3Store } = useRootStore()
  const { positions, selectedPosition } = portfolioStore
  const { connected } = web3Store

  if (!connected)
    return (
      <Flex p={24} flexDirection="column">
        <Typography color="neutral3" mb={12} textAlign="center" variant="text-regular-base">
          Your wallet is not connected.
        </Typography>
      </Flex>
    )

  if (positions.length === 0)
    return (
      <Flex p={24} flexDirection="column">
        <Typography color="neutral3" mb={12} variant="text-regular-base">
          No position found!
        </Typography>
        <Button type="primary" size="sm" href={Routes.Markets}>
          Trade Now
        </Button>
      </Flex>
    )

  return (
    <Box position="relative">
      {positions.map(({ position, market, data }) => {
        const key = `${position}_${market.urlId}`
        if (!data) return <PositionItemSkeleton key={key} />
        return <PositionItem key={key} position={{ position, market, data }} />
      })}
      {selectedPosition && <ClosePositionSummary position={selectedPosition} />}
    </Box>
  )
}

export default observer(Positions)
