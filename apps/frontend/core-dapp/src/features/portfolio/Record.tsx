import { Button, Icon, IconName, media, spacingIncrement, Subtitle } from 'prepo-ui'
import { useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'
import styled from 'styled-components'
import Link from '../../components/Link'
import Percent from '../../components/Percent'
import { numberFormatter } from '../../utils/numberFormatter'
import { PositionType } from '../../utils/prepo.types'
import PositionLabel from '../position/PositionLabel'

const { toUsd } = numberFormatter

type Data = {
  amount?: number | string
  label: string
  percent?: number
  toolTip?: string
  usd?: boolean
}

type Props = {
  nameRedirectUrl: string
  iconName: IconName
  name: string
  position?: PositionType
  data: Data[]
  onButtonClicked?: () => unknown
  buttonLabel: string
}

const Body = styled.div`
  margin-top: ${spacingIncrement(17)};
  ${media.largeDesktop`
    display: none;
  `}
`

const ButtonContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;

  &&&& {
    .ant-btn {
      background-color: ${({ theme }): string => theme.color.primaryAccent};
      border: none;
    }
  }
`

const HideOnDesktop = styled.div`
  display: flex;
  ${media.largeDesktop`
        display: none;
    `}
`

const HideOnMobile = styled.div`
  display: none;
  ${media.largeDesktop`
        display: flex;
    `}
`

const MainRow = styled.div`
  align-items: center;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  justify-content: space-between;
  ${media.largeDesktop`
  grid-template-columns: 4fr 3fr 3fr 4fr;
    span {
      font-size: ${({ theme }): string => theme.fontSize.md};
    }
  `}
`

const Name = styled.p`
  color: ${({ theme }): string => theme.color.secondary};
  font-size: ${({ theme }): string => theme.fontSize.base};
  font-weight: ${({ theme }): number => theme.fontWeight.semiBold};
  margin-bottom: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  ${media.desktop`
    font-size: ${({ theme }): string => theme.fontSize.lg};
  `}
  ${media.largeDesktop`
    font-size: ${({ theme }): string => theme.fontSize.md};
  `}
`

const NameLink = styled(Link)`
  align-items: center;
  display: flex;
  gap: ${spacingIncrement(10)};
  :hover {
    p {
      color: ${({ theme }): string => theme.color.primary};
    }
  }
`

const PositionWrapper = styled.div`
  color: ${({ theme }): string => theme.color.neutral3};
  font-size: ${({ theme }): string => theme.fontSize.sm};
  font-weight: ${({ theme }): number => theme.fontWeight.medium};
  ${media.largeDesktop`
    margin-top: ${spacingIncrement(8)};
  `}
`

const ResponsiveData = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  ${media.largeDesktop`
    align-items: start;
    flex-direction: column;
    justify-content: center;
  `}
`

const ResponsiveDataValue = styled.div`
  align-items: center;
  color: ${({ theme }): string => theme.color.neutral1};
  display: flex;
  font-weight: ${({ theme }): number => theme.fontWeight.semiBold};
  text-align: right;
  p {
    margin-bottom: ${spacingIncrement(0)};
  }
  ${media.largeDesktop`
    text-align: left;
    font-size: ${({ theme }): string => theme.fontSize.base};
    white-space: nowrap;
  `}
`

const StyledButton = styled(Button)`
  ${media.largeDesktop`
    width: 100%;
  `}
`

const StyledPositionlabel = styled(PositionLabel)`
  display: inline-block;
  font-size: ${({ theme }): string => theme.fontSize.sm};
`

const StyledSubtitle = styled(Subtitle)`
  font-size: ${({ theme }): string => theme.fontSize.sm};
  font-weight: ${({ theme }): number => theme.fontWeight.medium};
  ${media.largeDesktop`
    margin-bottom: ${spacingIncrement(8)};
  `}
`

const Wrapper = styled.div`
  border-bottom: 1px solid ${({ theme }): string => theme.color.accent1};
  padding: ${spacingIncrement(14)} ${spacingIncrement(20)};
  &:last-child {
    border-bottom: none;
  }
`
const Record: React.FC<Props> = ({
  name,
  nameRedirectUrl,
  iconName,
  position,
  data,
  onButtonClicked,
  buttonLabel,
}) => {
  const renderData = useMemo(
    () =>
      data.map(({ label, toolTip, amount, percent, usd = true }) => ({
        id: `${label}_${amount}_${percent}`,
        content: (
          <ResponsiveData key={label}>
            <StyledSubtitle tooltip={toolTip}>{label}</StyledSubtitle>
            <ResponsiveDataValue>
              {amount === undefined ? (
                <Skeleton height={20} width={60} />
              ) : (
                <p>{usd ? toUsd(amount) : amount}&nbsp;</p>
              )}
              {percent !== undefined && (
                <Percent
                  showPlusSign
                  value={percent}
                  percentagePrecision={2}
                  format={(percentValue): string => `(${percentValue})`}
                />
              )}
            </ResponsiveDataValue>
          </ResponsiveData>
        ),
      })),
    [data]
  )

  return (
    <Wrapper>
      <MainRow>
        <div
          style={{
            minWidth: 0,
          }}
        >
          <NameLink href={nameRedirectUrl}>
            <Icon name={iconName} height="30px" width="30px" />
            <Name>{name}</Name>
          </NameLink>
          {position !== undefined && (
            <HideOnMobile>
              <PositionWrapper>
                Position:&nbsp;
                <StyledPositionlabel positionType={position}>{position}</StyledPositionlabel>
              </PositionWrapper>
            </HideOnMobile>
          )}
        </div>
        {renderData.map(({ content, id }) => (
          <HideOnMobile key={id}>{content}</HideOnMobile>
        ))}
        <ButtonContainer>
          <StyledButton
            onClick={onButtonClicked}
            block
            sizes={{
              desktop: {
                height: 54,
                fontSize: 'md',
              },
              mobile: {
                height: 38,
                fontSize: 'base',
              },
            }}
          >
            {buttonLabel}
          </StyledButton>
        </ButtonContainer>
      </MainRow>
      {position !== undefined && (
        <HideOnDesktop>
          <PositionWrapper>
            <StyledPositionlabel positionType={position}>{position}</StyledPositionlabel>
          </PositionWrapper>
        </HideOnDesktop>
      )}
      <Body>
        {renderData.map(({ content, id }) => (
          <HideOnDesktop key={id}>{content}</HideOnDesktop>
        ))}
      </Body>
    </Wrapper>
  )
}

export default Record
