import { Box, Text, TextProps } from '@chakra-ui/react'
import { BORDER_RADIUS_REM } from './Layout/layout-borders'
import { LETTER_SPACE_PIXEL } from '../utils/theme/theme-utils'

const AnnouncementBanner: React.FC<TextProps> = ({ children, ...props }) => (
  <Box width="100%" position="absolute">
    <Box
      p={2}
      mt={2}
      mx={2}
      bg="brand.primary"
      borderTopStartRadius={`${BORDER_RADIUS_REM / 2}rem`}
      borderTopEndRadius={`${BORDER_RADIUS_REM / 2}rem`}
    >
      <Text
        width="100%"
        color="brand.yin"
        size="md"
        lineHeight="124%"
        fontWeight="bold"
        fontFamily="Eurostile"
        letterSpacing={LETTER_SPACE_PIXEL}
        textAlign="center"
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      >
        {children}
      </Text>
    </Box>
  </Box>
)

export default AnnouncementBanner
