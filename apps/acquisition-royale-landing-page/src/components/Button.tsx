import { Button as CButton, ButtonProps, Text } from '@chakra-ui/react'

type Props = ButtonProps

const Button: React.FC<Props> = ({ children, ...props }) => {
  let buttonBgStyle = 'brand.primary'
  let buttonHoverStyle = { bg: 'brand.yang' }
  const buttonFocusStyle = { outline: 'none' }
  const buttonActiveStyle = { bg: '' }
  let textColorStyle = 'brand.yin'
  let textOpacityStyle = 1
  if (props.disabled) {
    buttonBgStyle = 'brand.primaryDisabled'
    buttonHoverStyle = { bg: 'brand.primaryDisabled' }
    textColorStyle = 'brand.yang'
    textOpacityStyle = 0.5
  }
  return (
    <CButton
      borderRadius={0}
      width="100%"
      bg={buttonBgStyle}
      _hover={buttonHoverStyle}
      _focus={buttonFocusStyle}
      _active={buttonActiveStyle}
      whiteSpace="normal"
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    >
      <Text
        fontSize="lg"
        fontWeight="bold"
        fontFamily="Eurostile"
        color={textColorStyle}
        opacity={textOpacityStyle}
      >
        {children}
      </Text>
    </CButton>
  )
}

export default Button
