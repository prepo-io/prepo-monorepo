import { Box, BoxProps } from '@chakra-ui/layout'
import FancyTitle from './FancyTitle'
import { BORDER_WIDTH_PIXEL } from '../utils/theme/theme-utils'

type Props = {
  heading?: string
} & BoxProps

const Card: React.FC<Props> = ({ children, heading, ...otherProps }) => (
  <Box
    py="4"
    px="3"
    border={BORDER_WIDTH_PIXEL}
    borderColor="brand.primary"
    bg="brand.yin"
    maxWidth="lg"
    width="100%"
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...otherProps}
  >
    <FancyTitle
      color="brand.primary"
      fontWeight="bold"
      fontFamily="Eurostile"
      fontSize="md"
      letterSpacing="0.04em"
    >
      {heading}
    </FancyTitle>
    <Box mt={1} color="brand.yang" fontSize="16px" lineHeight="136%" fontFamily="Eurostile">
      {children}
    </Box>
  </Box>
)

export default Card
