import { Icon, media, spacingIncrement } from 'prepo-ui'
import styled from 'styled-components'
import { NavigationItemType } from './Hamburger/hamburger.types'

const SocialMediaItemWrapper = styled.div`
  border: 1px solid ${({ theme }): string => theme.color.neutral7};
  border-radius: 4px;
  cursor: pointer;
  margin-right: ${spacingIncrement(24)};
  padding: ${spacingIncrement(8)};
  a {
    > div {
      align-items: center;
      display: flex;
      justify-content: center;
    }
  }

  &:last-child {
    margin-right: 0;
  }

  &:hover {
    background-color: ${({ theme }): string => theme.color.primary};

    svg path {
      fill: ${({ theme }): string => theme.color.white};
    }
  }

  ${media.desktop`
    border: none;
  `}
`

const SocialMediaItem: React.FC<NavigationItemType> = ({ href, iconName }) => (
  <SocialMediaItemWrapper>
    <a href={href} target="_blank" rel="noreferrer">
      <Icon name={iconName} color="neutral5" height="20" width="20" />
    </a>
  </SocialMediaItemWrapper>
)

export default SocialMediaItem
