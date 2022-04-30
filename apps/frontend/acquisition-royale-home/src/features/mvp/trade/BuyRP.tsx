import styled from 'styled-components'
import Icon from '../../../components/icon'
import { centered, spacingIncrement } from '../../../utils/theme/utils'
import ActionCard from '../ActionCard'

const ButtonWrapper = styled.div`
  ${centered}
`
const StyledIcon = styled(Icon)`
  margin-right: ${spacingIncrement(12)};
`

const BuyRP: React.FC = () => (
  <ActionCard
    buttonProps={{
      children: (
        <ButtonWrapper>
          <StyledIcon color="primary" name="uniswap" />
          Buy RP on Uniswap
        </ButtonWrapper>
      ),
      href: 'https://url.prepo.io/RP-MATIC',
      target: '_blank',
    }}
    description="Running out of RP? Buy more on Uniswap!"
    title="BUY RP"
  />
)

export default BuyRP
