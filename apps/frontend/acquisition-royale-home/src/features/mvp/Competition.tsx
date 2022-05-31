import { useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import MoatMessage from './protection/MoatMessage'
import ImmunityMessage from './protection/ImmunityMessage'
import SearchCompetition from './SearchCompetition'
import EnterpriseCarousel, { OverlayProps } from '../../components/EnterpriseCarousel'
import { useRootStore } from '../../context/RootStoreProvider'
import { spacingIncrement } from '../../utils/theme/utils'

type Props = {
  label?: string
  hideRandom?: boolean
}
const Wrapper = styled.div`
  margin-top: ${spacingIncrement(20)};
  position: relative;
  width: 100%;
`

const Competition: React.FC<Props> = ({ label, hideRandom }) => {
  const { competitionStore } = useRootStore()
  const {
    activeIndex,
    competitionLoading,
    competitionEnterprises,
    competitionActiveEnterprise,
    searchCompetitionQuery,
    onSlidesChange,
  } = competitionStore

  const overlay = (): OverlayProps | undefined => {
    if (competitionLoading) return undefined
    // if searchCompetitionQuery is empty, user hasn't searched anything
    if (!searchCompetitionQuery && competitionEnterprises?.length === 0) {
      return {
        message: 'Search a wallet address or an enterprise ID above.',
      }
    }
    if (
      searchCompetitionQuery !== '' &&
      competitionEnterprises !== undefined &&
      competitionEnterprises.length === 0
    ) {
      return {
        message: 'We couldn’t find anything. Try search a different address or Enterprise ID.',
      }
    }
    return undefined
  }

  const protectionContent = useMemo(() => {
    if (!competitionActiveEnterprise) return null
    const { immune, immuneUntil, hasMoat, moatUntil } = competitionActiveEnterprise
    if (!immune && !hasMoat) return null
    return (
      <>
        <ImmunityMessage competition immune={immune} immuneUntil={immuneUntil} />
        <MoatMessage competition hasMoat={hasMoat} moatUntil={moatUntil} />
      </>
    )
  }, [competitionActiveEnterprise])

  return (
    <Wrapper>
      <SearchCompetition label={label} hideRandom={hideRandom} />
      <EnterpriseCarousel
        activeIndex={activeIndex}
        contentBelowCard={protectionContent}
        enterprises={competitionEnterprises}
        loading={competitionLoading}
        onActiveSlidesChange={onSlidesChange}
        overlay={overlay()}
      />
    </Wrapper>
  )
}

export default observer(Competition)
