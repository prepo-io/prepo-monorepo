import { Box, Heading, Text } from '@chakra-ui/layout'
import styled from 'styled-components'
import * as Scroll from 'react-scroll'
import { SectionsEnum } from './SectionStore'
import useSection from '../../../hooks/useSection'
import Card from '../../../components/Card'
import { LETTER_SPACE_PIXEL } from '../../../utils/theme/theme-utils'

const ScrollContainer = styled(Scroll.Element)`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
`
const SectionWrapper = styled.section``

const IntroSection: React.FC = () => {
  const { ref } = useSection(SectionsEnum.INTRO)

  return (
    <ScrollContainer as={SectionWrapper} name="intro" ref={ref}>
      <Box mt={{ base: 10 }}>
        <Heading
          as="h1"
          display="flex"
          flexDirection="column"
          color="brand.primary"
          fontWeight="900"
          textAlign="center"
        >
          <Text
            lineHeight="100%"
            fontSize={{ base: '2.2rem', md: '4.125rem', lg: '6rem' }}
            as="span"
          >
            ACQUISITION
          </Text>
          <Text fontSize={{ base: '3.7rem', md: '7.5rem', lg: '6rem' }} as="span" lineHeight="100%">
            ROYALE
          </Text>
        </Heading>
      </Box>
      <Card width={{ base: '100%' }} mt={{ base: 4, md: 8 }}>
        <Heading
          as="h2"
          display="flex"
          flexDirection="column"
          color="brand.yang"
          fontFamily="Eurostile"
          fontSize="lg"
          letterSpacing={LETTER_SPACE_PIXEL}
          fontWeight="normal"
          textAlign="center"
        >
          <Text mb={1.5} as="span" lineHeight="132.5%">
            A play-to-earn battle royale game themed around mergers and acquisitions.
          </Text>
          <Text as="span" lineHeight="132.5%">
            Found an Enterprise, merge with others, and acquire the competition in a battle for
            runway, wealth, and domination.
          </Text>
        </Heading>
      </Card>
    </ScrollContainer>
  )
}

export default IntroSection
