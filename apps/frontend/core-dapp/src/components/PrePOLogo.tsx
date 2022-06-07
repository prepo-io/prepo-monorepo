import { Icon, media, spacingIncrement } from 'prepo-ui'
import styled from 'styled-components'
import Link from './Link'

const BrandNameWrapper = styled.div<{ $onlyLogo: boolean }>`
  overflow: hidden;
  ${media.desktop`
    margin-right: ${spacingIncrement(15)};
    width: unset;
  `}
  width: ${spacingIncrement(45)};
  span {
    height: 100%;
    svg {
      height: 100%;
    }
  }
`

const StyledLink = styled(Link)`
  align-self: stretch;
  display: flex;
`

const BetaWrapper = styled.div`
  display: none;

  ${media.desktop`
    align-self: center;
    display: flex;
    background-color: ${({ theme }): string => theme.color.primaryLight};
    border-radius: ${spacingIncrement(32)};
    color: ${({ theme }): string => theme.color.buttonPrimaryLabel};
    font-size: ${({ theme }): string => theme.fontSize.xs};
    font-weight: ${({ theme }): number => theme.fontWeight.semiBold};
    padding: ${spacingIncrement(3)} ${spacingIncrement(12)};
    text-transform: uppercase;
  `}
`

type Props = {
  href?: string
  target?: '_blank' | '_self'
  onlyLogo?: boolean
  showBeta?: boolean
}

const PrePOLogo: React.FC<Props> = ({
  href,
  target = '_self',
  onlyLogo = false,
  showBeta = false,
}) => {
  const component = (
    <>
      <BrandNameWrapper $onlyLogo={onlyLogo}>
        <Icon name="brand-logo" color="primaryWhite" width="120" style={{ display: 'block' }} />
      </BrandNameWrapper>
      {showBeta && <BetaWrapper>ALPHA</BetaWrapper>}
    </>
  )

  return href ? (
    <StyledLink href={href} target={target}>
      {component}
    </StyledLink>
  ) : (
    component
  )
}

export default PrePOLogo
