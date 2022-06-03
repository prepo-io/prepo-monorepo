import { Button as AButton, ButtonProps as AButtonProps } from 'antd'
import Link from 'next/link'
import styled, {
  Color,
  css,
  DefaultTheme,
  FlattenInterpolation,
  ThemeProps,
} from 'styled-components'
import { useMemo } from 'react'
import useResponsive from '../../hooks/useResponsive'
import { centered, spacingIncrement } from '../../common-utils'
import { fontSize as fontSizeType } from '../../themes/core-dapp'

export type ButtonColors = {
  background?: keyof Color
  border?: keyof Color
  label?: keyof Color
  hoverLabel?: keyof Color
  hoverBackground?: keyof Color
  hoverBorder?: keyof Color
}

type StyleProps = {
  fontSize: keyof typeof fontSizeType
  height: number
}

type Sizes = {
  height: {
    lg: number
    md: number
    sm: number
    xs: number
  }
  fontSize: {
    lg: keyof typeof fontSizeType
    md: keyof typeof fontSizeType
    sm: keyof typeof fontSizeType
    xs: keyof typeof fontSizeType
  }
}

// See more on: https://www.notion.so/Standardize-buttons-sizes-7cb9835172284b5ea3ad56a3141864b9
const DESKTOP_SIZES: Sizes = {
  height: {
    lg: 54,
    md: 54,
    sm: 54,
    xs: 54,
  },
  fontSize: {
    lg: 'lg',
    md: 'md',
    sm: 'base',
    xs: 'sm',
  },
}

const MOBILE_SIZES: Sizes = {
  height: {
    lg: 38,
    md: 54,
    sm: 38,
    xs: 54,
  },
  fontSize: {
    lg: 'sm',
    md: 'sm',
    sm: 'sm',
    xs: 'sm',
  },
}

export type ButtonProps = Omit<AButtonProps, 'size'> & {
  size?: 'lg' | 'md' | 'sm' | 'xs' // Custom Sizes
  customColors?: ButtonColors
  sizes?: {
    desktop: StyleProps
    mobile: StyleProps
  }
}

const buttonStyles = ({
  colors,
  fontSize,
  height,
}: {
  colors: ButtonColors
} & StyleProps): FlattenInterpolation<ThemeProps<DefaultTheme>> => css`
  ${centered}
  background-color: ${({ theme }): string => theme.color[colors.background]};
  border: 1px solid ${({ theme }): string => theme.color[colors.border]};
  border-radius: ${({ theme }): number => theme.borderRadius}px;
  color: ${({ theme }): string => theme.color[colors.label]};
  cursor: pointer;
  font-size: ${({ theme }): string => theme.fontSize[fontSize]};
  font-weight: ${({ theme }): number => theme.fontWeight.semiBold};
  height: ${spacingIncrement(height)};
  padding: ${spacingIncrement(4)} ${spacingIncrement(15)};
  transition: background-color 100ms ease-in-out, border-color 100ms ease-in-out;

  &:active,
  &:hover {
    background-color: ${({ theme }): string => theme.color[colors.hoverBackground]};
    border-color: ${({ theme }): string => theme.color[colors.hoverBorder]};
    color: ${({ theme }): string => theme.color[colors.hoverLabel]};
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    :hover {
      background-color: ${({ theme }): string => theme.color[colors.background]}};
    }
  }
`

const IconWrapper = styled.div`
  ${centered};
  margin-right: ${spacingIncrement(10)};
`

const Wrapper = styled.div<{ colors: ButtonColors } & StyleProps>`
  &&& {
    .ant-btn,
    .ant-btn-primary,
    .ant-btn-text {
      ${({ colors, fontSize, height }): FlattenInterpolation<ThemeProps<DefaultTheme>> =>
        buttonStyles({ colors, fontSize, height })};
    }
  }
`

const Anchor = styled.a<ButtonProps & StyleProps & { colors: ButtonColors }>`
  ${({ colors, fontSize, height }): FlattenInterpolation<ThemeProps<DefaultTheme>> =>
    buttonStyles({ colors, fontSize, height })};
  line-height: 1.2;
`

const Button: React.FC<ButtonProps> = ({
  children,
  type,
  className,
  href,
  target,
  icon,
  download,
  customColors,
  size = 'md',
  sizes = undefined,
  ...props
}) => {
  const { isDesktop } = useResponsive()
  const sizeKey = isDesktop ? 'desktop' : 'mobile'
  const sizeObject: Sizes = isDesktop ? DESKTOP_SIZES : MOBILE_SIZES
  const fontSize = sizes ? sizes[sizeKey].fontSize : sizeObject.fontSize[size]
  const height = sizes ? sizes[sizeKey].height : sizeObject.height[size]

  const defaultColors = useMemo((): ButtonColors => {
    switch (type) {
      case 'text':
        return {
          background: 'buttonTextBackground',
          border: 'buttonTextBorder',
          label: 'buttonTextLabel',
          hoverLabel: 'buttonTextHoverLabel',
          hoverBackground: 'buttonTextHoverBackground',
          hoverBorder: 'buttonTextHoverBorder',
        }
      case 'primary':
        return {
          background: 'buttonPrimaryBackground',
          border: 'buttonPrimaryBorder',
          label: 'buttonPrimaryLabel',
          hoverLabel: 'buttonPrimaryHoverLabel',
          hoverBackground: 'buttonPrimaryHoverBackground',
          hoverBorder: 'buttonPrimaryHoverBorder',
        }
      default:
        return {
          background: 'buttonDefaultBackground',
          border: 'buttonDefaultBorder',
          label: 'buttonDefaultLabel',
          hoverLabel: 'buttonDefaultHoverLabel',
          hoverBackground: 'buttonDefaultHoverBackground',
          hoverBorder: 'buttonDefaultHoverBorder',
        }
    }
  }, [type])

  const colors = useMemo(() => {
    const { background, border, label, hoverBackground, hoverLabel, hoverBorder } = defaultColors
    return {
      background: customColors?.background || background,
      border: customColors?.border || border,
      label: customColors?.label || label,
      hoverLabel: customColors?.hoverLabel || hoverLabel,
      hoverBackground: customColors?.hoverBackground || hoverBackground,
      hoverBorder: customColors?.hoverBorder || hoverBorder,
    }
  }, [customColors, defaultColors])

  const component = (
    <Wrapper className={className} colors={colors} fontSize={fontSize} height={height}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <AButton type={type} icon={icon} download={download} {...props}>
        {children}
      </AButton>
    </Wrapper>
  )

  // disabled property isn't supported on HTML anchor elements, fallback to button
  if (href && !props.disabled) {
    return (
      <Link href={href} passHref>
        <Anchor
          type={type}
          className={className}
          target={target}
          download={download}
          rel={target === '_blank' ? 'noopener noreferrer' : ''}
          colors={colors}
          fontSize={fontSize}
          height={height}
        >
          {icon ? <IconWrapper>{icon}</IconWrapper> : null}
          {children}
        </Anchor>
      </Link>
    )
  }

  return component
}

export default Button
