import { add } from 'date-fns'
import { makeAutoObservable } from 'mobx'
import { RootStore } from '../../stores/RootStore'
import { Market } from '../../types/market.types'

export enum FilterType {
  All = 'All',
  OpenedShort = 'Opened Short',
  ClosedShort = 'Closed Short',
  OpenedLong = 'Opened Long',
  ClosedLong = 'Closed Long',
  AddedLiquidity = 'Added Liquidity',
  RemovedLiquidity = 'Removed Liquidity',
  Withdrawn = 'Withdrawn',
  Deposited = 'Deposited',
}

const filterTypes: string[] = [
  FilterType.All,
  FilterType.OpenedShort,
  FilterType.ClosedShort,
  FilterType.OpenedLong,
  FilterType.ClosedLong,
  FilterType.AddedLiquidity,
  FilterType.RemovedLiquidity,
  FilterType.Withdrawn,
  FilterType.Deposited,
]

type SelectedMarket = 'All' | Market

type FilterOptions = {
  selectedMarket: SelectedMarket
  dateRange: {
    start: Date | undefined
    end: Date | undefined
  }
  confirmedDateRange: {
    start: Date | undefined
    end: Date | undefined
  }
  selectedFilterTypes: string[]
}

export class FilterStore {
  root: RootStore
  isFilterOpen = false
  isCalendarOpen = false
  filterTypes = filterTypes
  filterOptions: FilterOptions = {
    selectedMarket: 'All',
    dateRange: {
      start: add(new Date(), { weeks: -1 }),
      end: new Date(),
    },
    confirmedDateRange: {
      start: add(new Date(), { weeks: -1 }),
      end: new Date(),
    },
    selectedFilterTypes: [FilterType.All],
  }

  changeFilterTypes = (types: string[] = filterTypes): void => {
    this.filterTypes = types
    this.filterOptions.selectedFilterTypes = [types[0]]
  }

  constructor(root: RootStore) {
    this.root = root
    makeAutoObservable(this)
  }

  setIsFilterOpen = (isFilterOpen: boolean): void => {
    this.isFilterOpen = isFilterOpen
  }

  setIsCalendarOpen(isCalendarOpen: boolean): void {
    this.isCalendarOpen = isCalendarOpen
  }

  setSelectedMarket(selectedMarket: SelectedMarket): void {
    this.filterOptions.selectedMarket = selectedMarket
  }

  setSelectedFilterTypes = (selectedFilterTypes: string[]): void => {
    this.filterOptions.selectedFilterTypes = selectedFilterTypes
  }

  setDateRange(dateRange: { start: Date | undefined; end: Date | undefined }): void {
    this.filterOptions.dateRange = dateRange
  }

  resetFilters(): void {
    this.filterOptions = {
      selectedMarket: 'All',
      dateRange: {
        start: add(new Date(), { weeks: -1 }),
        end: new Date(),
      },
      confirmedDateRange: {
        start: add(new Date(), { weeks: -1 }),
        end: new Date(),
      },
      selectedFilterTypes: [this.filterTypes[0]],
    }
  }

  useConfirmedDateRange(): void {
    const { start, end } = this.filterOptions.confirmedDateRange
    if (start && end) {
      this.filterOptions.dateRange = { start, end }
    }
  }

  confirmDateRange(): void {
    const { start, end } = this.filterOptions.dateRange
    if (!start || !end) {
      return
    }
    this.filterOptions.confirmedDateRange = { start, end }
  }
}
