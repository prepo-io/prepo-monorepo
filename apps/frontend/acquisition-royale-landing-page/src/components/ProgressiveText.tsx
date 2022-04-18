import { Text as CText, TextProps, Box, Skeleton } from '@chakra-ui/react'
import { formatNumber } from '../utils/number-utils'

type Props = {
  percentage?: number
  isLoaded?: boolean
} & TextProps

const ProgressiveText: React.FC<Props> = ({
  isLoaded = true,
  percentage = 0,
  children,
  ...props
}) => (
  <Skeleton isLoaded={isLoaded}>
    <Box
      bgGradient={`linear(90deg, brand.primary ${percentage}%, brand.yang ${percentage - 100}%)`}
      backgroundClip="text"
      color="transparent"
      display="block"
      maxW="300px"
      margin="0 auto"
    >
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <CText fontWeight={900} fontSize="3xl" {...props}>
        {formatNumber(percentage, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
        % {children}
      </CText>
    </Box>
  </Skeleton>
)

export default ProgressiveText
