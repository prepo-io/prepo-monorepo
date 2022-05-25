import { CHARACTERS_ON_WALLET } from '../lib/constants'

const TWELVE_CHARACTERS = CHARACTERS_ON_WALLET / 7
const THIRTY_FOUR_CHARACTERS = CHARACTERS_ON_WALLET / 2.5

export const getShortAccount = (
  account: string | null | undefined,
  size: 'small' | 'medium' = 'small'
): string | null => {
  const subtractValue = size === 'small' ? TWELVE_CHARACTERS : THIRTY_FOUR_CHARACTERS
  return account
    ? `${account.substring(0, subtractValue)}...${account.substring(
        account.length - (subtractValue + 1),
        account.length
      )}`
    : null
}

export const isEns = (name: string): boolean => name.endsWith('.eth')
