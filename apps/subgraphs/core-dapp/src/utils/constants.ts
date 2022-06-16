import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'

// ... addresses ...
export const COLLATERAL_TOKEN_ADDRESS = '0xab7f09a1bd92ae0508884e6ab02a7a11df83512d'

// ... numbers ...
export const DEFAULT_LONG_SHORT_DECIMALS = 18
export const ONE_BI = BigInt.fromI32(1)
export const ZERO_BI = BigInt.fromI32(0)
export const ZERO_BD = BigDecimal.fromString('0')

// ... transactions ...
// wasm/assemblyscript can't compile objects nor enum
// so we must set these separately

export const EVENTS_TRANSFER = 'TRANSFER'

export const ACTIONS_SEND = 'SEND'
export const ACTIONS_RECEIVE = 'RECEIVE'
