import { Flex, Icon, media, spacingIncrement, Typography } from 'prepo-ui'
import styled from 'styled-components'
import { HistoryTransaction } from './history.types'

const Wrapper = styled.div``

const MainRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`

const ResponsiveData = styled.div`
  display: none;
  ${media.largeDesktop`
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: ${spacingIncrement(120)};
  `}
`

const HistoryItem: React.FC<HistoryTransaction> = ({
  event,
  iconName,
  name,
  timestamp,
  transactionHash,
  usdValue,
  eventType,
}) => (
  <Wrapper>
    <MainRow>
      <div>
        <Flex alignItems="start" justifyContent="start">
          <Icon name={iconName} />
          <Typography variant="text-semiBold-xl" color="secondary">
            {name}
          </Typography>
        </Flex>
      </div>
      <ResponsiveData>{usdValue}</ResponsiveData>
      <ResponsiveData>{timestamp}</ResponsiveData>
      <div>{event}</div>
    </MainRow>
  </Wrapper>
)

export default HistoryItem
