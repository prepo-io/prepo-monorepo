import { Box, Text, Flex } from '@chakra-ui/react'
import * as Scroll from 'react-scroll'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../context/RootStoreProvider'
import { navigationArr } from '../data'
import useBreakpoint from '../hooks/useBreakpoint'
import { SectionsEnum } from '../features/landing-page/sections/SectionStore'

const { scroller, animateScroll } = Scroll

const scrollOptions = { duration: 500, delay: 50, smooth: true, offset: -20 }

type NavigationItemProps = {
  isSelected?: boolean
  onClick?: () => void
}

const NavigationItem: React.FC<NavigationItemProps> = ({ children, isSelected, onClick }) => (
  <Flex alignItems="center" as="li">
    <Box transform="rotate(45deg)" bg={isSelected ? 'brand.primary' : ''} w={3} h={3} />
    <Text
      my={2.5}
      ml={3}
      color="brand.primary"
      fontWeight={900}
      fontSize="xl"
      lineHeight="108%"
      opacity={isSelected ? 1 : 0.5}
      cursor="pointer"
      onClick={onClick}
      _hover={{ opacity: 1, color: 'brand.primary' }}
      as="a"
    >
      {children}
    </Text>
  </Flex>
)

const Navigation: React.FC = () => {
  const breakpoint = useBreakpoint()
  const isDesktop = breakpoint === 'xl'
  const {
    sectionStore: { getActiveSection },
  } = useRootStore()
  const activeSection = getActiveSection()

  if (!isDesktop) {
    return null
  }

  return (
    <Flex position="fixed" flexDirection="column" bottom={7} left={12} as="ul">
      {navigationArr.map(
        ({ key, label }): JSX.Element => (
          <NavigationItem
            onClick={(): void => {
              if (key === SectionsEnum.FOUNDING) {
                animateScroll.scrollToTop(scrollOptions)
              } else {
                scroller.scrollTo(key, scrollOptions)
              }
            }}
            isSelected={activeSection === key}
            key={key}
          >
            {label}
          </NavigationItem>
        )
      )}
    </Flex>
  )
}

export default observer(Navigation)
