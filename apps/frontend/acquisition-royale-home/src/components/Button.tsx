import { Button as AButton, ButtonProps } from 'antd'
import styled from 'styled-components'
import { media } from '../utils/theme/media'
import { spacingIncrement } from '../utils/theme/utils'

type Props = {
  rounded?: boolean
}

const Wrapper = styled.div<{ block?: boolean; rounded?: boolean }>`
  ${({ block }): string => (block ? 'width: 100%;' : '')}
  &&& {
    .ant-btn {
      align-items: center;
      background: ${({ theme }): string => theme.color.accentPrimary};
      border: none;
      border-radius: ${({ rounded }): string => (rounded ? spacingIncrement(4) : '0')};
      color: ${({ theme }): string => theme.color.primary};
      display: flex;
      font-family: ${({ theme }): string => theme.fontFamily.secondary};
      font-size: ${({ theme }): string => theme.fontSize.md};
      font-weight: ${({ theme }): number => theme.fontWeight.bold};
      height: ${spacingIncrement(54)};
      justify-content: center;
      line-height: 1;
      letter-spacing: 1px;
      padding-bottom: 0;
      :hover {
        background: ${({ theme }): string => theme.color.white};
      }
      ${media.tablet`
        font-size: ${({ theme }): string => theme.fontSize.sm};
        height: ${spacingIncrement(46)};
      `}
    }
    [ant-click-animating-without-extra-node='true']::after {
      display: none;
    }
    [disabled] {
      opacity: 0.4;
      :hover {
        background: ${({ theme }): string => theme.color.accentPrimary};
      }
    }
  }
`
const Button: React.FC<ButtonProps & Props> = ({ block, children, rounded, ...props }) => (
  <Wrapper block={block} rounded={rounded}>
    <AButton
      block={block}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    >
      {children}
    </AButton>
  </Wrapper>
)

export default Button
