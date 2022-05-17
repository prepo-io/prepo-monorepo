import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { bordered, centered, spacingIncrement } from '../../utils/theme/utils'
import Input from '../../components/Input'
import { useRootStore } from '../../context/RootStoreProvider'
import Button from '../../components/Button'

type Props = {
  label?: string
  hideRandom?: boolean
}

const StyledRandomButton = styled.div`
  ${bordered}
  margin-left: ${spacingIncrement(4)};
`

const InputButtonWrapper = styled.div`
  align-items: center;
  display: flex;
  width: 100%;
`

const InnerWrapper = styled.form`
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
  width: 100%;
`

const SearchCompetition: React.FC<Props> = ({ label, hideRandom }) => {
  const { competitionStore } = useRootStore()
  const {
    competitionLoading,
    findRandomEnterprise,
    localQuery,
    setLocalQuery,
    searching,
    searchCompetition,
    validSearchQuery,
  } = competitionStore

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault()
    searchCompetition()
  }

  return (
    <Wrapper>
      <InnerWrapper onSubmit={handleSearch}>
        <Labels>{label}</Labels>
        <InputButtonWrapper>
          <Input
            onChange={(e): void => setLocalQuery(e.target.value)}
            placeholder="Wallet address/Enterprise ID"
            value={searching ? 'Searching...' : localQuery}
            buttonProps={{
              children: 'Search',
              disabled: competitionLoading || !validSearchQuery,
              onClick: searchCompetition,
            }}
          />
          {!hideRandom && (
            <StyledRandomButton>
              <Button disabled={competitionLoading} onClick={(): void => findRandomEnterprise()}>
                🔀 Random
              </Button>
            </StyledRandomButton>
          )}
        </InputButtonWrapper>
      </InnerWrapper>
    </Wrapper>
  )
}

export default observer(SearchCompetition)
