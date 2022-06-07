import styled from 'styled-components'
import { media, spacingIncrement, Subtitle, Button } from 'prepo-ui'
import Skeleton from 'react-loading-skeleton'
import PositionLabel from './PositionLabel'
import Table from '../../components/Table'
import MarketIconTitle from '../../components/MarketIconTitle'
import Percent from '../../components/Percent'
import { Position } from '../portfolio/PortfolioStore'
import { useRootStore } from '../../context/RootStoreProvider'
import { formatUsd } from '../../utils/number-utils'

type Props = { position: Required<Position> }

type TableData = {
  amount: number
  label: string
  percent?: number
  toolTip?: string
  usd?: boolean
}

const Wrapper = styled.div`
  border-bottom: 1px solid ${({ theme }): string => theme.color.accent1};
  padding: ${spacingIncrement(14)} ${spacingIncrement(20)};
  &:last-child {
    border-bottom: none;
  }
`

const FlexWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  ${media.largeDesktop`
    span {
      font-size: ${({ theme }): string => theme.fontSize.md};
    }
  `}
`

const Body = styled.div`
  margin-top: ${spacingIncrement(17)};
  ${media.largeDesktop`
    display: none;
  `}
`

const ResponsiveData = styled.div`
  display: none;
  ${media.largeDesktop`
    display: flex;
    flex-direction: column;
    justify-content: center;
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

const ResponsiveDataValue = styled.div`
  align-items: center;
  color: ${({ theme }): string => theme.color.neutral1};
  display: flex;
  font-size: ${({ theme }): string => theme.fontSize.md};
  font-weight: ${({ theme }): number => theme.fontWeight.semiBold};
  p {
    margin-bottom: ${spacingIncrement(8)};
  }
`

const MobilePositionLabel = styled(PositionLabel)`
  ${media.largeDesktop`
    display: none;
  `}
`

const PositionWrapper = styled.div`
  color: ${({ theme }): string => theme.color.neutral3};
  display: none;
  font-size: ${({ theme }): string => theme.fontSize.sm};
  font-weight: ${({ theme }): number => theme.fontWeight.medium};
  margin-top: ${spacingIncrement(8)};
  ${media.largeDesktop`
    display: flex;
  `}
`

const StyledSubtitle = styled(Subtitle)`
  font-size: ${({ theme }): string => theme.fontSize.sm};
  font-weight: ${({ theme }): number => theme.fontWeight.medium};
  margin-bottom: ${spacingIncrement(8)};
`

const StyledPositionlabel = styled(PositionLabel)`
  display: inline-block;
  font-size: ${({ theme }): string => theme.fontSize.sm};
`

const IconTitleWrapper = styled(MarketIconTitle)`
  ${media.largeDesktop`
    &&& {
      div:first-child, svg {
        height: ${spacingIncrement(28)};
        width: ${spacingIncrement(28)};
      }
    }
  `}
`

const IconTitleSkeleton = styled.div`
  align-items: center;
  display: grid;
  grid-column-gap: ${spacingIncrement(10)};
  grid-template-columns: ${spacingIncrement(28)} auto;
`

export const PositionItemSkeleton: React.FC = () => (
  <Wrapper>
    <FlexWrapper>
      <div>
        <IconTitleSkeleton>
          <Skeleton circle height={28} width={28} />
          <Skeleton height={20} width={80} />
        </IconTitleSkeleton>
        <Skeleton height={20} width={80} />
      </div>
      <div>
        <ResponsiveData>
          <Skeleton height={20} width={80} />
          <Skeleton height={20} width={60} />
        </ResponsiveData>
      </div>
      <Skeleton height={54} width={152} />
    </FlexWrapper>
    <Body>
      <FlexWrapper>
        <Skeleton height={20} width={80} />
        <Skeleton height={20} width={60} />
      </FlexWrapper>
    </Body>
  </Wrapper>
)

const PositionItem: React.FC<Props> = ({ position }) => {
  const { portfolioStore } = useRootStore()
  const { setSelectedPosition } = portfolioStore
  const handleClosePosition = (): void => {
    setSelectedPosition(position)
  }

  const { market, position: direction, data } = position

  const tableData: TableData[] = [
    {
      label: 'Total Value',
      amount: data.totalValue,
      usd: true,
    },
  ]

  return (
    <Wrapper>
      <FlexWrapper>
        <div>
          <IconTitleWrapper iconName={market.iconName} size="md">
            {market.name}
          </IconTitleWrapper>
          <PositionWrapper>
            Position:&nbsp;
            <StyledPositionlabel positionType={direction} />
          </PositionWrapper>
        </div>
        {tableData.map(({ label, toolTip, amount, percent }) => (
          <ResponsiveData key={label}>
            <StyledSubtitle tooltip={toolTip}>{label}</StyledSubtitle>
            <ResponsiveDataValue>
              <p>{formatUsd(amount, true)}&nbsp;</p>
              {percent !== undefined && (
                <Percent
                  showPlusSign
                  value={percent}
                  percentagePrecision={0}
                  format={(percentValue): string => `(${percentValue})`}
                />
              )}
            </ResponsiveDataValue>
          </ResponsiveData>
        ))}
        <ButtonContainer>
          <Button
            onClick={handleClosePosition}
            sizes={{
              desktop: {
                height: 54,
                fontSize: 'md',
              },
              mobile: {
                height: 38,
                fontSize: 'xs',
              },
            }}
          >
            Close position
          </Button>
        </ButtonContainer>
      </FlexWrapper>
      <MobilePositionLabel positionType={direction}>{direction}</MobilePositionLabel>
      <Body>
        <Table data={tableData} hideBorder padding="sm" />
      </Body>
    </Wrapper>
  )
}

export default PositionItem
