import { Address, BigInt } from '@graphprotocol/graph-ts'
import { Position, Token } from '../generated/types/schema'
import { LongShortToken } from '../generated/types/templates/LongShortToken/LongShortToken'
import { ZERO_BD } from '../utils/constants'
import { convertTokenToDecimal } from '../utils/math'

function updatePosition(ownerAddress: Address, tokenAddress: Address, amount: BigInt): void {
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

export const manageRecipientPosition = (
  tokenAddress: Address,
  ownerAddress: Address,
  amount: BigInt
): void => {
  updatePosition(ownerAddress, tokenAddress, amount)
  // TODO: Keep track of user transaction record
}
