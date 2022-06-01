import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { dynamicMergeCostFixture } from './fixtures/MergeCostFixture'
import { dynamicPriceFixture } from './fixtures/DynamicPriceFixture'
import { getLastTimestamp, mineBlock, setNextTimestamp } from './utils'
import { DynamicPrice } from '../typechain/DynamicPrice'
import { DynamicMergeCost } from '../typechain/DynamicMergeCost'

describe('=> DynamicMergeCost', () => {
  let dynamicMergeCost: DynamicMergeCost
  let dynamicPrice: DynamicPrice
  let deployer: SignerWithAddress
  let user: SignerWithAddress
  let user2: SignerWithAddress
  const DEFAULT_TIMESTEP = 43200
  const TEST_STARTING_PRICE = ethers.utils.parseEther('0.01')
  const TEST_INCREASE_PER_BUMP = ethers.utils.parseEther('0.007') // 0.007 (scaled by 1e18), 1.007^100 ~= 2x ~= 200% increase per 100 bumps
  const TEST_DECREASE_PER_SECOND = ethers.utils.parseEther('0.0000013') // 1.3e-6 = (1-0.9999987) (scaled by 1e18), 0.9999987^86400 ~= 0.893x ~= 10.7% decrease per day
  beforeEach(async () => {
    ;[deployer, user, user2] = await ethers.getSigners()
    dynamicPrice = await dynamicPriceFixture()
    await dynamicPrice.connect(deployer).setIncreasePercentPerBump(TEST_INCREASE_PER_BUMP)
    await dynamicPrice.connect(deployer).setReductionPercentPerSecond(TEST_DECREASE_PER_SECOND)
    await dynamicPrice.connect(deployer).setTimestep(DEFAULT_TIMESTEP)
    dynamicMergeCost = await dynamicMergeCostFixture(dynamicPrice.address)
  })

  describe('# initialize', () => {
    it('should be initialized with correct values', async () => {
      expect(await dynamicMergeCost.getDynamicPrice()).to.eq(dynamicPrice.address)
    })
  })

  describe('# getCost', () => {
    it('should return the correct amounts without triggering an update', async () => {
      await dynamicPrice.connect(deployer).resetCheckpoint(TEST_STARTING_PRICE)
      const startTime = await getLastTimestamp()
      const amountsBefore = await dynamicMergeCost.getCost(0, 0)
      expect(amountsBefore._amountToRecipient).to.eq(0)
      expect(amountsBefore._amountToTreasury).to.eq(TEST_STARTING_PRICE)
      expect(amountsBefore._amountToBurn).to.eq(0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlock(ethers.provider as any, startTime + DEFAULT_TIMESTEP)

      const amountsAfter = await dynamicMergeCost.getCost(0, 0)

      expect(amountsAfter._amountToRecipient).to.eq(0)
      expect(amountsAfter._amountToTreasury).to.eq(TEST_STARTING_PRICE)
      expect(amountsAfter._amountToBurn).to.eq(0)
    })
  })

  describe('# updateAndGetCost', () => {
    it('should pass along a bump count of actionCount to DynamicPrice', async () => {
      await dynamicPrice.connect(deployer).resetCheckpoint(TEST_STARTING_PRICE)
      expect(await dynamicPrice.getBumpCountSinceCheckpoint()).to.eq(0)
      const testActionCount = 100

      await dynamicMergeCost.updateAndGetCost(0, 0, testActionCount)

      expect(await dynamicPrice.getBumpCountSinceCheckpoint()).to.eq(testActionCount)
    })

    it('should trigger a DynamicPrice checkpoint update after timestep has elapsed', async () => {
      await dynamicPrice.connect(deployer).resetCheckpoint(TEST_STARTING_PRICE)
      const startTime = await getLastTimestamp()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, startTime + DEFAULT_TIMESTEP)

      await dynamicMergeCost.updateAndGetCost(0, 0, 1)

      expect(await dynamicPrice.getCheckpointTime()).to.eq(startTime + DEFAULT_TIMESTEP)
    })

    it('should return the correct amounts from an updated checkpoint after timestep has elapsed', async () => {
      await dynamicPrice.connect(deployer).resetCheckpoint(TEST_STARTING_PRICE)
      const startTime = await getLastTimestamp()
      // Using callStatic here to test return value of a state changing function
      const amountsBefore = await dynamicMergeCost.callStatic.updateAndGetCost(0, 0, 1)
      expect(amountsBefore._amountToRecipient).to.eq(0)
      expect(amountsBefore._amountToTreasury).to.eq(TEST_STARTING_PRICE)
      expect(amountsBefore._amountToBurn).to.eq(0)
      // observe return value after timestamp has been moved forward
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlock(ethers.provider as any, startTime + DEFAULT_TIMESTEP)

      const amountsAfter = await dynamicMergeCost.callStatic.updateAndGetCost(0, 0, 1)

      expect(amountsAfter._amountToRecipient).to.eq(0)
      expect(amountsAfter._amountToTreasury).to.eq(await dynamicPrice.callStatic.updatePrice(1))
      expect(amountsAfter._amountToBurn).to.eq(0)
    })
  })
})
