import chai, { expect } from 'chai'
import { ethers } from 'hardhat'
import { utils, BigNumber } from 'ethers'
import { solidity } from 'ethereum-waffle'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { tokenForNativeTokenFixture } from './fixtures/TokenForNativeToken'
import { mockERC20Fixture } from './fixtures/MockERC20Fixture'
import {
  AddressZero,
  getLastTimestamp,
  mineBlocks,
  revertReason,
  WEI_DENOMINATOR,
  setNextTimestamp,
} from './utils'
import { TokenForNativeToken } from '../typechain/TokenForNativeToken'
import { MockERC20 } from '../typechain/MockERC20'

chai.use(solidity)

const { parseEther } = utils

describe('=> TokenForNativeToken', () => {
  let deployer: SignerWithAddress
  let owner: SignerWithAddress
  let user1: SignerWithAddress
  let user2: SignerWithAddress
  let tokenForNativeToken: TokenForNativeToken
  let token: MockERC20
  let mockERC20: MockERC20
  let pricePerNativeToken: BigNumber
  let nativeTokenAmount: BigNumber
  const initialBalance = parseEther('1000')
  const userSellableLimitPerPeriod = parseEther('600')
  const globalSellableLimitPerPeriod = parseEther('1000')
  const tokenSellAmount = parseEther('400')
  const period = 60 * 60 * 24

  const setupTokenForNativeToken = async (): Promise<void> => {
    ;[deployer, user1, user2] = await ethers.getSigners()
    owner = deployer
    tokenForNativeToken = await tokenForNativeTokenFixture()
    await ethers.provider.send('hardhat_setBalance', [
      tokenForNativeToken.address,
      initialBalance.toHexString(),
    ])
  }

  const setupMockERC20 = async (): Promise<void> => {
    token = await mockERC20Fixture('RPToken', 'RP')
    await token.mint(user1.address, initialBalance)
    await token.mint(user2.address, initialBalance)
  }

  describe('# initialize', () => {
    beforeEach(async () => {
      await setupTokenForNativeToken()
    })

    it('sets correct owner', async () => {
      expect(await tokenForNativeToken.owner()).to.eq(owner.address)
    })
  })

  describe('# setToken', () => {
    beforeEach(async () => {
      await setupTokenForNativeToken()
      await setupMockERC20()
    })

    it('reverts if not owner', () => {
      expect(tokenForNativeToken.connect(user1).setToken(token.address)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('sets to non-zero address', async () => {
      expect(await tokenForNativeToken.getToken()).to.not.eq(token.address)

      await tokenForNativeToken.connect(owner).setToken(token.address)

      expect(await tokenForNativeToken.getToken()).to.eq(token.address)
    })

    it('is idempotent', async () => {
      expect(await tokenForNativeToken.getToken()).to.not.eq(token.address)

      await tokenForNativeToken.connect(owner).setToken(token.address)

      expect(await tokenForNativeToken.getToken()).to.eq(token.address)

      await tokenForNativeToken.connect(owner).setToken(token.address)

      expect(await tokenForNativeToken.getToken()).to.eq(token.address)
    })

    it('sets to zero address', async () => {
      expect(await tokenForNativeToken.getToken()).to.not.eq(token.address)

      await tokenForNativeToken.connect(owner).setToken(AddressZero)

      expect(await tokenForNativeToken.getToken()).to.eq(AddressZero)
    })
  })

  describe('# setPricePerNativeToken', () => {
    beforeEach(async () => {
      await setupTokenForNativeToken()
      pricePerNativeToken = parseEther('0.2')
    })

    it('reverts if not owner', () => {
      expect(
        tokenForNativeToken.connect(user1).setPricePerNativeToken(pricePerNativeToken)
      ).revertedWith(revertReason('Ownable: caller is not the owner'))
    })

    it('sets to non-zero value', async () => {
      expect(await tokenForNativeToken.getPricePerNativeToken()).to.not.eq(pricePerNativeToken)

      await tokenForNativeToken.connect(owner).setPricePerNativeToken(pricePerNativeToken)

      expect(await tokenForNativeToken.getPricePerNativeToken()).to.eq(pricePerNativeToken)
    })

    it('is idempotent', async () => {
      expect(await tokenForNativeToken.getPricePerNativeToken()).to.not.eq(pricePerNativeToken)

      await tokenForNativeToken.connect(owner).setPricePerNativeToken(pricePerNativeToken)

      expect(await tokenForNativeToken.getPricePerNativeToken()).to.eq(pricePerNativeToken)

      await tokenForNativeToken.connect(owner).setPricePerNativeToken(pricePerNativeToken)

      expect(await tokenForNativeToken.getPricePerNativeToken()).to.eq(pricePerNativeToken)
    })

    it('sets to zero', async () => {
      expect(await tokenForNativeToken.getPricePerNativeToken()).to.not.eq(pricePerNativeToken)

      await tokenForNativeToken.connect(owner).setPricePerNativeToken(0)

      expect(await tokenForNativeToken.getPricePerNativeToken()).to.eq(0)
    })
  })

  describe('# setUserSellableLimitPerPeriod', () => {
    beforeEach(async () => {
      await setupTokenForNativeToken()
    })

    it('reverts if not owner', () => {
      expect(
        tokenForNativeToken.connect(user1).setUserSellableLimitPerPeriod(userSellableLimitPerPeriod)
      ).revertedWith(revertReason('Ownable: caller is not the owner'))
    })

    it('sets to non-zero value', async () => {
      expect(await tokenForNativeToken.getUserSellableLimitPerPeriod()).to.not.eq(
        userSellableLimitPerPeriod
      )

      await tokenForNativeToken
        .connect(owner)
        .setUserSellableLimitPerPeriod(userSellableLimitPerPeriod)

      expect(await tokenForNativeToken.getUserSellableLimitPerPeriod()).to.eq(
        userSellableLimitPerPeriod
      )
    })

    it('is idempotent', async () => {
      expect(await tokenForNativeToken.getUserSellableLimitPerPeriod()).to.not.eq(
        userSellableLimitPerPeriod
      )

      await tokenForNativeToken
        .connect(owner)
        .setUserSellableLimitPerPeriod(userSellableLimitPerPeriod)

      expect(await tokenForNativeToken.getUserSellableLimitPerPeriod()).to.eq(
        userSellableLimitPerPeriod
      )

      await tokenForNativeToken
        .connect(owner)
        .setUserSellableLimitPerPeriod(userSellableLimitPerPeriod)

      expect(await tokenForNativeToken.getUserSellableLimitPerPeriod()).to.eq(
        userSellableLimitPerPeriod
      )
    })

    it('sets to zero', async () => {
      expect(await tokenForNativeToken.getUserSellableLimitPerPeriod()).to.not.eq(
        userSellableLimitPerPeriod
      )

      await tokenForNativeToken.connect(owner).setUserSellableLimitPerPeriod(0)

      expect(await tokenForNativeToken.getUserSellableLimitPerPeriod()).to.eq(0)
    })
  })

  describe('# setGlobalSellableLimitPerPeriod', () => {
    beforeEach(async () => {
      await setupTokenForNativeToken()
    })

    it('reverts if not owner', () => {
      expect(
        tokenForNativeToken
          .connect(user1)
          .setGlobalSellableLimitPerPeriod(globalSellableLimitPerPeriod)
      ).revertedWith(revertReason('Ownable: caller is not the owner'))
    })

    it('sets to non-zero value', async () => {
      expect(await tokenForNativeToken.getGlobalSellableLimitPerPeriod()).to.not.eq(
        globalSellableLimitPerPeriod
      )

      await tokenForNativeToken
        .connect(owner)
        .setGlobalSellableLimitPerPeriod(globalSellableLimitPerPeriod)

      expect(await tokenForNativeToken.getGlobalSellableLimitPerPeriod()).to.eq(
        globalSellableLimitPerPeriod
      )
    })

    it('is idempotent', async () => {
      expect(await tokenForNativeToken.getGlobalSellableLimitPerPeriod()).to.not.eq(
        globalSellableLimitPerPeriod
      )

      await tokenForNativeToken
        .connect(owner)
        .setGlobalSellableLimitPerPeriod(globalSellableLimitPerPeriod)

      expect(await tokenForNativeToken.getGlobalSellableLimitPerPeriod()).to.eq(
        globalSellableLimitPerPeriod
      )

      await tokenForNativeToken
        .connect(owner)
        .setGlobalSellableLimitPerPeriod(globalSellableLimitPerPeriod)

      expect(await tokenForNativeToken.getGlobalSellableLimitPerPeriod()).to.eq(
        globalSellableLimitPerPeriod
      )
    })

    it('sets to zero', async () => {
      expect(await tokenForNativeToken.getGlobalSellableLimitPerPeriod()).to.not.eq(
        globalSellableLimitPerPeriod
      )

      await tokenForNativeToken.connect(owner).setGlobalSellableLimitPerPeriod(0)

      expect(await tokenForNativeToken.getGlobalSellableLimitPerPeriod()).to.eq(0)
    })
  })

  describe('# setPeriodLength', () => {
    beforeEach(async () => {
      await setupTokenForNativeToken()
    })

    it('reverts if not owner', () => {
      expect(tokenForNativeToken.connect(user1).setPeriodLength(period)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('sets to non-zero value', async () => {
      expect(await tokenForNativeToken.getPeriodLength()).to.not.eq(period)

      await tokenForNativeToken.connect(owner).setPeriodLength(period)

      expect(await tokenForNativeToken.getPeriodLength()).to.eq(period)
    })

    it('is idempotent', async () => {
      expect(await tokenForNativeToken.getPeriodLength()).to.not.eq(period)

      await tokenForNativeToken.connect(owner).setPeriodLength(period)

      expect(await tokenForNativeToken.getPeriodLength()).to.eq(period)

      await tokenForNativeToken.connect(owner).setPeriodLength(period)

      expect(await tokenForNativeToken.getPeriodLength()).to.eq(period)
    })

    it('sets to zero', async () => {
      expect(await tokenForNativeToken.getPeriodLength()).to.not.eq(period)

      await tokenForNativeToken.connect(owner).setPeriodLength(0)

      expect(await tokenForNativeToken.getPeriodLength()).to.eq(0)
    })
  })

  describe('# sell', () => {
    beforeEach(async () => {
      await setupTokenForNativeToken()
      await setupMockERC20()
      nativeTokenAmount = tokenSellAmount.mul(pricePerNativeToken).div(WEI_DENOMINATOR)
      await tokenForNativeToken.setToken(token.address)
      await tokenForNativeToken.setPricePerNativeToken(pricePerNativeToken)
      await tokenForNativeToken.setUserSellableLimitPerPeriod(userSellableLimitPerPeriod)
      await tokenForNativeToken.setGlobalSellableLimitPerPeriod(globalSellableLimitPerPeriod)
      await tokenForNativeToken.setPeriodLength(period)
      await token.connect(user1).approve(tokenForNativeToken.address, initialBalance)
      await token.connect(user2).approve(tokenForNativeToken.address, initialBalance)
    })

    it('reverts if user selling limit exceeded', async () => {
      await tokenForNativeToken.connect(user1).sell(tokenSellAmount)
      const amountAlreadySold = await tokenForNativeToken.getUserToTokenAmountThisPeriod(
        user1.address
      )
      const amountToBringOverLimit = userSellableLimitPerPeriod.add(1).sub(amountAlreadySold)
      expect(amountAlreadySold.add(amountToBringOverLimit)).to.be.gt(userSellableLimitPerPeriod)

      expect(tokenForNativeToken.connect(user1).sell(amountToBringOverLimit)).revertedWith(
        revertReason('User sellable limit exceeded')
      )
    })

    it('reverts if global selling limit exceeded', async () => {
      await tokenForNativeToken.connect(user1).sell(userSellableLimitPerPeriod)
      const totalAmountSoldThisPeriod = await tokenForNativeToken.getTotalTokenAmountThisPeriod()
      const amountToBringOverLimit = globalSellableLimitPerPeriod
        .add(1)
        .sub(totalAmountSoldThisPeriod)
      expect(totalAmountSoldThisPeriod.add(amountToBringOverLimit)).to.be.gt(
        globalSellableLimitPerPeriod
      )

      expect(tokenForNativeToken.connect(user2).sell(amountToBringOverLimit)).revertedWith(
        revertReason('Global sellable limit exceeded')
      )
    })

    it('sells if user amount sold this period after sale = user sellable limit per period', async () => {
      await tokenForNativeToken.connect(user1).sell(tokenSellAmount)
      const amountAlreadySold = await tokenForNativeToken.getUserToTokenAmountThisPeriod(
        user1.address
      )
      const amountToReachUserLimit = userSellableLimitPerPeriod.sub(amountAlreadySold)
      const userNativeTokenBalanceBefore = await ethers.provider.getBalance(user1.address)
      const expectedNativeTokenAmountIncrease = amountToReachUserLimit
        .mul(pricePerNativeToken)
        .div(WEI_DENOMINATOR)
      const ownerTokenBalanceBefore = await token.balanceOf(owner.address)

      await tokenForNativeToken.connect(user1).sell(amountToReachUserLimit)

      const userNativeTokenBalanceAfter = await ethers.provider.getBalance(user1.address)
      expect(userNativeTokenBalanceAfter).to.be.eq(
        userNativeTokenBalanceBefore.add(expectedNativeTokenAmountIncrease)
      )
      expect(await token.balanceOf(owner.address)).to.equal(
        ownerTokenBalanceBefore.add(amountToReachUserLimit)
      )
      expect(await tokenForNativeToken.getUserToTokenAmountThisPeriod(user1.address)).to.be.eq(
        userSellableLimitPerPeriod
      )
    })

    it('sells if user amount sold this period after sale < user sellable limit per period', async () => {
      await tokenForNativeToken.connect(user1).sell(tokenSellAmount)
      const amountAlreadySold = await tokenForNativeToken.getUserToTokenAmountThisPeriod(
        user1.address
      )
      const amountToSell = userSellableLimitPerPeriod.sub(amountAlreadySold).sub(1)
      const userNativeTokenBalanceBefore = await ethers.provider.getBalance(user1.address)
      const expectedNativeTokenAmountIncrease = amountToSell
        .mul(pricePerNativeToken)
        .div(WEI_DENOMINATOR)
      const ownerTokenBalanceBefore = await token.balanceOf(owner.address)

      await tokenForNativeToken.connect(user1).sell(amountToSell)

      const userNativeTokenBalanceAfter = await ethers.provider.getBalance(user1.address)
      expect(userNativeTokenBalanceAfter).to.be.eq(
        userNativeTokenBalanceBefore.add(expectedNativeTokenAmountIncrease)
      )
      expect(await token.balanceOf(owner.address)).to.equal(
        ownerTokenBalanceBefore.add(amountToSell)
      )
      expect(await tokenForNativeToken.getUserToTokenAmountThisPeriod(user1.address)).to.be.lt(
        userSellableLimitPerPeriod
      )
    })

    it('sells if global amount sold this period after sale = global sellable limit per period', async () => {
      await tokenForNativeToken.connect(user1).sell(tokenSellAmount)
      const totalAmountSoldThisPeriod = await tokenForNativeToken.getTotalTokenAmountThisPeriod()
      const amountToReachGlobalLimit = globalSellableLimitPerPeriod.sub(totalAmountSoldThisPeriod)
      const userNativeTokenBalanceBefore = await ethers.provider.getBalance(user2.address)
      const expectedNativeTokenAmountIncrease = amountToReachGlobalLimit
        .mul(pricePerNativeToken)
        .div(WEI_DENOMINATOR)
      const ownerTokenBalanceBefore = await token.balanceOf(owner.address)

      await tokenForNativeToken.connect(user2).sell(amountToReachGlobalLimit)

      const userNativeTokenBalanceAfter = await ethers.provider.getBalance(user2.address)
      expect(userNativeTokenBalanceAfter).to.be.eq(
        userNativeTokenBalanceBefore.add(expectedNativeTokenAmountIncrease)
      )
      expect(await token.balanceOf(owner.address)).to.equal(
        ownerTokenBalanceBefore.add(amountToReachGlobalLimit)
      )
      expect(await tokenForNativeToken.getTotalTokenAmountThisPeriod()).to.be.eq(
        globalSellableLimitPerPeriod
      )
    })

    it('sells if global amount sold this period after sale < global sellable limit per period', async () => {
      await tokenForNativeToken.connect(user1).sell(tokenSellAmount)
      const totalAmountSoldThisPeriod = await tokenForNativeToken.getTotalTokenAmountThisPeriod()
      const amountToSell = globalSellableLimitPerPeriod.sub(totalAmountSoldThisPeriod).sub(1)
      const userNativeTokenBalanceBefore = await ethers.provider.getBalance(user2.address)
      const expectedNativeTokenAmountIncrease = amountToSell
        .mul(pricePerNativeToken)
        .div(WEI_DENOMINATOR)
      const ownerTokenBalanceBefore = await token.balanceOf(owner.address)

      await tokenForNativeToken.connect(user2).sell(amountToSell)

      const userNativeTokenBalanceAfter = await ethers.provider.getBalance(user2.address)
      expect(userNativeTokenBalanceAfter).to.be.eq(
        userNativeTokenBalanceBefore.add(expectedNativeTokenAmountIncrease)
      )
      expect(await token.balanceOf(owner.address)).to.equal(
        ownerTokenBalanceBefore.add(amountToSell)
      )
      expect(await tokenForNativeToken.getTotalTokenAmountThisPeriod()).to.be.lt(
        globalSellableLimitPerPeriod
      )
    })

    it('transfers sold tokens to owner', async () => {
      const ownerTokenBalanceBefore = await token.balanceOf(owner.address)
      const userTokenBalanceBefore = await token.balanceOf(user1.address)

      await tokenForNativeToken.connect(user1).sell(tokenSellAmount)

      expect(await token.balanceOf(owner.address)).to.equal(
        ownerTokenBalanceBefore.add(tokenSellAmount)
      )
      expect(await token.balanceOf(user1.address)).to.equal(
        userTokenBalanceBefore.sub(tokenSellAmount)
      )
    })

    it('emits TokenSold', () => {
      expect(tokenForNativeToken.connect(user1).sell(tokenSellAmount))
        .to.emit(tokenForNativeToken, 'TokenSold')
        .withArgs(user1.address, tokenSellAmount, nativeTokenAmount)
    })

    it('resets user and global sell amounts if period transition', async () => {
      await tokenForNativeToken.connect(user1).sell(userSellableLimitPerPeriod)
      expect(await tokenForNativeToken.getUserToTokenAmountThisPeriod(user1.address)).to.not.eq(0)
      expect(await tokenForNativeToken.getTotalTokenAmountThisPeriod()).to.not.eq(0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, (await getLastTimestamp()) + period)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlocks(ethers.provider as any, 1)

      expect(await tokenForNativeToken.getUserToTokenAmountThisPeriod(user1.address)).to.eq(0)
      expect(await tokenForNativeToken.getTotalTokenAmountThisPeriod()).to.eq(0)
    })
  })
  /**
   * TODO: 1. add tests for getUserToTokenAmountThisPeriod (including tx.origin vs msg.sender)
   * and getTotalTokenAmountThisPeriod.
   * 2. test for tx.origin vs msg.sender
   */

  describe('# withdrawNativeToken', () => {
    beforeEach(async () => {
      await setupTokenForNativeToken()
    })

    it('reverts if not owner', async () => {
      expect(await tokenForNativeToken.owner()).to.not.be.equal(user1.address)

      await expect(tokenForNativeToken.connect(user1).withdrawNativeToken(1)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('reverts if amount > contract balance', async () => {
      const tokenSaleNativeTokenBalanceBefore = await ethers.provider.getBalance(
        tokenForNativeToken.address
      )
      const amountToWithdraw = tokenSaleNativeTokenBalanceBefore.add(1)

      await expect(
        tokenForNativeToken.connect(owner).withdrawNativeToken(amountToWithdraw)
      ).revertedWith(revertReason('Failed to withdraw'))
    })

    it('transfers if amount = contract balance', async () => {
      const tokenSaleNativeTokenBalanceBefore = await ethers.provider.getBalance(
        tokenForNativeToken.address
      )
      const amountToWithdraw = tokenSaleNativeTokenBalanceBefore

      const tx = await tokenForNativeToken.connect(owner).withdrawNativeToken(amountToWithdraw)

      await expect(tx).to.changeEtherBalance(owner, amountToWithdraw)
      expect(await ethers.provider.getBalance(tokenForNativeToken.address)).to.be.equal(0)
    })

    it('transfers if amount < contract balance', async () => {
      const tokenSaleNativeTokenBalanceBefore = await ethers.provider.getBalance(
        tokenForNativeToken.address
      )
      const amountToWithdraw = tokenSaleNativeTokenBalanceBefore.sub(1)

      const tx = await tokenForNativeToken.connect(owner).withdrawNativeToken(amountToWithdraw)

      await expect(tx).to.changeEtherBalance(owner, amountToWithdraw)
      expect(await ethers.provider.getBalance(tokenForNativeToken.address)).to.be.equal(1)
    })
  })

  describe('# withdrawERC20', () => {
    beforeEach(async () => {
      await setupTokenForNativeToken()
      await setupMockERC20()
      const mockERC20Recipient = user1.address
      const mockERC20InitialMint = initialBalance
      mockERC20 = await mockERC20Fixture('Mock ERC20', 'MERC20')
      await mockERC20.mint(mockERC20Recipient, mockERC20InitialMint)
    })

    it('reverts if not owner', async () => {
      expect(await tokenForNativeToken.owner()).to.not.eq(user1.address)

      expect(tokenForNativeToken.connect(user1).withdrawERC20(token.address, 1)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('reverts if amount > balance', async () => {
      const contractBalanceBefore = await mockERC20.balanceOf(tokenForNativeToken.address)
      const amountToWithdraw = contractBalanceBefore.add(1)

      expect(
        tokenForNativeToken.connect(owner).withdrawERC20(mockERC20.address, amountToWithdraw)
      ).revertedWith(revertReason('ERC20: transfer amount exceeds balance'))
    })

    it('transfers if amount = balance', async () => {
      const amountSent = parseEther('10')
      const ownerBalanceBefore = await mockERC20.balanceOf(owner.address)
      await mockERC20.connect(user1).transfer(tokenForNativeToken.address, amountSent)
      const contractBalanceBefore = await mockERC20.balanceOf(tokenForNativeToken.address)
      const amountToWithdraw = contractBalanceBefore

      await tokenForNativeToken.connect(owner).withdrawERC20(mockERC20.address, amountToWithdraw)

      expect(await mockERC20.balanceOf(owner.address)).to.be.equal(
        ownerBalanceBefore.add(amountToWithdraw)
      )
      expect(await mockERC20.balanceOf(tokenForNativeToken.address)).to.be.equal(0)
    })

    it('transfers if amount < balance', async () => {
      const amountSent = parseEther('10')
      const ownerBalanceBefore = await mockERC20.balanceOf(owner.address)
      await mockERC20.connect(user1).transfer(tokenForNativeToken.address, amountSent)
      const contractBalanceBefore = await mockERC20.balanceOf(tokenForNativeToken.address)
      const amountToWithdraw = contractBalanceBefore.sub(1)

      await tokenForNativeToken.connect(owner).withdrawERC20(mockERC20.address, amountToWithdraw)

      expect(await mockERC20.balanceOf(owner.address)).to.be.equal(
        ownerBalanceBefore.add(amountToWithdraw)
      )
      expect(await mockERC20.balanceOf(tokenForNativeToken.address)).to.be.equal(1)
    })

    it('transfers RP to owner', async () => {
      const amountSent = parseEther('10')
      const ownerRPBalanceBefore = await token.balanceOf(owner.address)
      await token.connect(user1).transfer(tokenForNativeToken.address, amountSent)
      const contractRPBalanceBefore = await token.balanceOf(tokenForNativeToken.address)
      const amountToWithdraw = contractRPBalanceBefore.sub(1)

      await tokenForNativeToken.connect(owner).withdrawERC20(token.address, amountToWithdraw)

      expect(await token.balanceOf(owner.address)).to.be.equal(
        ownerRPBalanceBefore.add(amountToWithdraw)
      )
      expect(await token.balanceOf(tokenForNativeToken.address)).to.be.equal(1)
    })
  })
})
