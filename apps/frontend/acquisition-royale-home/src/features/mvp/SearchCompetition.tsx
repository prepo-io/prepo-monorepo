import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { centered, spacingIncrement } from '../../utils/theme/utils'
import Input from '../../components/Input'
import { useRootStore } from '../../context/RootStoreProvider'

type Props = {
  label?: string
}

const InnerWrapper = styled.form`
  max-width: ${spacingIncrement(400)};
  width: 100%;
`

const Labels = styled.p`
  color: ${({ theme }): string => theme.color.white};
  font-size: ${({ theme }): string => theme.fontSize.base};
  font-weight: ${({ theme }): number => theme.fontWeight.bold};
  margin-bottom: ${spacingIncrement(8)};
  text-align: center;
`

const Wrapper = styled.div`
  ${centered}
  margin-bottom: ${spacingIncrement(18)};
`

const SearchCompetition: React.FC<Props> = ({ label }) => {
  const { competitionStore } = useRootStore()
  const {
    competitionEnterprises,
    localQuery,
    setLocalQuery,
    searchCompetition,
    searchCompetitionQuery,
  } = competitionStore

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault()
    searchCompetition()
  }
  return (
    <Wrapper>
      <InnerWrapper onSubmit={handleSearch}>
        <Labels>{label}</Labels>
        <Input
          onChange={(e): void => setLocalQuery(e.target.value)}
          placeholder="Wallet address/Enterprise ID"
          value={localQuery}
          buttonProps={{
            children: 'Search',
            disabled: Number.isNaN(+localQuery),
            onClick: searchCompetition,
            loading: Boolean(searchCompetitionQuery) && competitionEnterprises === undefined,
          }}
        />
      </InnerWrapper>
    </Wrapper>
  )
}

export default observer(SearchCompetition)
