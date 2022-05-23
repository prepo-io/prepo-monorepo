import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Text,
  Image,
} from '@chakra-ui/react'
import styled from 'styled-components'
import * as Scroll from 'react-scroll'
import { SectionsEnum } from './SectionStore'
import { sectionStyles } from './section-styles'
import useSection from '../../../hooks/useSection'
import SectionTitle from '../../../components/SectionTitle'
import { faqs } from '../../../data'
import {
  BORDER_WIDTH_PIXEL,
  LETTER_SPACE_PIXEL,
  spacingIncrement,
} from '../../../utils/theme/theme-utils'

const ScrollContainer = styled(Scroll.Element)`
  ${sectionStyles};
  min-height: ${spacingIncrement(100)};
`
const SectionWrapper = styled.section``

const FAQSection: React.FC = () => {
  const { ref } = useSection(SectionsEnum.FAQ)

  return (
    <ScrollContainer as={SectionWrapper} name="faq" ref={ref}>
      <SectionTitle>Faq</SectionTitle>
      <Accordion mt={{ base: 2, lg: 7 }} allowMultiple>
        {faqs.map(({ title, description }, index) => (
          <AccordionItem
            borderWidth={BORDER_WIDTH_PIXEL}
            borderColor="brand.primary"
            mx={4}
            mb={4}
            // eslint-disable-next-line react/no-array-index-key
            key={index.toString()}
          >
            {({ isExpanded }): JSX.Element => (
              <>
                <AccordionButton
                  _focus={{ outline: 'none' }}
                  _hover={{ bg: 'rgba(25, 22, 35, 0.5)' }}
                  bg="rgba(25, 22, 35, 0.5)"
                  _expanded={{ bg: 'brand.yin' }}
                  minHeight={9}
                  p={2}
                  display="flex"
                  alignItems="flex-start"
                >
                  <Text
                    flex={1}
                    textAlign="left"
                    color="brand.primary"
                    fontSize="md"
                    lineHeight="124%"
                    fontFamily="Eurostile"
                    fontWeight="bold"
                  >
                    {title}
                  </Text>
                  <Image
                    src="/arrow-right.png"
                    height={4}
                    width={2}
                    mr={{ base: 1, lg: 0.5 }}
                    transform={`${isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'}`}
                    transition="0.3s"
                  />
                </AccordionButton>
                <AccordionPanel
                  color="brand.yang"
                  fontSize="md"
                  lineHeight="124%"
                  fontFamily="Eurostile"
                  letterSpacing={LETTER_SPACE_PIXEL}
                  mt={-1.5}
                  padding={2}
                  bg="brand.yin"
                >
                  {description}
                </AccordionPanel>
              </>
            )}
          </AccordionItem>
        ))}
      </Accordion>
    </ScrollContainer>
  )
}

export default FAQSection
