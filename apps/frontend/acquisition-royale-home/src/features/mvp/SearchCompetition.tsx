import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { centered, spacingIncrement } from '../../utils/theme/utils'
import Input from '../../components/Input'
import { useRootStore } from '../../context/RootStoreProvider'

const InnerWrapper = styled.form`
  max-width: ${spacingIncrement(400)};
  width: 100%;
`

const Wrapper = styled.div`
  ${centered}
`

const SearchCompetition: React.FC = () => {
  const [query, setQuery] = useState('')
  const { competitionStore } = useRootStore()
  const { competitionEnterprises, searchCompetition, searchCompetitionQuery } = competitionStore

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault()
    searchCompetition(query)
  }
  return (
    <Wrapper>
      <InnerWrapper onSubmit={handleSearch}>
        <Input
          onChange={(e): void => setQuery(e.target.value)}
          placeholder="Wallet address/Enterprise ID"
          value={query}
          buttonProps={{
            children: 'Search',
            disabled: Number.isNaN(+query),
            onClick: (): void => searchCompetition(query),
            loading: Boolean(searchCompetitionQuery) && competitionEnterprises === undefined,
          }}
        />
      </InnerWrapper>
    </Wrapper>
  )
}

export default observer(SearchCompetition)
