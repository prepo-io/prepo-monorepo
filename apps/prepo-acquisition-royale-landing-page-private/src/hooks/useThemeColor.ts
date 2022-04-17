import { useColorModeValue } from '@chakra-ui/color-mode'

const useThemeColor = (themeValue: string): string => {
  const [colorType, colorValue] = themeValue.split('.')
  const colorModeValue = useColorModeValue(
    `${colorType}.light.${colorValue}`,
    `${colorType}.dark.${colorValue}`
  )

  return colorModeValue
}

export default useThemeColor
