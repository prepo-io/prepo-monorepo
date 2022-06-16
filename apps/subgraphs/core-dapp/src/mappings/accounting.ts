import { Address, BigInt } from '@graphprotocol/graph-ts'
import { Pool, Position, Token } from '../generated/types/schema'
import { LongShortToken } from '../generated/types/templates/LongShortToken/LongShortToken'
import { CollateralToken } from '../generated/types/templates/UniswapV3Pool/CollateralToken'
import { Swap } from '../generated/types/templates/UniswapV3Pool/UniswapV3Pool'
import { ZERO_BD } from '../utils/constants'
import { convertTokenToDecimal, sqrtPriceX96ToTokenPrices } from '../utils/math'

export function updateLongShortPrices(event: Swap, pool: Pool): void {
  const isToken0 = pool.token === pool.token0
  const longShortToken = Token.load(pool.token)
  const collateralTokenAddress = Address.fromString(isToken0 ? pool.token1 : pool.token0)
  const collateralToken = CollateralToken.bind(collateralTokenAddress)
  const collateralDecimalsResult = collateralToken.try_decimals()

  pool.sqrtPriceX96 = event.params.sqrtPriceX96

  if (longShortToken !== null && !collateralDecimalsResult.reverted) {
    const collateralDecimals = BigInt.fromI32(collateralDecimalsResult.value)

    const token0Decimal = isToken0 ? longShortToken.decimals : collateralDecimals
    const token1Decimal = isToken0 ? collateralDecimals : longShortToken.decimals

    const prices = sqrtPriceX96ToTokenPrices(
      event.params.sqrtPriceX96,
      token0Decimal,
      token1Decimal
    )

    pool.token0Price = prices[0]
    pool.token1Price = prices[1]

    if (Address.fromString(longShortToken.id).equals(Address.fromString(pool.token0)))
      longShortToken.priceUSD = prices[1]
    if (Address.fromString(longShortToken.id).equals(Address.fromString(pool.token1)))
      longShortToken.priceUSD = prices[0]

    longShortToken.save()
  }

  pool.save()
}

export function updatePosition(ownerAddress: Address, tokenAddress: Address, amount: BigInt): void {
  const ownerAddressString = ownerAddress.toHexString()
  const tokenAddressString = tokenAddress.toHexString()
  const id = `${tokenAddressString}-${ownerAddressString}`

  const token = Token.load(tokenAddress.toHexString())
  if (token === null) return
  const tokenContract = LongShortToken.bind(tokenAddress)
  const latestBalance = tokenContract.balanceOf(ownerAddress)
  const balanceBD = convertTokenToDecimal(latestBalance, token.decimals)
  const amountBD = convertTokenToDecimal(amount, token.decimals)
  const prevBalance = balanceBD.minus(amountBD)

  let position = Position.load(id)
  if (position === null) {
    position = new Position(id)
    position.owner = ownerAddressString
    position.token = tokenAddressString
    position.costBasis = ZERO_BD
  }

  // newCostBasis = ((prevBalance * curCostBasis) + (boughtAmount * curPrice)) / (curBal + boughtAmount)
  const curWeight = prevBalance.times(position.costBasis)
  const newWeight = amountBD.times(token.priceUSD)
  const totalWeight = curWeight.plus(newWeight)
  const costBasis = totalWeight.div(balanceBD)
  position.costBasis = costBasis
  position.save()
}
