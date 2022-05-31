import styled from 'styled-components'
import Icon from './icon'

const StyledAnchor = styled.a`
  color: ${({ theme }): string => theme.color.accentPrimary};
  font-weight: ${({ theme }): number => theme.fontWeight.bold};
  transition: 0.4s;
  white-space: nowrap;
  svg {
    path {
      transition: 0.4s;
    }
  }
  :hover {
    color: ${({ theme }): string => theme.color.info};
    svg {
      path {
        fill: ${({ theme }): string => theme.color.info};
      }
    }
  }
`

const TooltipContainer = styled.span`
  display: inline-block;
  vertical-align: middle;
`

const Link: React.FC<React.AnchorHTMLAttributes<unknown>> = ({
  children,
  target = '_blank',
  ...props
}) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <StyledAnchor target={target} {...props}>
    {children}{' '}
    <TooltipContainer>
      <Icon name="external" height="12" />
    </TooltipContainer>
  </StyledAnchor>
)

export default Link
