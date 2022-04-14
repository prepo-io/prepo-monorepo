import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import Icon from './icon'
import Input, { InputProps } from './Input'
import { spacingIncrement } from '../utils/theme/utils'
import { useOnClickOutside } from '../hooks/useOnClickOutside'
import { Z_INDEX } from '../utils/theme/general-settings'

export type Option = {
  // unique identifier for each option, that is used to identify selected item
  id: string | number
  // value that is passed when option is selected
  value: unknown
  // content to be displayed in the dropdown
  displayContent: React.ReactNode
  // value to put in input box when it's selected
  searchValue: string | number
  // stringified filter value used to compare against search value
  filterValue?: string
}

export type Props = Omit<InputProps, 'onSelect'> & {
  options?: Option[]
  onClear?: () => void
  onSearchChange?: (query: string) => unknown
  onSelect?: (value: unknown) => void
  shouldClear?: boolean
}

const ArrowWrapper = styled.div`
  cursor: pointer;
  padding-left: ${spacingIncrement(8)};
  padding-right: ${spacingIncrement(16)};
`

const OptionWrapper = styled.div<{ selected: boolean }>`
  background-color: ${({ selected, theme }): string =>
    selected ? theme.color.accentPrimary : theme.color.secondary};
  color: ${({ selected, theme }): string =>
    selected ? theme.color.secondary : theme.color.darkGrey};
  cursor: pointer;
  line-height: 1;
  padding: ${spacingIncrement(7)} ${spacingIncrement(25)};
  transition: 0.3s;
  :first-child {
    padding-top: ${spacingIncrement(16)};
  }
  :last-child {
    padding-bottom: ${spacingIncrement(16)};
  }
  :hover {
    background-color: ${({ theme }): string => theme.color.accentPrimary};
    color: ${({ theme }): string => theme.color.secondary};
  }
`

const VirtualListContainer = styled.div<{ showDropdown: boolean }>`
  ${({ showDropdown, theme }): string => {
    if (showDropdown) {
      return `
        border: solid 1px ${theme.color.accentPrimary};
        max-height: ${spacingIncrement(110)};
    `
    }

    return `
        border: solid 0px ${theme.color.accentPrimary};;
        max-height: 0;
    `
  }}
  background-color: ${({ theme }): string => theme.color.secondary};
  letter-spacing: 2px;
  margin-top: ${spacingIncrement(8)};
  overflow-y: auto;
  padding: 0;
  position: absolute;
  transition: 0.3s;
  width: 100%;
  z-index: ${Z_INDEX.selectDropdown};
`

const NothingText = styled.p`
  color: ${({ theme }): string => theme.color.grey};
  margin: 0;
  padding: ${spacingIncrement(20)};
  text-align: center;
`

const Wrapper = styled.div`
  font-family: ${({ theme }): string => theme.fontFamily.secondary};
  position: relative;
  width: 100%;
`

const Select: React.FC<Props> = ({
  onClear,
  onFocus,
  onSearchChange,
  onSelect,
  options,
  shouldClear,
  ...props
}) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false)
  const [searchValue, setSearchValue] = useState('')
  const [selectedId, setSelectedId] = useState<number | string | undefined>(undefined)

  const selectRef = useRef(null)

  useOnClickOutside(selectRef, () => setShowDropdown(false))

  const handleFocus = useCallback<typeof onFocus>(
    (e): void => {
      setShowDropdown(true)
      if (onFocus) {
        onFocus(e)
      }
    },
    [onFocus]
  )

  const handleSelect = useCallback(
    (option: Option): void => {
      setShowDropdown(false)
      setSelectedId(option.id)
      setSearchValue(option.searchValue.toString())
      if (onSelect) {
        onSelect(option.value)
      }
    },
    [onSelect]
  )

  const handleClear = useCallback(
    (value?: string) => {
      if (value === undefined) setSearchValue('')
      setSelectedId(undefined)
      if (typeof onClear === 'function') {
        onClear()
      }
    },
    [onClear]
  )

  const handleSearchValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target
      setSearchValue(value)
      handleClear(value)
      if (typeof onSearchChange === 'function') {
        onSearchChange(value)
      }
    },
    [handleClear, onSearchChange]
  )

  useEffect(() => {
    if (shouldClear) {
      handleClear()
    }
  }, [handleClear, shouldClear])

  return (
    <Wrapper ref={selectRef}>
      <Input
        onFocus={handleFocus}
        onChange={handleSearchValueChange}
        onClear={handleClear}
        suffix={
          <ArrowWrapper onClick={(): void => setShowDropdown(!showDropdown)}>
            <Icon name={showDropdown ? 'upArrow' : 'downArrow'} />
          </ArrowWrapper>
        }
        value={searchValue}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      />
      {options && (
        <VirtualListContainer showDropdown={showDropdown}>
          {options.length > 0 ? (
            options.map((option) => {
              const selected = option.id === selectedId
              if (
                selectedId === undefined &&
                option.filterValue !== undefined &&
                searchValue.length > 0 &&
                !option.filterValue.toLowerCase().includes(searchValue.toLowerCase())
              ) {
                return null
              }
              return (
                <OptionWrapper
                  aria-selected={false}
                  key={option.id}
                  onClick={(): void => handleSelect(option)}
                  onKeyPress={(): void => handleSelect(option)}
                  role="option"
                  selected={selected}
                  tabIndex={0}
                >
                  {option.displayContent}
                </OptionWrapper>
              )
            })
          ) : (
            <NothingText>Nothing found</NothingText>
          )}
        </VirtualListContainer>
      )}
    </Wrapper>
  )
}

export default Select
