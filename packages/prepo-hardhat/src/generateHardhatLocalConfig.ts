export type HardhatLocalConfig = {
  MNEMONIC: string
  INFURA_API_KEY: string
  ETHERSCAN_API_KEY: string
  OPTIMISTIC_ETHERSCAN_API_KEY: string
  POLYGONSCAN_API_KEY: string
}

export const generateHardhatLocalConfig = (): HardhatLocalConfig => ({
  MNEMONIC: process.env.MNEMONIC ?? 'test test test test test test test test test test test junk',
  INFURA_API_KEY: process.env.INFURA_API_KEY ?? 'test',
  ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY ?? 'test',
  OPTIMISTIC_ETHERSCAN_API_KEY: process.env.OPTIMISTIC_ETHERSCAN_API_KEY ?? 'test',
  POLYGONSCAN_API_KEY: process.env.POLYGONSCAN_API_KEY ?? 'test',
})
