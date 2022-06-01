import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { fixedMergeCostFixture } from './fixtures/MergeCostFixture'
import { FixedMergeCost } from '../typechain/FixedMergeCost'

describe('=> FixedMergeCost', () => {
  let fixedMergeCost: FixedMergeCost
  let deployer: SignerWithAddress
  let user: SignerWithAddress
  let user2: SignerWithAddress
  const testPriceToStartWith = ethers.utils.parseEther('0.01')
  const testPriceToChangeTo = ethers.utils.parseEther('0.05')
  const testActionCount = 10
  beforeEach(async () => {
    ;[deployer, user, user2] = await ethers.getSigners()
    fixedMergeCost = await fixedMergeCostFixture(testPriceToStartWith)
  })

  describe('# initialize', () => {
    it('should be initialized with correct values', async () => {
      expect(await fixedMergeCost.owner()).to.eq(deployer.address)
      const cost = await fixedMergeCost.getCost(0, 0)
      expect(cost._amountToRecipient).to.eq(0)
      expect(cost._amountToTreasury).to.eq(testPriceToStartWith)
      expect(cost._amountToBurn).to.eq(0)
    })
  })

  describe('# getCost', () => {
    it('should return the fixed cost', async () => {
      const cost = await fixedMergeCost.getCost(0, 0)

      expect(cost._amountToRecipient).to.eq(0)
      expect(cost._amountToTreasury).to.eq(testPriceToStartWith)
      expect(cost._amountToBurn).to.eq(0)
    })
  })

  describe('# updateAndGetCost', () => {
    it('should return the fixed cost', async () => {
      const cost = await fixedMergeCost.callStatic.updateAndGetCost(0, 0, testActionCount)

      expect(cost._amountToRecipient).to.eq(0)
      expect(cost._amountToTreasury).to.eq(testPriceToStartWith)
      expect(cost._amountToBurn).to.eq(0)
    })
  })

  describe('# setCost', () => {
    it('should only be callable the owner', async () => {
      await expect(fixedMergeCost.connect(user).setCost(testPriceToStartWith)).revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should be settable to 0', async () => {
      const costBefore = await fixedMergeCost.getCost(0, 0)
      expect(costBefore._amountToRecipient).to.eq(0)
      expect(costBefore._amountToTreasury).to.eq(testPriceToStartWith)
      expect(costBefore._amountToBurn).to.eq(0)

      await fixedMergeCost.connect(deployer).setCost(0)

      const costAfter = await fixedMergeCost.getCost(0, 0)
      expect(costAfter._amountToRecipient).to.eq(0)
      expect(costAfter._amountToTreasury).to.eq(0)
      expect(costAfter._amountToBurn).to.eq(0)
    })

    it('should be settable to a value > 0', async () => {
      const costBefore = await fixedMergeCost.getCost(0, 0)
      expect(costBefore._amountToRecipient).to.eq(0)
      expect(costBefore._amountToTreasury).to.eq(testPriceToStartWith)
      expect(costBefore._amountToBurn).to.eq(0)

      await fixedMergeCost.connect(deployer).setCost(testPriceToChangeTo)

      const costAfter = await fixedMergeCost.getCost(0, 0)
      expect(costAfter._amountToRecipient).to.eq(0)
      expect(costAfter._amountToTreasury).to.eq(testPriceToChangeTo)
      expect(costAfter._amountToBurn).to.eq(0)
    })

    it('should be settable to the same value twice', async () => {
      const costBefore = await fixedMergeCost.getCost(0, 0)
      expect(costBefore._amountToRecipient).to.eq(0)
      expect(costBefore._amountToTreasury).to.eq(testPriceToStartWith)
      expect(costBefore._amountToBurn).to.eq(0)
      await fixedMergeCost.connect(deployer).setCost(testPriceToChangeTo)

      await fixedMergeCost.connect(deployer).setCost(testPriceToChangeTo)

      const costAfter = await fixedMergeCost.getCost(0, 0)
      expect(costAfter._amountToRecipient).to.eq(0)
      expect(costAfter._amountToTreasury).to.eq(testPriceToChangeTo)
      expect(costAfter._amountToBurn).to.eq(0)
    })
  })
})
