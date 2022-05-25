import { observer } from 'mobx-react-lite'
import { centered, media, spacingIncrement } from '@prepo-io/ui'
import styled from 'styled-components'
import { LabelWrapper } from './FilterModal'
import { FilterType } from './FilterStore'
import { useRootStore } from '../../context/RootStoreProvider'

const MainWrapper = styled.div`
  margin-top: ${spacingIncrement(24)};
`

const FilterItemsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${spacingIncrement(10)};
`

const SingleFilterItem = styled.div<{ selected?: boolean }>`
  ${centered}
  background-color: ${({ theme, selected }): string =>
    selected ? theme.color.neutral7 : theme.color.neutral9};
  border: 1px solid ${({ theme }): string => theme.color.neutral7};
  border-radius: ${({ theme }): number => theme.borderRadius}px;
  color: ${({ theme }): string => theme.color.neutral1};
  cursor: pointer;
  font-size: ${({ theme }): string => theme.fontSize.xs};
  height: ${spacingIncrement(31)};
  padding: 0 ${spacingIncrement(14)};
  ${media.desktop`
    font-size: ${({ theme }): string => theme.fontSize.sm};
    height: ${spacingIncrement(35)};
  `}
`

const MarketTypeSelection: React.FC = () => {
  const { filterStore } = useRootStore()
  const {
    filterTypes,
    filterOptions: { selectedFilterTypes },
  } = filterStore

  const onClick = (type: FilterType): void => {
    const newTypes = [...selectedFilterTypes]
    if (type === FilterType.All) {
      filterStore.setSelectedFilterTypes([FilterType.All])
    } else if (selectedFilterTypes.includes(type)) {
      newTypes.splice(newTypes.indexOf(type), 1)
      filterStore.setSelectedFilterTypes(newTypes)
    } else {
      if (selectedFilterTypes.includes(FilterType.All))
        newTypes.splice(newTypes.indexOf(FilterType.All), 1)
      newTypes.push(type)
      filterStore.setSelectedFilterTypes(newTypes)
    }
  }

  return (
    <MainWrapper>
      <LabelWrapper>Type</LabelWrapper>
      <FilterItemsWrapper>
        {filterTypes.map((type) => (
          <SingleFilterItem
            key={type}
            selected={selectedFilterTypes.includes(type)}
            onClick={(): void => onClick(type as FilterType)}
          >
            {type}
          </SingleFilterItem>
        ))}
      </FilterItemsWrapper>
    </MainWrapper>
  )
}

export default observer(MarketTypeSelection)
