import { Skeleton } from 'antd'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import styled, { Color } from 'styled-components'
import { useRootStore } from '../../context/RootStoreProvider'
import { spacingIncrement } from '../../utils/theme/utils'

const NoWrap = styled.span<{ color?: keyof Color }>`
  whitespace: no-wrap;
`

const RedText = styled(NoWrap)`
  color: ${({ theme }): string => theme.color.error};
`

const Title = styled.div`
  font-size: ${({ theme }): string => theme.fontSize.md};
  line-height: 1.6;
`

const WhiteText = styled(NoWrap)`
  color: ${({ theme }): string => theme.color.white};
`

const Wrapper = styled.div`
  color: ${({ theme }): string => theme.color.accentPrimary};
  font-weight: ${({ theme }): number => theme.fontWeight.extraBold};
  margin-bottom: ${spacingIncrement(40)};
  padding: 0 ${spacingIncrement(16)};
  text-align: center;
  .ant-skeleton-button-sm {
    height: ${spacingIncrement(19)};
  }
`

const RemainingEnterprises: React.FC = () => {
  const { acquisitionRoyaleContractStore } = useRootStore()
  const { burntCount, remainingEnterprises } = acquisitionRoyaleContractStore

  const burnt = useMemo(() => {
    if (burntCount === undefined) {
      return <Skeleton.Button size="small" active />
    }
    return <RedText>{burntCount}</RedText>
  }, [burntCount])

  const remaining = useMemo(() => {
    if (remainingEnterprises === undefined) {
      return <Skeleton.Button size="small" active />
    }
    return <WhiteText>{remainingEnterprises}</WhiteText>
  }, [remainingEnterprises])

  return (
    <Wrapper>
      <Title>
        <RedText>Enterprises Eliminated:</RedText> {burnt}{' '}
      </Title>
      <Title>
        <WhiteText>Enterprises Remaining:</WhiteText> {remaining}{' '}
      </Title>
    </Wrapper>
  )
}

export default observer(RemainingEnterprises)
