import { Box, Flex } from '@chakra-ui/layout'
import { BORDER_WIDTH_PIXEL } from '../utils/theme/theme-utils'

type Props = {
  renderHeader: React.ReactNode
  renderContent: React.ReactNode
}

const DomeCard: React.FC<Props> = ({ renderHeader, renderContent }) => (
  <Flex flexDirection="column" alignItems="center">
    <Flex
      flexDirection="column"
      borderColor="brand.primary"
      height={{ base: '9.4rem', md: '10.4rem', lg: '14rem' }}
      width={{ base: '18.8rem', md: '20.8rem', lg: '28rem' }}
      borderRadius={{
        base: '9.4rem 9.4rem 0 0',
        md: '10.4rem 10.4rem 0 0',
        lg: '14rem 14rem 0 0',
      }}
      borderWidth={BORDER_WIDTH_PIXEL}
      justifyContent="flex-end"
      alignItems="center"
      pb="1rem"
    >
      {renderHeader}
    </Flex>
    <Box
      borderColor="brand.primary"
      mt={{ base: '-8.9rem', md: '-9.9rem', lg: '-13.5rem' }}
      height={{ base: '8.9rem', md: '9.9rem', lg: '13.5rem' }}
      width={{ base: '17.8rem', md: '19.8rem', lg: '27rem' }}
      borderRadius={{
        base: '8.9rem 8.9rem 0 0',
        md: '9.9rem 9.9rem 0 0',
        lg: '13.6rem 13.6rem 0 0',
      }}
      borderWidth={BORDER_WIDTH_PIXEL}
    />
    <Box
      borderColor="brand.primary"
      mt={{ base: '-8.4rem', md: '-9.4rem', lg: '-13rem' }}
      height={{ base: '8.4rem', md: '9.4rem', lg: '13rem' }}
      width={{ base: '16.8rem', md: '18.8rem', lg: '26rem' }}
      borderRadius={{
        base: '8.4rem 8.4rem 0 0',
        md: '9.4rem 9.4rem 0 0',
        lg: '13.6rem 13.6rem 0 0',
      }}
      borderWidth={BORDER_WIDTH_PIXEL}
    />
    <Box
      width={{ base: '18.8rem', md: '20.8rem', lg: '28rem' }}
      borderColor="brand.primary"
      borderBottomWidth={BORDER_WIDTH_PIXEL}
      borderLeftWidth={BORDER_WIDTH_PIXEL}
      borderRightWidth={BORDER_WIDTH_PIXEL}
    >
      <Box height={BORDER_WIDTH_PIXEL} mx={2} my={1.5} bg="brand.primary" />
      <Box height={BORDER_WIDTH_PIXEL} mx={4} my={1.5} bg="brand.primary" />
      <Box>{renderContent}</Box>
    </Box>
  </Flex>
)

export default DomeCard
