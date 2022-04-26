import styled from 'styled-components'
import Button from '../../components/Button'
import Icon from '../../components/icon'
import { spacingIncrement } from '../../utils/theme/utils'

const StyledButton = styled(Button)`
  align-items: center;
  display: flex;
  justify-content: center;
`

const StyledIcon = styled(Icon)`
  margin-right: ${spacingIncrement(12)};
`

const UniswapLink: React.FC = () => {
  const navigateToUniswap = (): void => {
    window.open('https://url.prepo.io/RP-MATIC')
  }

  return (
    <StyledButton block onClick={navigateToUniswap} rounded>
      <StyledIcon color="primary" name="uniswap" />
      Trade RP on Uniswap v3
    </StyledButton>
  )
}

export default UniswapLink
