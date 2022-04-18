import styled from 'styled-components'
import { Box, Heading } from '@chakra-ui/layout'
import { BORDER_WIDTH_PIXEL } from '../utils/theme/theme-utils'
import { media } from '../utils/media'

const SectionUnderline = styled.div`
  background: linear-gradient(
    90deg,
    rgba(243, 210, 157, 0) 0.06%,
    #f3d29d 50.05%,
    rgba(243, 210, 157, 0) 100.06%
  );
  height: ${BORDER_WIDTH_PIXEL};

  ${media.lg`
    display: none;
  `}
`

const SectionTitle: React.FC = ({ children }) => (
  <Box width="100%">
    <Heading
      fontSize="4xl"
      fontWeight="900"
      lineHeight="110%"
      color="brand.primary"
      margin={1.5}
      textAlign="center"
      as="h4"
    >
      {children}
    </Heading>
    <SectionUnderline />
  </Box>
)

export default SectionTitle
