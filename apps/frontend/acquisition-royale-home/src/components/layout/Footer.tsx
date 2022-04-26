import { Layout } from 'antd'
import styled from 'styled-components'
import { contentCss } from './utils'
import { centered, spacingIncrement } from '../../utils/theme/utils'
import Icon from '../icon'
import { media } from '../../utils/theme/media'
import config from '../../lib/config'

const { Footer: AFooter } = Layout

const Wrapper = styled.div`
  &&& {
    background-color: ${({ theme }): string => theme.color.backgroundGradientEnd};
    padding: ${spacingIncrement(24)} 0;
    .ant-layout-footer {
      align-items: center;
      background-color: inherit;
      display: flex;
      justify-content: space-between;
      ${contentCss}
      ${media.phone`
        flex-direction: column;
        padding-bottom: ${spacingIncrement(16)};
        text-align: center;
      `}
    }
  }
`

const InfoText = styled.div`
  color: ${({ theme }): string => theme.color.white};
  font-family: ${({ theme }): string => theme.fontFamily.secondary};
  font-size: ${({ theme }): string => theme.fontSize.base};
  letter-spacing: 1px;
  line-height: 1;
  margin-bottom: ${spacingIncrement(4)};
`

const LeftWrapper = styled.div`
  ${media.phone`
    margin-bottom: ${spacingIncrement(16)};
  `}
`

const RightWrapper = styled.div``

const TextLink = styled.a`
  color: ${({ theme }): string => theme.color.accentPrimary};
  font-size: ${({ theme }): string => theme.fontSize.lg};
  font-weight: ${({ theme }): number => theme.fontWeight.extraBold};
  text-align: center;
  :hover {
    color: ${({ theme }): string => theme.color.white};
  }
`

const LargerText = styled.span`
  font-size: ${({ theme }): string => theme.fontSize['4xl']};
`

const IconContainer = styled.div`
  display: flex;
  padding-top: ${spacingIncrement(8)};
`

const IconWrapper = styled(Icon)`
  ${centered}
  background-color: ${({ theme }): string => theme.color.accentPrimary};
  height: ${spacingIncrement(36)};
  margin: 0 ${spacingIncrement(13)};
  :nth-child(1) {
    margin: 0 ${spacingIncrement(13)} 0 0;
  }
  :nth-last-child(1) {
    margin: 0 0 0 ${spacingIncrement(13)};
  }
  width: ${spacingIncrement(36)};
  :hover {
    background-color: ${({ theme }): string => theme.color.white};
    cursor: pointer;
  }
`

const Footer: React.FC = () => {
  const onLinkClick = (link: string): void => {
    window.open(link, '_blank')
  }
  return (
    <Wrapper>
      <AFooter>
        <LeftWrapper>
          <InfoText>Find out more on</InfoText>
          <TextLink onClick={(): void => onLinkClick(config.LANDING_SITE)}>
            ACQUISITION
            <br />
            <LargerText>ROYALE</LargerText>
          </TextLink>
        </LeftWrapper>
        <RightWrapper>
          <IconContainer>
            <IconWrapper
              name="discord"
              color="primary"
              onClick={(): void => onLinkClick(config.DISCORD_SITE)}
            />
            <IconWrapper
              name="twitter"
              color="primary"
              onClick={(): void => onLinkClick(config.TWITTER_SITE)}
            />
            <IconWrapper
              name="medium"
              color="primary"
              onClick={(): void => onLinkClick(config.MEDIUM_SITE)}
            />
          </IconContainer>
        </RightWrapper>
      </AFooter>
    </Wrapper>
  )
}

export default Footer
