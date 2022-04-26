import { ButtonProps } from 'antd'
import { useCallback } from 'react'
import styled, { css, FlattenSimpleInterpolation } from 'styled-components'
import Button from './Button'
import FormLabel from './FormLabel'
import Warning from './Warning'
import { spacingIncrement } from '../utils/theme/utils'
import { media } from '../utils/theme/media'

type RadioOptionProps = {
  content: string
  label: string
  value?: number // this will be passed to callback when selected
}

type OptionProps = {
  onSelect: (value?: number) => void
  selected: boolean
}

type Props = {
  buttonProps?: ButtonProps
  label?: React.ReactNode
  onSelect: (value?: number) => void
  options: RadioOptionProps[]
  value?: number
  warning?: string
}

const ContentText = styled.p`
  font-size: ${({ theme }): string => theme.fontSize.base};
  line-height: 1;
  margin: 0;
`

const OptionLabel = styled.p`
  color: ${({ theme }): string => theme.color.darkGrey};
  font-size: ${({ theme }): string => theme.fontSize.xs};
  margin-bottom: ${spacingIncrement(4)};
`

const OptionWrapper = styled.div<{ selected: boolean }>`
  ${({ selected, theme }): FlattenSimpleInterpolation => {
    const highlighted = css`
      border: solid 1px ${theme.color.accentPrimary};
      color: ${theme.color.white};
    `
    return selected
      ? highlighted
      : css`
          border: solid 1px ${theme.color.darkGrey};
          color: ${theme.color.darkGrey};
          :hover {
            ${highlighted}
          }
        `
  }}
  cursor: pointer;
  padding: ${spacingIncrement(8)};
  transition: 0.3s;
`

const OptionsWrapper = styled.div`
  display: grid;
  font-family: ${({ theme }): string => theme.fontFamily.secondary};
  font-weight: ${({ theme }): number => theme.fontWeight.bold};
  grid-gap: ${spacingIncrement(18)};
  grid-template-columns: repeat(2, 1fr);
  letter-spacing: 1px;
  /* names can get out of box on mobile if 2 boxes share a row and name is long */
  ${media.tablet`
  grid-template-columns: repeat(1, 1fr);
  `}
`

const StyledButton = styled(Button)`
  margin-top: ${spacingIncrement(15)};
`
const Wrapper = styled.div``

const Option: React.FC<RadioOptionProps & OptionProps> = ({
  content,
  label,
  onSelect,
  selected,
  value,
}) => {
  const handleClick = useCallback(() => {
    onSelect(value)
  }, [onSelect, value])

  return (
    <OptionWrapper selected={selected} onClick={handleClick}>
      <OptionLabel>{label}</OptionLabel>
      <ContentText>{content}</ContentText>
    </OptionWrapper>
  )
}
const EnterpriseRadio: React.FC<Props> = ({
  buttonProps,
  label,
  onSelect,
  options,
  value,
  warning,
}) => (
  <Wrapper>
    {Boolean(label) && <FormLabel>{label}</FormLabel>}
    <OptionsWrapper>
      {options.map((option) => (
        <Option
          key={option.label}
          onSelect={onSelect}
          selected={value !== undefined && value === option.value}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...option}
        />
      ))}
    </OptionsWrapper>
    {buttonProps && (
      <StyledButton
        block
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...buttonProps}
      />
    )}
    {Boolean(warning) && <Warning>{warning}</Warning>}
  </Wrapper>
)

export default EnterpriseRadio
