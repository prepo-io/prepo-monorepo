import { HeadingProps, Heading, Flex, Text } from '@chakra-ui/react'
import styled from 'styled-components'
import { BORDER_WIDTH_PIXEL } from '../utils/theme/theme-utils'

type FancyTitleContainerProps = {
  height?: number
}

const FancyTitleContainer = styled.div<FancyTitleContainerProps>`
  display: flex;
  width: 100%;
`

const LineContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: inherit;
  justify-content: space-between;
  padding: 3px 0;
`

type Props = {
  containerHeight?: number
} & HeadingProps

const FancyTitle: React.FC<Props> = ({ children, ...otherProps }) =>
  children ? (
    <FancyTitleContainer>
      <LineContainer>
        <Flex bg={otherProps.color} height={BORDER_WIDTH_PIXEL} />
        <Flex bg={otherProps.color} height={BORDER_WIDTH_PIXEL} />
      </LineContainer>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Heading textAlign="center" px={2} as="h5" {...otherProps}>
        <Text fontSize="2xl" fontWeight="bold" lineHeight={1} casing="uppercase">
          {children}
        </Text>
      </Heading>
      <LineContainer>
        <Flex bg={otherProps.color} height={BORDER_WIDTH_PIXEL} />
        <Flex bg={otherProps.color} height={BORDER_WIDTH_PIXEL} />
      </LineContainer>
    </FancyTitleContainer>
  ) : null

export default FancyTitle
