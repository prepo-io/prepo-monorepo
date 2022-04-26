import { ethers } from 'ethers'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { useRootStore } from '../../context/RootStoreProvider'

const Wrapper = styled.div``

const Text = styled.div`
  font-size: ${({ theme }): string => theme.fontSize.md};
`

const Balance: React.FC = () => {
  const { web3Store, usdcStore } = useRootStore()
  const { balance } = web3Store.signerState
  const { formattedSignerBalance, symbolString } = usdcStore
  const formattedBalance = ethers.utils.formatEther(balance || 0)

  return (
    <Wrapper>
      <Text>{formattedBalance} ETH</Text>
      <Text>
        {formattedSignerBalance || 'LOADING'} {symbolString || 'LOADING'}
      </Text>
    </Wrapper>
  )
}

export default observer(Balance)
