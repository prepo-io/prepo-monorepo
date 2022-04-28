import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import EnterpriseCard from '../../components/EnterpriseCard'
import EnterpriseCarousel, { OverlayProps } from '../../components/EnterpriseCarousel'
import { useRootStore } from '../../context/RootStoreProvider'
import { centered, spacingIncrement } from '../../utils/theme/utils'
import { isEnterpriseLoaded, isFirstEnterpriseLoaded } from '../../utils/enterprise-utils'
import LoadingCarouselCard from '../../components/LoadingCarouselCard'
import { Enterprise } from '../../types/enterprise.types'

const Wrapper = styled.div`
  margin-bottom: ${spacingIncrement(44)};
  position: relative;
  width: 100%;
`

const SearchByIdWrapper = styled.div`
  ${centered}
  width: 100%;
`

const Competition: React.FC = () => {
  const { competitionStore } = useRootStore()
  const { competitionEnterprises, searchCompetitionQuery, activeEnterpriseId, onSlidesChange } =
    competitionStore

  const doneLoading = (): boolean => isFirstEnterpriseLoaded(competitionEnterprises)

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

  const showEnterpriseCard = (enterprise: Enterprise | undefined): React.ReactNode =>
    enterprise && isEnterpriseLoaded(enterprise) ? (
      <EnterpriseCard
        active={enterprise !== undefined && enterprise.id === activeEnterpriseId}
        enterprise={enterprise}
        isCompetitor
      />
    ) : (
      <LoadingCarouselCard />
    )

  return (
    <Wrapper>
      {competitionEnterprises !== undefined &&
      doneLoading() &&
      competitionEnterprises.length === 0 &&
      competitionEnterprises[0] ? (
        <SearchByIdWrapper>
          <EnterpriseCard active enterprise={competitionEnterprises[0]} isCompetitor />
        </SearchByIdWrapper>
      ) : (
        <EnterpriseCarousel
          enterprises={
            doneLoading()
              ? competitionEnterprises?.map((enterprise) => ({
                  id: enterprise.id,
                  component: showEnterpriseCard(enterprise),
                }))
              : undefined
          }
          loading={Boolean(searchCompetitionQuery) && competitionEnterprises === undefined}
          onActiveSlidesChange={onSlidesChange}
          overlay={overlay()}
        />
      )}
    </Wrapper>
  )
}

export default observer(Competition)
