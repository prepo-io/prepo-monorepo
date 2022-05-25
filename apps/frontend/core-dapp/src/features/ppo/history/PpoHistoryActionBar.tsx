import { Button, Flex, media, spacingIncrement, Typography } from '@prepo-io/ui'
import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import { CSVLink } from 'react-csv'
import { useEffect } from 'react'
import { filterTypes } from './ppo-history.types'
import { useRootStore } from '../../../context/RootStoreProvider'
import FilterModal from '../../../components/Filter'

const StyledButton = styled(Button)<{ disabled?: boolean }>`
  &&&& {
    flex: 1;
    .ant-btn {
      border-color: ${({ theme }): string => theme.color.neutral7};
      padding: 0;
      width: 100%;
      ${media.desktop`
        padding: 0 ${spacingIncrement(32)};
      `}
    }
    .ant-btn:hover {
      border-color: ${({ disabled, theme }): string =>
        disabled ? theme.color.neutral7 : theme.color.primary};
    }
    ${media.desktop`
      flex: 0;
    `}
  }
`

const PpoHistoryActionBar: React.FC = () => {
  const {
    ppoHistoryStore: { dataForExport },
    filterStore: { changeFilterTypes, setIsFilterOpen },
  } = useRootStore()

  useEffect(() => {
    changeFilterTypes(filterTypes)
  }, [changeFilterTypes])

  return (
    <Flex gap={{ phone: 20, desktop: 32 }} justifyContent="flex-end" my={30}>
      <FilterModal showMarkets={false} />
      <StyledButton disabled={dataForExport.length === 0}>
        <CSVLink data={dataForExport} filename="ppo_history_data">
          <Typography variant="text-medium-md" color="neutral1">
            Export CSV
          </Typography>
        </CSVLink>
      </StyledButton>

      <StyledButton onClick={(): void => setIsFilterOpen(true)}>
        <Typography variant="text-medium-md" color="neutral1">
          Filter
        </Typography>
      </StyledButton>
    </Flex>
  )
}

export default observer(PpoHistoryActionBar)
