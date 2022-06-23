import { Flex, Input, media, spacingIncrement } from 'prepo-ui'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { ZERO_ADDRESS } from 'prepo-constants'
import { CUSTOM_STYLE } from './TotalEarned'
import ButtonLink from '../ppo/ButtonLink'
import { Routes } from '../../lib/routes'
import { useRootStore } from '../../context/RootStoreProvider'
import AddressAvatar from '../delegate/AddressAvatar'
import { getShortAccount } from '../../utils/account-utils'

const PLACEHOLDER = getShortAccount(ZERO_ADDRESS) ?? ''

const InputWrapper = styled.div`
  flex: 1;
  span {
    font-size: ${({ theme }): string => theme.fontSize.sm};
    margin-bottom: ${spacingIncrement(5)};
    ${media.desktop`
      font-size: ${({ theme }): string => theme.fontSize.base};
    `}
  }
  &&&& {
    *,
    *:focus-within {
      border: none;
      box-shadow: none;
      margin-bottom: 0;
      padding: 0 ${spacingIncrement(4)};
    }
    input {
      padding: 0 ${spacingIncrement(4)};
      ::placeholder {
        color: ${({ theme }): string => theme.color.neutral5};
        font-weight: ${({ theme }): number => theme.fontWeight.medium};
      }
    }
  }
`

const LookupUser: React.FC = () => {
  const {
    delegateStore: { loading, customDelegate, onChangeEnsNameInput, ensInputValue },
  } = useRootStore()
  const disabled = loading || !customDelegate?.delegateAddress

  return (
    <Flex
      border="1px solid"
      borderColor="neutral7"
      borderRadius={4}
      justifyContent="space-between"
      py={11}
      px={22}
      gap={{ phone: 5, desktop: 15 }}
    >
      <InputWrapper>
        <Input
          prefix={
            <AddressAvatar
              loading={loading}
              address={customDelegate?.delegateAddress}
              avatarUrl={customDelegate?.avatar}
              avatarDiameter={{ desktop: 24, mobile: 24 }}
            />
          }
          label="Lookup User"
          placeholder={PLACEHOLDER}
          value={ensInputValue}
          onChange={onChangeEnsNameInput}
        />
      </InputWrapper>
      <ButtonLink
        disabled={disabled}
        customStyles={CUSTOM_STYLE}
        title="View Profile"
        href={`${Routes.Profile}?search=${ensInputValue}`}
      />
    </Flex>
  )
}

export default observer(LookupUser)
