import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { dynamicMergeCostFixture } from './fixtures/MergeCostFixture'
import { dynamicAcquireCostFixture } from './fixtures/AcquireCostFixture'
import { dynamicPriceFixture } from './fixtures/DynamicPriceFixture'
import { getLastTimestamp, mineBlock, PERCENT_DENOMINATOR, setNextTimestamp } from './utils'
import { DynamicPrice } from '../typechain/DynamicPrice'
import { DynamicAcquireCost } from '../typechain/DynamicAcquireCost'
import { DynamicMergeCost } from '../typechain/DynamicMergeCost'

describe('=> DynamicAcquireCost', () => {
  let dynamicMergeCost: DynamicMergeCost
  let dynamicAcquireCost: DynamicAcquireCost
  let mergeDynamicPrice: DynamicPrice
  let acquireDynamicPrice: DynamicPrice
  let deployer: SignerWithAddress
  let user: SignerWithAddress
  let user2: SignerWithAddress
  const DEFAULT_TIMESTEP = 43200
  const ACQUIRE_STARTING_PRICE = ethers.utils.parseEther('0.01')
  const ACQUIRE_INCREASE_PER_BUMP = ethers.utils.parseEther('0.007') // 0.007 (scaled by 1e18), 1.007^100 ~= 2x ~= 200% increase per 100 bumps
  const ACQUIRE_DECREASE_PER_SECOND = ethers.utils.parseEther('0.0000013') // 1.3e-6 = (1-0.9999987) (scaled by 1e18), 0.9999987^86400 ~= 0.893x ~= 10.7% decrease per day
  const MERGE_STARTING_PRICE = ethers.utils.parseEther('0.01')
  const MERGE_INCREASE_PER_BUMP = ACQUIRE_INCREASE_PER_BUMP.div(2) // 0.0035 1.0035^100 ~= 1.42x ~= 42% increase per 100 bumps
  const MERGE_DECREASE_PER_SECOND = ACQUIRE_DECREASE_PER_SECOND.div(2) // 6.5e-7 = (1-0.99999935) (scaled by 1e18), 0.99999935^86400 ~= 0.945x ~= 5.5% decrease per day
  const TEST_ACQUISITION_FEE = 500000000
  beforeEach(async () => {
    ;[deployer, user, user2] = await ethers.getSigners()
    mergeDynamicPrice = await dynamicPriceFixture()
    acquireDynamicPrice = await dynamicPriceFixture()
    await mergeDynamicPrice.connect(deployer).setIncreasePercentPerBump(MERGE_INCREASE_PER_BUMP)
    await mergeDynamicPrice
      .connect(deployer)
      .setReductionPercentPerSecond(MERGE_DECREASE_PER_SECOND)
    await mergeDynamicPrice.connect(deployer).setTimestep(DEFAULT_TIMESTEP)
    await acquireDynamicPrice.connect(deployer).setIncreasePercentPerBump(ACQUIRE_INCREASE_PER_BUMP)
    await acquireDynamicPrice
      .connect(deployer)
      .setReductionPercentPerSecond(ACQUIRE_DECREASE_PER_SECOND)
    await acquireDynamicPrice.connect(deployer).setTimestep(DEFAULT_TIMESTEP)
    dynamicMergeCost = await dynamicMergeCostFixture(mergeDynamicPrice.address)
    dynamicAcquireCost = await dynamicAcquireCostFixture(
      dynamicMergeCost.address,
      acquireDynamicPrice.address,
      TEST_ACQUISITION_FEE
    )
  })

  describe('# initialize', () => {
    it('should be initialized with correct values', async () => {
      expect(await dynamicAcquireCost.getMergeCost()).to.eq(dynamicMergeCost.address)
      expect(await dynamicAcquireCost.getDynamicPrice()).to.eq(acquireDynamicPrice.address)
      expect(await dynamicAcquireCost.getAcquisitionFee()).to.eq(TEST_ACQUISITION_FEE)
      expect(await dynamicAcquireCost.getPercentDenominator()).to.eq(PERCENT_DENOMINATOR)
    })
  })

  describe('# setAcquisitionFee', () => {
    it('should only be usable by the owner', async () => {
      expect(await dynamicAcquireCost.getAcquisitionFee()).to.eq(TEST_ACQUISITION_FEE)

      await expect(
        dynamicAcquireCost.connect(user).setAcquisitionFee(TEST_ACQUISITION_FEE - 1)
      ).to.revertedWith('Ownable: caller is not the owner')
    })

    it('should not allow setting of percentage greater than 100%', async () => {
      expect(await dynamicAcquireCost.getAcquisitionFee()).to.eq(TEST_ACQUISITION_FEE)

      await expect(
        dynamicAcquireCost.connect(deployer).setAcquisitionFee(PERCENT_DENOMINATOR.add(1))
      ).to.revertedWith('fee exceeds 100%')
    })

    it('should correctly set to a value', async () => {
      expect(await dynamicAcquireCost.getAcquisitionFee()).to.eq(TEST_ACQUISITION_FEE)

      await dynamicAcquireCost.connect(deployer).setAcquisitionFee(TEST_ACQUISITION_FEE + 1)

      expect(await dynamicAcquireCost.getAcquisitionFee()).to.eq(TEST_ACQUISITION_FEE + 1)
    })

    it('should correctly set the same value twice', async () => {
      expect(await dynamicAcquireCost.getAcquisitionFee()).to.eq(TEST_ACQUISITION_FEE)

      await dynamicAcquireCost.connect(deployer).setAcquisitionFee(TEST_ACQUISITION_FEE + 1)

      expect(await dynamicAcquireCost.getAcquisitionFee()).to.eq(TEST_ACQUISITION_FEE + 1)

      await dynamicAcquireCost.connect(deployer).setAcquisitionFee(TEST_ACQUISITION_FEE + 1)

      expect(await dynamicAcquireCost.getAcquisitionFee()).to.eq(TEST_ACQUISITION_FEE + 1)
    })
  })

  describe('# getCost', () => {
    it('should return the correct amounts without triggering an update', async () => {
      await mergeDynamicPrice.connect(deployer).resetCheckpoint(MERGE_STARTING_PRICE)
      await acquireDynamicPrice.connect(deployer).resetCheckpoint(ACQUIRE_STARTING_PRICE)
      const startTime = await getLastTimestamp()
      const amountsBefore = await dynamicAcquireCost.getCost(0, 0)
      const fee = ACQUIRE_STARTING_PRICE.mul(TEST_ACQUISITION_FEE).div(PERCENT_DENOMINATOR)
      expect(amountsBefore._amountToRecipient).to.eq(ACQUIRE_STARTING_PRICE.sub(fee))
      expect(amountsBefore._amountToTreasury).to.eq(MERGE_STARTING_PRICE.add(fee))
      expect(amountsBefore._amountToBurn).to.eq(0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlock(ethers.provider as any, startTime + DEFAULT_TIMESTEP)

      const amountsAfter = await dynamicAcquireCost.getCost(0, 0)

      expect(amountsAfter._amountToRecipient).to.eq(amountsBefore._amountToRecipient)
      expect(amountsAfter._amountToTreasury).to.eq(amountsBefore._amountToTreasury)
      expect(amountsAfter._amountToBurn).to.eq(0)
    })
  })

  describe('# updateAndGetCost', () => {
    it("should pass along a bump count of actionCount to its DynamicPrice, and 0 to DynamicMergeCost's DynamicPrice", async () => {
      await mergeDynamicPrice.connect(deployer).resetCheckpoint(MERGE_STARTING_PRICE)
      await acquireDynamicPrice.connect(deployer).resetCheckpoint(ACQUIRE_STARTING_PRICE)
      expect(await mergeDynamicPrice.getBumpCountSinceCheckpoint()).to.eq(0)
      expect(await acquireDynamicPrice.getBumpCountSinceCheckpoint()).to.eq(0)
      const testActionCount = 100

      await dynamicAcquireCost.updateAndGetCost(0, 0, testActionCount)

      expect(await mergeDynamicPrice.getBumpCountSinceCheckpoint()).to.eq(0)
      expect(await acquireDynamicPrice.getBumpCountSinceCheckpoint()).to.eq(testActionCount)
    })

    it('should trigger DynamicPrice updates for both DynamicMergeCost and DynamicAcquireCost after timestep has elapsed', async () => {
      await mergeDynamicPrice.connect(deployer).resetCheckpoint(MERGE_STARTING_PRICE)
      await acquireDynamicPrice.connect(deployer).resetCheckpoint(ACQUIRE_STARTING_PRICE)
      const startTime = await getLastTimestamp()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, startTime + DEFAULT_TIMESTEP)

      await dynamicAcquireCost.updateAndGetCost(0, 0, 1)

      expect(await mergeDynamicPrice.getCheckpointTime()).to.eq(startTime + DEFAULT_TIMESTEP)
      expect(await acquireDynamicPrice.getCheckpointTime()).to.eq(startTime + DEFAULT_TIMESTEP)
    })

    it('should return the correct amounts from an updated checkpoint after timestep has elapsed', async () => {
      await mergeDynamicPrice.connect(deployer).resetCheckpoint(MERGE_STARTING_PRICE)
      await acquireDynamicPrice.connect(deployer).resetCheckpoint(ACQUIRE_STARTING_PRICE)
      const startTime = await getLastTimestamp()
      // Using callStatic here to test return value of a state changing function
      const amountsBefore = await dynamicAcquireCost.callStatic.updateAndGetCost(0, 0, 1)
      const feeBefore = ACQUIRE_STARTING_PRICE.mul(TEST_ACQUISITION_FEE).div(PERCENT_DENOMINATOR)
      expect(amountsBefore._amountToRecipient).to.eq(ACQUIRE_STARTING_PRICE.sub(feeBefore))
      expect(amountsBefore._amountToTreasury).to.eq(MERGE_STARTING_PRICE.add(feeBefore))
      expect(amountsBefore._amountToBurn).to.eq(0)
      // observe return value after timestamp has been moved forward
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlock(ethers.provider as any, startTime + DEFAULT_TIMESTEP)

      const amountsAfter = await dynamicAcquireCost.callStatic.updateAndGetCost(0, 0, 1)

      const feeAfter = (await acquireDynamicPrice.callStatic.updatePrice(1))
        .mul(TEST_ACQUISITION_FEE)
        .div(PERCENT_DENOMINATOR)
      expect(amountsAfter._amountToRecipient).to.eq(
        (await acquireDynamicPrice.callStatic.updatePrice(1)).sub(feeAfter)
      )
      expect(amountsAfter._amountToTreasury).to.eq(
        (await mergeDynamicPrice.callStatic.updatePrice(0)).add(feeAfter)
      )
      expect(amountsAfter._amountToBurn).to.eq(0)
    })
  })
})
