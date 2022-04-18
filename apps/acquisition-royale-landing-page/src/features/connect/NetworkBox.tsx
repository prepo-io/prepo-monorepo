import { Flex, Text } from '@chakra-ui/layout'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../context/RootStoreProvider'
import useThemeColor from '../../hooks/useThemeColor'

const NetworkBox: React.FC = () => {
  const { web3Store } = useRootStore()
  const { network } = web3Store
  const bg = useThemeColor('brand.primary')
  const color = useThemeColor('text.primary')

  if (!network) return null

  return (
    <Flex px={2} bg={bg} color={color} mr={2} borderRadius="md" alignItems="center">
      <Text>{network.name}</Text>
    </Flex>
  )
}

export default observer(NetworkBox)
