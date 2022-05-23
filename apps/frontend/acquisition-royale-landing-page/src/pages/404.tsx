import { Box, Heading } from '@chakra-ui/layout'
import NextLink from 'next/link'
import styled from 'styled-components'
import HomeIcon from '../components/HomeIcon'
import SEO from '../components/SEO'
import Text from '../components/Text'
import { centered } from '../utils/theme/theme-utils'

const Wrapper = styled.div`
  ${centered}
  flex-direction: column;
  height: 90vh;
`

const Custom404: React.FC = () => (
  <Wrapper>
    <SEO
      title="Acquisition Royale by prePO | Page not found"
      description="Found an enterprise and become an empire in a battle-royale game for runway, wealth, and domination."
      ogImageUrl="https://acquisitionroyale.com/preview-card.png"
      url="https://acquisitionroyale.com/"
      twitterUsername="AcqRoyale"
    />
    <Heading
      as="h1"
      display="flex"
      flexDirection="column"
      color="brand.primary"
      fontWeight="900"
      textAlign="center"
      mb={4}
    >
      <Text lineHeight="100%" fontSize={{ base: '5rem', md: '6rem', lg: '7rem' }} as="span">
        404
      </Text>
      <Text fontSize={{ base: '3.7rem', md: '4.5rem', lg: '5rem' }} as="span" lineHeight="100%">
        Page not found
      </Text>
    </Heading>
    <NextLink href="/">
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a>
        <Box
          display="flex"
          bg="brand.primary"
          color="brand.yin"
          p={2}
          cursor="pointer"
          borderRadius={0}
          _hover={{ bg: 'white' }}
          _focus={{ outline: 'none' }}
        >
          <HomeIcon />
          <Text fontSize="md" ml={2} fontWeight="bold" fontFamily="Eurostile" color="brand.yin">
            Go back
          </Text>
        </Box>
      </a>
    </NextLink>
  </Wrapper>
)

export default Custom404
