import { Box } from '@chakra-ui/layout'
import { SpanText } from '../../components/Text'
import { LETTER_SPACE_PIXEL } from '../../utils/theme/theme-utils'

export const LowMaticBalance: React.FC = () => (
  <Box
    fontFamily="Eurostile"
    fontSize="lg"
    color="brand.yang"
    textAlign="center"
    letterSpacing={LETTER_SPACE_PIXEL}
    mb={6}
  >
    Need more MATIC?
    <br />
    Follow our{' '}
    <SpanText>
      <a
        href="https://medium.com/prepo/setting-up-metamask-and-getting-eth-matic-on-polygon-step-by-step-guide-fd55147a0f05"
        target="_blank"
        rel="noreferrer"
      >
        step-by-step guide
      </a>
    </SpanText>
    .
  </Box>
)
