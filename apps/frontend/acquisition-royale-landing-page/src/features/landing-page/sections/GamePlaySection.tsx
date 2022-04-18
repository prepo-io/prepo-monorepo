import { SimpleGrid, Box } from '@chakra-ui/react'
import * as Scroll from 'react-scroll'
import styled from 'styled-components'
import { sectionStyles } from './section-styles'
import { SectionsEnum } from './SectionStore'
import Card from '../../../components/Card'
import SectionTitle from '../../../components/SectionTitle'
import { gameplayData } from '../../../data'
import useSection from '../../../hooks/useSection'
import { LETTER_SPACE_PIXEL } from '../../../utils/theme/theme-utils'

export const ScrollContainer = styled(Scroll.Element)`
  ${sectionStyles};
`
const SectionWrapper = styled.section``

const GameplaySection: React.FC = () => {
  const { ref } = useSection(SectionsEnum.GAMEPLAY)

  return (
    <ScrollContainer as={SectionWrapper} name="gameplay" ref={ref}>
      <SectionTitle>Gameplay</SectionTitle>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 2 }} mt={{ base: 2, lg: 7 }} gap={4}>
        {gameplayData.map(({ title, description }) => (
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

export default GameplaySection
