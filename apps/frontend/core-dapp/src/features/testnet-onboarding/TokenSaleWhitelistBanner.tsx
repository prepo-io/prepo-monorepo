import { Typography } from '@prepo-io/ui'
import styled from 'styled-components'
import { PREPO_TESTNET_FORM } from '../../lib/constants'

const StyledText = styled(Typography)`
  text-align: center;
  text-overflow: ellipsis;
  width: 100%;
`

const TokenSaleWhitelistBanner: React.FC = () => (
  <StyledText as="p" variant="text-regular-base" background="primary" color="white" py={6}>
    Join the{' '}
    <span>
      <a
        style={{ textDecoration: 'underline', whiteSpace: 'nowrap' }}
        target="_blank"
        href={PREPO_TESTNET_FORM}
        rel="noreferrer"
      >
        $PPO Token Sale Whitelist
      </a>
    </span>{' '}
    for testnet funds.
  </StyledText>
)

export default TokenSaleWhitelistBanner
