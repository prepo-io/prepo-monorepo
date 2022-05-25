import { Tooltip } from 'antd'
import styled from 'styled-components'
import Icon from './icon'
import { spacingIncrement } from '../utils/theme/utils'

type Props = {
  iconSize?: number
}

const TooltipText = styled.div`
  font-size: ${({ theme }): string => theme.fontSize.sm};
  font-weight: ${({ theme }): number => theme.fontWeight.regular};
`

const StyledTooltip = styled(Tooltip)`
  display: flex;
  margin-top: -2px;
  &&& {
    .ant-tooltip-inner {
      background-color: ${({ theme }): string => theme.color.primary};
    }
  }
`

const InfoTooltip: React.FC<Props> = ({ children, iconSize = 25 }) => {
  const iconSizeString = spacingIncrement(iconSize)
  return (
    <StyledTooltip overlay={<TooltipText>{children}</TooltipText>}>
      <Icon color="grey" name="info" height={iconSizeString} width={iconSizeString} />
    </StyledTooltip>
  )
}

export default InfoTooltip
