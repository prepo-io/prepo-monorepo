import { action, makeAutoObservable } from 'mobx'
import { DECIMAL_LIMIT } from '../../lib/constants'
import { Erc20Store } from '../../stores/entities/Erc20.entity'
import { MarketEntity } from '../../stores/entities/MarketEntity'
import { RootStore } from '../../stores/RootStore'
import { Position as PositionFromGraph } from '../../types/user.types'
import { normalizeDecimalPrecision } from '../../utils/number-utils'
import { PositionType } from '../../utils/prepo.types'
import { Direction } from '../trade/TradeStore'

export type Position = {
  market: MarketEntity
  position: PositionType
  data?: {
    costBasis?: number
    price: number
    pnl?: number
    token: Erc20Store
    tokenBalance: number
    totalValue: number
  }
}

const normalizeTotalValue = (value: number): number => (value < DECIMAL_LIMIT ? 0 : value)

export class PortfolioStore {
  selectedPosition?: Required<Position>

  constructor(public root: RootStore) {
    makeAutoObservable(this, {
      setSelectedPosition: action.bound,
    })
  }

  setSelectedPosition(position?: Required<Position>): void {
    this.selectedPosition = position
  }

  hasPosition(market: MarketEntity, direction: Direction): Position | undefined {
    const token = market[`${direction}Token`]
    const tokenBalance = market[`${direction}TokenBalance`]
    const tokenPrice = market[`${direction}TokenPrice`]
    const defaultValue = { market, position: direction }

    // loading
    if (!token || tokenBalance === undefined || tokenPrice === undefined) return defaultValue
    // no position
    if (tokenBalance === 0) return undefined
    // has position and calculate total value of user's position
    const totalValue = tokenBalance * tokenPrice
    const normalizedTotalValue = normalizeTotalValue(totalValue)
    if (normalizedTotalValue === 0) return undefined

    // pnl accounting
    let costBasis
    if (this.signerCostBasis) {
      const foundPosition = this.signerCostBasis.find(
        ({ token: { id } }) => id === token.address?.toLowerCase()
      )
      if (foundPosition) {
        costBasis = foundPosition.costBasis
      }
    }

    const pnl = costBasis === undefined ? undefined : tokenBalance * (tokenPrice - costBasis)
    const returnValue = {
      data: {
        costBasis,
        pnl,
        price: tokenPrice,
        token,
        tokenBalance,
        totalValue: normalizedTotalValue,
      },
      ...defaultValue,
    }

    return returnValue
  }

  get tradingPositions(): Position[] {
    const { marketStore } = this.root
    const { markets } = marketStore

    const positions: Position[] = []
    Object.values(markets).forEach((market) => {
      const longPosition = this.hasPosition(market, 'long')
      const shortPosition = this.hasPosition(market, 'short')

      if (longPosition) positions.push(longPosition)
      if (shortPosition) positions.push(shortPosition)
    })

    return positions
  }

  get positions(): Position[] {
    return [...this.tradingPositions]
  }

  get portfolioValue(): string | undefined {
    const { preCTTokenStore } = this.root
    if (
      this.tradingPositionsValue === undefined ||
      preCTTokenStore.tokenBalanceFormat === undefined
    )
      return undefined

    const tokenBalance = Number(preCTTokenStore.tokenBalanceFormat)
    const tradingPositionsAndBalance = Number(this.tradingPositionsValue) + tokenBalance

    if (Number.isNaN(tradingPositionsAndBalance)) return undefined

    return `${tradingPositionsAndBalance}`
  }

  get signerCostBasis(): PositionFromGraph[] | undefined {
    const { address } = this.root.web3Store
    if (!address) return []
    const output = this.root.coreGraphStore.positionsCostBasis(address)

    return output?.positions
  }

  get tradingPositionsValue(): number | undefined {
    if (this.positions === undefined) return undefined
    let valueSum = 0
    let minLoaded = false
    this.positions.forEach(({ data }) => {
      if (data) {
        minLoaded = true
        valueSum += Number(normalizeDecimalPrecision(`${data.totalValue}`))
      }
    })
    return minLoaded || this.positions.length === 0 ? valueSum : undefined
  }
}
