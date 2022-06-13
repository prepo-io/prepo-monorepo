import { Button, ButtonColors, Flex, Icon, IconName, media, spacingIncrement } from 'prepo-ui'
import { useMemo } from 'react'
import styled, {
  css,
  DefaultTheme,
  FlattenInterpolation,
  ThemedStyledProps,
} from 'styled-components'
import { ButtonGridStyles } from './ButtonGrid'

export type ExternalIconStyles = {
  align?: 'default' | 'right'
  marginRight?: {
    desktop?: string
    mobile?: string
  }
  size?: number
}

export type ButtonLinkProps = {
  title: string
  href?: string
  target?: '_blank'
  iconSize?: number
  iconName?: IconName
  customStyles?: ButtonGridStyles
  externalIconStyles?: ExternalIconStyles
  disabled?: boolean
}

type ExternalIconProps = { $externalIconStyles?: ExternalIconStyles; $emptyHref: boolean }

const StyledIcon = styled(Icon)<{ $customStyles?: ButtonGridStyles }>`
  left: ${({ $customStyles }): string =>
    $customStyles?.iconStyles?.mobile?.left ?? spacingIncrement(37)};
  position: absolute;
  top: ${({ $customStyles }): string =>
    $customStyles?.iconStyles?.mobile?.top ?? spacingIncrement(20)};

  ${media.desktop<{ $customStyles?: ButtonGridStyles }>`
    left: ${({ $customStyles }): string =>
      $customStyles?.iconStyles?.desktop?.left ?? spacingIncrement(56)};
    top: ${({ $customStyles }): string =>
      $customStyles?.iconStyles?.desktop?.top ?? spacingIncrement(28)};
  `}
`

const alignRightStyles = css<ExternalIconProps>`
  right: ${({ $externalIconStyles }): string =>
    $externalIconStyles?.marginRight?.mobile || spacingIncrement(22)};
`

const basicExternalIconStyles = css`
  right: ${spacingIncrement(-27)};
`

const ExternalIcon = styled(Icon)<ExternalIconProps>`
  ${({
    $externalIconStyles,
  }): FlattenInterpolation<ThemedStyledProps<ExternalIconProps, DefaultTheme>> =>
    $externalIconStyles?.align === 'right' ? alignRightStyles : basicExternalIconStyles}
`

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  span {
    color: ${({ theme }): string => theme.color.primary};
    font-size: ${({ theme }): string => theme.fontSize.xs};
  }
`
const StyledButton = styled(Button)<{
  disabled?: boolean
  customColors?: ButtonColors
}>`
  &&&& {
    .ant-btn:hover {
      border-color: ${({ disabled, theme, customColors }): string | undefined =>
        disabled ? theme.color.neutral6 : customColors?.hoverBorder};
    }
    ${StyledIcon} {
      position: absolute;
    }
    ${ExternalIcon} {
      position: absolute;
    }
  }
`

const ButtonLink: React.FC<ButtonLinkProps> = ({
  title,
  href,
  target,
  iconSize,
  iconName,
  customStyles,
  externalIconStyles,
  disabled,
}) => {
  const isOnRightSide = externalIconStyles?.align === 'right'
  const externalIcon = useMemo(
    () => (
      <ExternalIcon
        $emptyHref={!href}
        name="share"
        $externalIconStyles={externalIconStyles}
        height={`${externalIconStyles?.size}`}
        width={`${externalIconStyles?.size}`}
        color={customStyles?.label ?? 'white'}
      />
    ),
    [customStyles?.label, externalIconStyles, href]
  )
  return (
    <StyledButton
      href={href}
      target={target}
      customColors={customStyles}
      type={customStyles ? undefined : 'primary'}
      disabled={!href || disabled}
    >
      {iconName && Boolean(iconSize) && (
        <StyledIcon
          name={iconName}
          height={`${iconSize}`}
          width={`${iconSize}`}
          $customStyles={customStyles}
        />
      )}
      <TextWrapper>
        <Flex position="relative">
          {title}
          {!isOnRightSide && Boolean(target) && externalIcon}
        </Flex>
        <span>{!href && 'Coming soon'}</span>
      </TextWrapper>
      {isOnRightSide && Boolean(target) && externalIcon}
    </StyledButton>
  )
}

export default ButtonLink
