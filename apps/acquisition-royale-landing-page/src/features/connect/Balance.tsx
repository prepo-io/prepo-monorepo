import { Box, Text } from '@chakra-ui/layout'
import { ethers } from 'ethers'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../context/RootStoreProvider'

const Balance: React.FC = () => {
  const { web3Store } = useRootStore()
  const { balance } = web3Store.signerState
  const formattedBalance = ethers.utils.formatEther(balance || 0)

  return (
    <Box>
      <Text fontSize="md">{formattedBalance} ETH</Text>
    </Box>
  )
}

export default observer(Balance)
