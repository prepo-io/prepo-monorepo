import { ButtonProps, Input as AInput, InputProps as AInputProps } from 'antd'
import styled from 'styled-components'
import { useState } from 'react'
import Icon from './icon'
import Button from './Button'
import Warning from './Warning'
import FormLabel from './FormLabel'
import { bordered, hideNumberArrow, spacingIncrement } from '../utils/theme/utils'
import { media } from '../utils/theme/media'

export type InputProps = AInputProps & {
  buttonProps?: ButtonProps
  label?: string
  onClear?: () => void
  suffix?: React.ReactNode
  warning?: string
}

const ClearIconWrapper = styled.div<{ hasValue: boolean; focused: boolean }>`
  cursor: pointer;
  opacity: ${({ focused, hasValue }): number => (focused && hasValue ? 0.6 : 0)};
  padding: 0 ${spacingIncrement(8)};
  pointer-events: ${({ hasValue }): string => (hasValue ? 'all' : 'none')};
  transition: 0.3s;
  :hover {
    opacity: ${({ hasValue }): number => (hasValue ? 1 : 0)};
  }
`
const InputBox = styled.div`
  ${bordered}
  align-items: center;
  background-color: ${({ theme }): string => theme.color.secondary};
  display: flex;
`

const Wrapper = styled.div`
  &&& {
    font-family: ${({ theme }): string => theme.fontFamily.secondary};
    letter-spacing: 2px;
    .ant-input {
      background-color: ${({ theme }): string => theme.color.secondary};
      border: none;
      border-radius: 0;
      color: ${({ theme }): string => theme.color.white};
      flex: 1;
      font-size: ${({ theme }): string => theme.fontSize.base};
      height: ${spacingIncrement(54)};
      letter-spacing: inherit;
      padding: ${spacingIncrement(18)} ${spacingIncrement(25)};
      :focus {
        box-shadow: none;
        outline: none;
      }
      ${media.tablet`
        height: ${spacingIncrement(46)};
        padding: ${spacingIncrement(14)} ${spacingIncrement(25)};
      `}
      ::placeholder {
        /* Chrome, Firefox, Opera, Safari 10.1+ */
        color: ${({ theme }): string => theme.color.darkGrey};
      }

      :-ms-input-placeholder {
        /* Internet Explorer 10-11 */
        color: ${({ theme }): string => theme.color.darkGrey};
      }

      ::-ms-input-placeholder {
        /* Microsoft Edge */
        color: ${({ theme }): string => theme.color.darkGrey};
      }
    } /* Firefox */
    input[type='number'] {
      -moz-appearance: textfield;
    }
    ${hideNumberArrow}
  }
`

const Input: React.FC<InputProps> = ({
  buttonProps,
  label,
  onBlur,
  onClear,
  onFocus,
  suffix,
  value,
  warning,
  ...props
}) => {
  const [focused, setFocused] = useState(false)

  const handleClear = (): void => {
    if (onClear) onClear()
  }

  return (
    <Wrapper>
      {Boolean(label) && <FormLabel>{label}</FormLabel>}
      <InputBox>
        <AInput
          onBlur={(e): void => {
            setFocused(false)
            if (onBlur) onBlur(e)
          }}
          onFocus={(e): void => {
            setFocused(true)
            if (onFocus) onFocus(e)
          }}
          value={value}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...props}
        />
        <ClearIconWrapper
          onClick={handleClear}
          hasValue={onClear !== undefined && Boolean(value)}
          focused={focused}
        >
          <Icon color="darkGrey" name="close" />
        </ClearIconWrapper>
        {suffix}
        {buttonProps && (
          <Button
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...buttonProps}
          />
        )}
      </InputBox>
      {Boolean(warning) && <Warning>{warning}</Warning>}
    </Wrapper>
  )
}

export default Input
