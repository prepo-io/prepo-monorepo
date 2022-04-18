export const getShortAccount = (account: string | null | undefined): string | null =>
  account
    ? `${account.substring(0, 4)}...${account.substring(account.length - 4, account.length)}`
    : null
