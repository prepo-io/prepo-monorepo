import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { fixedAcquireCostFixture } from './fixtures/AcquireCostFixture'
import { fixedMergeCostFixture } from './fixtures/MergeCostFixture'
import { PERCENT_DENOMINATOR } from './utils'
import { FixedMergeCost, FixedAcquireCost } from '../typechain'

describe('=> FixedAcquireCost', () => {
  let fixedMergeCost: FixedMergeCost
  let fixedAcquireCost: FixedAcquireCost
  let deployer: SignerWithAddress
  let user: SignerWithAddress
  let user2: SignerWithAddress
  const fixedPriceToStartWith = ethers.utils.parseEther('0.01')
  const fixedPriceToChangeTo = ethers.utils.parseEther('0.05')
  const testActionCount = 10
  const testAcquisitionFeePercent = 500000000 // 5%
  beforeEach(async () => {
    ;[deployer, user, user2] = await ethers.getSigners()
    fixedMergeCost = await fixedMergeCostFixture(fixedPriceToStartWith)
    fixedAcquireCost = await fixedAcquireCostFixture(
      fixedMergeCost.address,
      fixedPriceToStartWith,
      testAcquisitionFeePercent
    )
  })

  describe('# initialize', () => {
    it('should be initialized with correct values', async () => {
      expect(await fixedAcquireCost.getMergeCost()).to.eq(fixedMergeCost.address)
      expect(await fixedAcquireCost.getFixedCost()).to.eq(fixedPriceToStartWith)
      expect(await fixedAcquireCost.getAcquisitionFeePercent()).to.eq(testAcquisitionFeePercent)
      expect(await fixedAcquireCost.getPercentDenominator()).to.eq(PERCENT_DENOMINATOR)
    })
  })

  describe('# setMergeCost', () => {
    it('should only be callable the owner', async () => {
      await expect(
        fixedAcquireCost.connect(user).setMergeCost(fixedMergeCost.address)
      ).revertedWith('Ownable: caller is not the owner')
    })

    it('should be settable to any address', async () => {
      expect(await fixedAcquireCost.getMergeCost()).to.eq(fixedMergeCost.address)
      const dummyMergeCost = await fixedMergeCostFixture(fixedPriceToStartWith)

      await fixedAcquireCost.connect(deployer).setMergeCost(dummyMergeCost.address)

      expect(await fixedAcquireCost.getMergeCost()).to.eq(dummyMergeCost.address)
    })

    it('should correctly set the same value twice', async () => {
      expect(await fixedAcquireCost.getMergeCost()).to.eq(fixedMergeCost.address)
      const dummyMergeCost = await fixedMergeCostFixture(fixedPriceToStartWith)
      await fixedAcquireCost.connect(deployer).setMergeCost(dummyMergeCost.address)

      await fixedAcquireCost.connect(deployer).setMergeCost(dummyMergeCost.address)

      expect(await fixedAcquireCost.getMergeCost()).to.eq(dummyMergeCost.address)
    })
  })

  describe('# setFixedCost', () => {
    it('should only be callable the owner', async () => {
      await expect(fixedAcquireCost.connect(user).setFixedCost(fixedPriceToStartWith)).revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should be settable to 0', async () => {
      expect(await fixedAcquireCost.getFixedCost()).to.eq(fixedPriceToStartWith)

      await fixedAcquireCost.connect(deployer).setFixedCost(0)

      expect(await fixedAcquireCost.getFixedCost()).to.eq(0)
    })

    it('should be settable to a value > 0', async () => {
      expect(await fixedAcquireCost.getFixedCost()).to.eq(fixedPriceToStartWith)

      await fixedAcquireCost.connect(deployer).setFixedCost(fixedPriceToChangeTo)

      expect(await fixedAcquireCost.getFixedCost()).to.eq(fixedPriceToChangeTo)
    })

    it('should correctly set the same value twice', async () => {
      expect(await fixedAcquireCost.getFixedCost()).to.eq(fixedPriceToStartWith)
      await fixedAcquireCost.connect(deployer).setFixedCost(fixedPriceToChangeTo)

      await fixedAcquireCost.connect(deployer).setFixedCost(fixedPriceToChangeTo)

      expect(await fixedAcquireCost.getFixedCost()).to.eq(fixedPriceToChangeTo)
    })
  })

  describe('# setAcquisitionFeePercent', () => {
    it('should only be usable by the owner', async () => {
      await expect(
        fixedAcquireCost.connect(user).setAcquisitionFeePercent(testAcquisitionFeePercent - 1)
      ).to.revertedWith('Ownable: caller is not the owner')
    })

    it('should not allow setting of percentage greater than 100%', async () => {
      expect(await fixedAcquireCost.getAcquisitionFeePercent()).to.eq(testAcquisitionFeePercent)

      await expect(
        fixedAcquireCost.connect(deployer).setAcquisitionFeePercent(PERCENT_DENOMINATOR.add(1))
      ).to.revertedWith('fee exceeds 100%')
    })

    it('should be settable to 0%', async () => {
      expect(await fixedAcquireCost.getAcquisitionFeePercent()).to.eq(testAcquisitionFeePercent)

      await fixedAcquireCost.connect(deployer).setAcquisitionFeePercent(0)

      expect(await fixedAcquireCost.getAcquisitionFeePercent()).to.eq(0)
    })

    it('should be settable to 100%', async () => {
      expect(await fixedAcquireCost.getAcquisitionFeePercent()).to.eq(testAcquisitionFeePercent)

      await fixedAcquireCost.connect(deployer).setAcquisitionFeePercent(PERCENT_DENOMINATOR)

      expect(await fixedAcquireCost.getAcquisitionFeePercent()).to.eq(PERCENT_DENOMINATOR)
    })

    it('should be settable to a value between 0% and 100%', async () => {
      expect(await fixedAcquireCost.getAcquisitionFeePercent()).to.eq(testAcquisitionFeePercent)

      await fixedAcquireCost
        .connect(deployer)
        .setAcquisitionFeePercent(testAcquisitionFeePercent + 1)

      expect(await fixedAcquireCost.getAcquisitionFeePercent()).to.eq(testAcquisitionFeePercent + 1)
    })

    it('should correctly set the same value twice', async () => {
      expect(await fixedAcquireCost.getAcquisitionFeePercent()).to.eq(testAcquisitionFeePercent)
      await fixedAcquireCost
        .connect(deployer)
        .setAcquisitionFeePercent(testAcquisitionFeePercent + 1)

      await fixedAcquireCost
        .connect(deployer)
        .setAcquisitionFeePercent(testAcquisitionFeePercent + 1)

      expect(await fixedAcquireCost.getAcquisitionFeePercent()).to.eq(testAcquisitionFeePercent + 1)
    })
  })

  describe('# getCost', () => {
    it('should return the correct amounts based on `fixedCost`', async () => {
      const amountsBefore = await fixedAcquireCost.getCost(0, 0)

      const fee = fixedPriceToStartWith.mul(testAcquisitionFeePercent).div(PERCENT_DENOMINATOR)
      expect(amountsBefore._amountToRecipient).to.eq(fixedPriceToStartWith.sub(fee))
      expect(amountsBefore._amountToTreasury).to.eq(
        (await fixedMergeCost.getCost(0, 0))._amountToTreasury.add(fee)
      )
      expect(amountsBefore._amountToBurn).to.eq(0)
    })

    it('should return an updated price when `fixedCost` is changed', async () => {
      const amountsBefore = await fixedAcquireCost.getCost(0, 0)
      const fee = fixedPriceToStartWith.mul(testAcquisitionFeePercent).div(PERCENT_DENOMINATOR)
      expect(amountsBefore._amountToRecipient).to.eq(fixedPriceToStartWith.sub(fee))
      expect(amountsBefore._amountToTreasury).to.eq(
        (await fixedMergeCost.getCost(0, 0))._amountToTreasury.add(fee)
      )
      expect(amountsBefore._amountToBurn).to.eq(0)

      await fixedAcquireCost.connect(deployer).setFixedCost(fixedPriceToChangeTo)

      const amountsAfter = await fixedAcquireCost.getCost(0, 0)
      const feeAfter = fixedPriceToChangeTo.mul(testAcquisitionFeePercent).div(PERCENT_DENOMINATOR)
      expect(amountsAfter._amountToRecipient).to.eq(fixedPriceToChangeTo.sub(feeAfter))
      expect(amountsAfter._amountToTreasury).to.eq(
        (await fixedMergeCost.getCost(0, 0))._amountToTreasury.add(feeAfter)
      )
      expect(amountsAfter._amountToBurn).to.eq(0)
    })
  })

  describe('# updateAndGetCost', () => {
    it('should ignore submitted actions and return the correct amounts based on `fixedCost`', async () => {
      const amountsBefore = await fixedAcquireCost.callStatic.updateAndGetCost(
        0,
        0,
        testActionCount
      )

      const fee = fixedPriceToStartWith.mul(testAcquisitionFeePercent).div(PERCENT_DENOMINATOR)
      expect(amountsBefore._amountToRecipient).to.eq(fixedPriceToStartWith.sub(fee))
      expect(amountsBefore._amountToTreasury).to.eq(
        (await fixedMergeCost.getCost(0, 0))._amountToTreasury.add(fee)
      )
      expect(amountsBefore._amountToBurn).to.eq(0)
    })

    it('should ignore submitted actions and return an updated price when `fixedCost` is changed', async () => {
      const amountsBefore = await fixedAcquireCost.callStatic.updateAndGetCost(
        0,
        0,
        testActionCount
      )
      const feeBefore = fixedPriceToStartWith
        .mul(testAcquisitionFeePercent)
        .div(PERCENT_DENOMINATOR)
      expect(amountsBefore._amountToRecipient).to.eq(fixedPriceToStartWith.sub(feeBefore))
      expect(amountsBefore._amountToTreasury).to.eq(
        (await fixedMergeCost.getCost(0, 0))._amountToTreasury.add(feeBefore)
      )
      expect(amountsBefore._amountToBurn).to.eq(0)

      await fixedAcquireCost.connect(deployer).setFixedCost(fixedPriceToChangeTo)

      const amountsAfter = await fixedAcquireCost.callStatic.updateAndGetCost(0, 0, testActionCount)
      const feeAfter = fixedPriceToChangeTo.mul(testAcquisitionFeePercent).div(PERCENT_DENOMINATOR)
      expect(amountsAfter._amountToRecipient).to.eq(fixedPriceToChangeTo.sub(feeAfter))
      expect(amountsAfter._amountToTreasury).to.eq(
        (await fixedMergeCost.getCost(0, 0))._amountToTreasury.add(feeAfter)
      )
      expect(amountsAfter._amountToBurn).to.eq(0)
    })
  })
})
