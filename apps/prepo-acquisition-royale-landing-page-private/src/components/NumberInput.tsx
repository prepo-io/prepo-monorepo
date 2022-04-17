import { NumberInput as CNumberInput, NumberInputField, NumberInputProps } from '@chakra-ui/react'

const NumberInput: React.FC<NumberInputProps & { disabled?: boolean }> = ({
  onChange,
  value,
  defaultValue,
  placeholder = '0.0',
  disabled = false,
}) => (
  <CNumberInput onChange={onChange} value={value} defaultValue={defaultValue}>
    <NumberInputField placeholder={placeholder} disabled={disabled} />
  </CNumberInput>
)

export default NumberInput
