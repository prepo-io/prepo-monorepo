import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import SearchCompetition from './SearchCompetition'
import EnterpriseCarousel, { OverlayProps } from '../../components/EnterpriseCarousel'
import { useRootStore } from '../../context/RootStoreProvider'
import { spacingIncrement } from '../../utils/theme/utils'

const Wrapper = styled.div`
  margin-bottom: ${spacingIncrement(44)};
  position: relative;
  width: 100%;
`

const Competition: React.FC = () => {
  const { competitionStore } = useRootStore()
  const { activeIndex, competitionEnterprises, searchCompetitionQuery, onSlidesChange } =
    competitionStore

  const overlay = (): OverlayProps | undefined => {
    // if searchCompetitionQuery is empty, user hasn't searched anything
    if (!searchCompetitionQuery) {
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

  return (
    <Wrapper>
      <SearchCompetition />
      <EnterpriseCarousel
        activeIndex={activeIndex}
        enterprises={competitionEnterprises}
        loading={Boolean(searchCompetitionQuery) && competitionEnterprises === undefined}
        onActiveSlidesChange={onSlidesChange}
        overlay={overlay()}
      />
    </Wrapper>
  )
}

export default observer(Competition)
