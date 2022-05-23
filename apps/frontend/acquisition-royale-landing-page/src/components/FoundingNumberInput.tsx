import { Input, InputProps, HStack } from '@chakra-ui/react'
import { useState } from 'react'
import Button from './Button'

const FoundingNumberInput: React.FC<
  Omit<InputProps, 'onChange'> & {
    disabled?: boolean
    defaultValue?: string
    onChange: (value: string) => void
    max: number
  }
> = ({ onChange, defaultValue = '0', placeholder = '1', disabled = false, max }) => {
  const [localValue, setLocalValue] = useState<string>(defaultValue)

  const onClick = (type: 'increment' | 'decrement'): void => {
    let newValue
    const normalizedLocalValue = !localValue ? 0 : localValue
    if (type === 'increment') {
      newValue = parseInt(`${normalizedLocalValue}`, 10) + 1
    } else {
      newValue = parseInt(`${normalizedLocalValue}`, 10) - 1
    }

    if (onChange) {
      onChange(`${newValue}`)
    }

    setLocalValue(`${newValue}`)
  }

  return (
    <HStack spacing={0}>
      <Button
        disabled={disabled || localValue < defaultValue}
        width={10}
        height={12}
        pl={5}
        borderLeftRadius="full"
        onClick={(): void => onClick('decrement')}
      >
        -1
      </Button>
      <Input
        disabled={disabled}
        borderRadius={0}
        borderColor="brand.primary"
        _active={{ bg: '' }}
        _focus={{ outline: '' }}
        _hover={{ borderColor: 'brand.primary' }}
        _highlighted={{}}
        textAlign="center"
        placeholder={placeholder}
        value={localValue}
        min={1}
        step={1}
        precision={0}
        onChange={(e): void => {
          const intValue = parseInt(e.target.value, 10)
          const nextValue = Number.isNaN(intValue) ? '' : Math.min(intValue, max)
          setLocalValue(nextValue.toString())
          if (onChange) {
            onChange(nextValue.toString())
          }
        }}
        fontFamily="Geometos Neue"
        fontSize="2xl"
        fontWeight={900}
        height={12}
      />
      <Button
        disabled={disabled}
        width={10}
        height={12}
        pr={5}
        borderRightRadius="full"
        onClick={(): void => onClick('increment')}
      >
        +1
      </Button>
    </HStack>
  )
}

export default FoundingNumberInput
