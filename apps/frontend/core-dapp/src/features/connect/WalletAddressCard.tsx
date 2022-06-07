import styled from 'styled-components'
import { centered, media, spacingIncrement } from 'prepo-ui'

const WrapperCard = styled.div`
  ${centered}
  border: 1px solid ${({ theme }): string => theme.color.neutral7};
  border-radius: ${({ theme }): number => theme.borderRadius}px;
  color: ${({ theme }): string => theme.color.secondary};
  cursor: pointer;
  font-size: ${({ theme }): string => theme.fontSize.xs};
  font-weight: ${({ theme }): number => theme.fontWeight.semiBold};
  height: ${spacingIncrement(38)};
  padding: 0 ${spacingIncrement(10)};
  ${media.desktop`
    font-size: ${({ theme }): string => theme.fontSize.base};
  `}
`

type Props = {
  onClick?: () => void
}

const WalletAddressCard: React.FC<Props> = ({ children, onClick }) => (
  <WrapperCard onClick={onClick}>{children}</WrapperCard>
)

export default WalletAddressCard
