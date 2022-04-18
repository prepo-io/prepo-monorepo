import { SimpleGrid, Box } from '@chakra-ui/react'
import styled from 'styled-components'
import * as Scroll from 'react-scroll'
import { sectionStyles } from './section-styles'
import { SectionsEnum } from './SectionStore'
import useSection from '../../../hooks/useSection'
import SectionTitle from '../../../components/SectionTitle'
import Card from '../../../components/Card'
import { featuresData } from '../../../data'
import { LETTER_SPACE_PIXEL, spacingIncrement } from '../../../utils/theme/theme-utils'

const ScrollContainer = styled(Scroll.Element)`
  ${sectionStyles};
  min-height: ${spacingIncrement(65)};
`
const SectionWrapper = styled.section``

const FeaturesSection: React.FC = () => {
  const { ref } = useSection(SectionsEnum.FEATURES)

  return (
    <ScrollContainer as={SectionWrapper} name="features" ref={ref}>
      <SectionTitle>Features</SectionTitle>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 2 }} mt={{ base: 2, lg: 7 }} gap={4}>
        {featuresData.map(({ title, description }) => (
          <Card heading={title} mx={4} key={title}>
            <Box mb={2.5} mt={2} letterSpacing={LETTER_SPACE_PIXEL}>
              {description}
            </Box>
          </Card>
        ))}
      </SimpleGrid>
    </ScrollContainer>
  )
}

export default FeaturesSection
