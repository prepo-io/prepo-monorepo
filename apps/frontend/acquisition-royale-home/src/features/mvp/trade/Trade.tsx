import styled from 'styled-components'
import BuyRP from './BuyRP'
import { spacingIncrement } from '../../../utils/theme/utils'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${spacingIncrement(36)};
  width: 100%;
`
const Trade: React.FC = () => (
  <Wrapper>
    <BuyRP />
  </Wrapper>
)

export default Trade
