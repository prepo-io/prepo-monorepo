/* eslint-disable react/jsx-props-no-spreading */
import { Text as CText, TextProps } from '@chakra-ui/react'

export const SpanText: React.FC<TextProps> = ({ children, ...props }) => (
  <CText as="span" color="brand.primary" fontWeight="bold" fontSize="md" {...props}>
    {children}
  </CText>
)

type Props = {
  secondary?: boolean
} & TextProps

const Text: React.FC<Props> = ({ secondary, children, ...props }) => {
  let opacity = 1
  if (secondary) {
    opacity = 0.5
  }
  return (
    <CText color="brand.yang" fontSize="md" opacity={opacity} {...props}>
      {children}
    </CText>
  )
}

export default Text
