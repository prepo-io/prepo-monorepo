import chai, { expect } from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { BigNumber } from 'ethers'
import { dynamicPriceFixture } from './fixtures/DynamicPriceFixture'
import {
  getCheckpointUpdatedEvent,
  getTimestepChangedEvent,
  getIncreasePercentPerBumpChangedEvent,
  getReductionPercentPerSecondChangedEvent,
} from './events'
import { getLastTimestamp, setNextTimestamp } from './utils'
import { DynamicPrice } from '../typechain/DynamicPrice'

chai.use(solidity)

describe('=> DynamicPrice', () => {
  let dynamicPrice: DynamicPrice
  let deployer: SignerWithAddress
  let user: SignerWithAddress
  let user2: SignerWithAddress
  let calculateCheckpointPrice: (
    startingPrice: BigNumber,
    bumps: number,
    blockTime: number
  ) => Promise<BigNumber>
  const DEFAULT_TIMESTEP = 43200
  const TEST_STARTING_PRICE = ethers.utils.parseEther('0.01')
  const TEST_INCREASE_PER_BUMP = ethers.utils.parseEther('0.007') // 0.007 (scaled by 1e18), 1.007^100 ~= 2x ~= 200% increase per 100 bumps
  const TEST_DECREASE_PER_SECOND = ethers.utils.parseEther('0.0000013') // 1.3e-6 = (1-0.9999987) (scaled by 1e18), 0.9999987^86400 ~= 0.893x ~= 10.7% decrease per day
  const NORMAL_ERROR_THRESHOLD = 50000 // 50000 wei acceptable error threshold for small bump
  const LARGE_ERROR_THRESHOLD = ethers.utils.parseEther('200000000000000')
  // disparity between JS calculated value and contract result is 1.56e32 for 10000 bumps, or a difference of ~ 7.914e-13%
  const TEST_S_BUMP = 1 // 1.007^1 = 1.007x
  const TEST_M_BUMP = 100 // 1.007^100 ~= 2x
  const TEST_L_BUMP = 10000 // 1.007^10000 ~= 1.97e30x
  const ONE_WAD = ethers.utils.parseEther('1') // wad is terminology used for 1e18 by dapptools/DS-Math library

  before(() => {
    calculateCheckpointPrice = async (
      startingPrice: BigNumber,
      bumps: number,
      blockTime: number
    ): Promise<BigNumber> => {
      const blockTimeBN = BigNumber.from(blockTime)
      const checkpointTime = await dynamicPrice.getCheckpointTime()
      const increasePerBump = await dynamicPrice.getIncreasePercentPerBump()
      const decreasePerSecond = await dynamicPrice.getReductionPercentPerSecond()
      let newCheckpointPrice = startingPrice
      const sinceLastCheckpoint = blockTimeBN.sub(checkpointTime)
      // calculate increases from bumps
      const increaseFactor = ONE_WAD.add(increasePerBump)
      for (let i = 0; i < bumps; i++) {
        newCheckpointPrice = newCheckpointPrice.mul(increaseFactor).div(ONE_WAD)
      }
      // calculate decreases from time passing
      const decreaseFactor = ONE_WAD.sub(decreasePerSecond)
      for (let i = 0; i < sinceLastCheckpoint.toNumber(); i++) {
        newCheckpointPrice = newCheckpointPrice.mul(decreaseFactor).div(ONE_WAD)
      }
      return newCheckpointPrice
    }
  })

  beforeEach(async () => {
    ;[deployer, user, user2] = await ethers.getSigners()
    dynamicPrice = await dynamicPriceFixture()
  })

  describe('# initialize', () => {
    it('should be initialized with correct values', async () => {
      expect(await dynamicPrice.getTimestep()).to.eq(0)
      expect(await dynamicPrice.getCheckpointTime()).to.eq(0)
      expect(await dynamicPrice.getCheckpointPrice()).to.eq(0)
      expect(await dynamicPrice.getIncreasePercentPerBump()).to.eq(0)
      expect(await dynamicPrice.getReductionPercentPerSecond()).to.eq(0)
    })

    it('owner should be set to deployer', async () => {
      expect(await dynamicPrice.owner()).to.eq(deployer.address)
    })
  })

  describe('# resetCheckpoint', () => {
    it('should only be usable by the owner', async () => {
      expect(await dynamicPrice.getCheckpointTime()).to.eq(0)
      expect(await dynamicPrice.getCheckpointPrice()).to.eq(0)

      await expect(dynamicPrice.connect(user).resetCheckpoint(TEST_STARTING_PRICE)).to.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should set the last checkpoint time and price to the current time and provided price', async () => {
      expect(await dynamicPrice.getCheckpointTime()).to.eq(0)
      expect(await dynamicPrice.getCheckpointPrice()).to.eq(0)

      await dynamicPrice.connect(deployer).resetCheckpoint(TEST_STARTING_PRICE)

      const blockNumBefore = await ethers.provider.getBlockNumber()
      const blockBefore = await ethers.provider.getBlock(blockNumBefore)
      expect(await dynamicPrice.getCheckpointTime()).to.eq(blockBefore.timestamp)
      expect(await dynamicPrice.getCheckpointPrice()).to.eq(TEST_STARTING_PRICE)
    })

    it('should emit a CheckpointUpdated event', async () => {
      await dynamicPrice.connect(deployer).resetCheckpoint(TEST_STARTING_PRICE)

      const updateTime = await getLastTimestamp()
      const event = await getCheckpointUpdatedEvent(dynamicPrice)
      expect(event.time).to.eq(updateTime)
      expect(event.price).to.eq(TEST_STARTING_PRICE)
    })
  })

  describe('# setTimestep', () => {
    it('should only be usable by the owner', async () => {
      expect(await dynamicPrice.getTimestep()).to.eq(0)

      await expect(dynamicPrice.connect(user).setTimestep(DEFAULT_TIMESTEP)).to.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should correctly set to a value', async () => {
      expect(await dynamicPrice.getTimestep()).to.eq(0)

      await dynamicPrice.connect(deployer).setTimestep(DEFAULT_TIMESTEP)

      expect(await dynamicPrice.getTimestep()).to.eq(DEFAULT_TIMESTEP)
    })

    it('should correctly set the same value twice', async () => {
      expect(await dynamicPrice.getTimestep()).to.eq(0)

      await dynamicPrice.connect(deployer).setTimestep(DEFAULT_TIMESTEP)

      expect(await dynamicPrice.getTimestep()).to.eq(DEFAULT_TIMESTEP)

      await dynamicPrice.connect(deployer).setTimestep(DEFAULT_TIMESTEP)

      expect(await dynamicPrice.getTimestep()).to.eq(DEFAULT_TIMESTEP)
    })

    it('should emit a TimestepChanged event', async () => {
      await dynamicPrice.connect(deployer).setTimestep(DEFAULT_TIMESTEP)

      const event = await getTimestepChangedEvent(dynamicPrice)
      expect(event.timestep).to.eq(DEFAULT_TIMESTEP)
    })
  })

  describe('# setIncreasePercentPerBump', () => {
    it('should only be usable by the owner', async () => {
      expect(await dynamicPrice.getIncreasePercentPerBump()).to.eq(0)

      await expect(
        dynamicPrice.connect(user).setIncreasePercentPerBump(TEST_INCREASE_PER_BUMP)
      ).to.revertedWith('Ownable: caller is not the owner')
    })

    it('should correctly set to a value', async () => {
      expect(await dynamicPrice.getIncreasePercentPerBump()).to.eq(0)

      await dynamicPrice.connect(deployer).setIncreasePercentPerBump(TEST_INCREASE_PER_BUMP)

      expect(await dynamicPrice.getIncreasePercentPerBump()).to.eq(TEST_INCREASE_PER_BUMP)
    })

    it('should correctly set the same value twice', async () => {
      expect(await dynamicPrice.getIncreasePercentPerBump()).to.eq(0)

      await dynamicPrice.connect(deployer).setIncreasePercentPerBump(TEST_INCREASE_PER_BUMP)

      expect(await dynamicPrice.getIncreasePercentPerBump()).to.eq(TEST_INCREASE_PER_BUMP)

      await dynamicPrice.connect(deployer).setIncreasePercentPerBump(TEST_INCREASE_PER_BUMP)

      expect(await dynamicPrice.getIncreasePercentPerBump()).to.eq(TEST_INCREASE_PER_BUMP)
    })

    it('should emit a IncreasePercentPerBumpChanged event', async () => {
      await dynamicPrice.connect(deployer).setIncreasePercentPerBump(TEST_INCREASE_PER_BUMP)

      const event = await getIncreasePercentPerBumpChangedEvent(dynamicPrice)
      expect(event.percent).to.eq(TEST_INCREASE_PER_BUMP)
    })
  })

  describe('# setReductionPercentPerSecond', () => {
    it('should only be usable by the owner', async () => {
      expect(await dynamicPrice.getReductionPercentPerSecond()).to.eq(0)

      await expect(
        dynamicPrice.connect(user).setReductionPercentPerSecond(TEST_DECREASE_PER_SECOND)
      ).to.revertedWith('Ownable: caller is not the owner')
    })

    it('should not allow setting of percentage greater than 100%', async () => {
      expect(await dynamicPrice.getReductionPercentPerSecond()).to.eq(0)

      await expect(
        dynamicPrice.connect(deployer).setReductionPercentPerSecond(ONE_WAD.add(1))
      ).to.revertedWith('reduction exceeds 100%')
    })

    it('should correctly set to a value', async () => {
      expect(await dynamicPrice.getReductionPercentPerSecond()).to.eq(0)

      await dynamicPrice.connect(deployer).setReductionPercentPerSecond(TEST_DECREASE_PER_SECOND)

      expect(await dynamicPrice.getReductionPercentPerSecond()).to.eq(TEST_DECREASE_PER_SECOND)
    })

    it('should correctly set the same value twice', async () => {
      expect(await dynamicPrice.getReductionPercentPerSecond()).to.eq(0)

      await dynamicPrice.connect(deployer).setReductionPercentPerSecond(TEST_DECREASE_PER_SECOND)

      expect(await dynamicPrice.getReductionPercentPerSecond()).to.eq(TEST_DECREASE_PER_SECOND)

      await dynamicPrice.connect(deployer).setReductionPercentPerSecond(TEST_DECREASE_PER_SECOND)

      expect(await dynamicPrice.getReductionPercentPerSecond()).to.eq(TEST_DECREASE_PER_SECOND)
    })

    it('should emit a ReductionPercentPerSecond event', async () => {
      await dynamicPrice.connect(deployer).setReductionPercentPerSecond(TEST_DECREASE_PER_SECOND)

      const event = await getReductionPercentPerSecondChangedEvent(dynamicPrice)
      expect(event.percent).to.eq(TEST_DECREASE_PER_SECOND)
    })
  })

  /**
   * Tried to use to.eq before, but every result I got, even when using PRB's own JS library,
   * returned a value 33 wei above what the contract returns (for compounding 43200 seconds of decrease).
   * Resorted to using to.be.closeTo since even PRB's own tests use to.be.near, rather than to.eq.
   * 11211043469938228 versus JS calculated 11211043469938261
   *
   * Using the ethers js BigNumber library to calculate checkpoint prices results in
   * a disparity between JS and Solidity computed values ~20000 wei for small changes (< 100%)
   * When a bump count of 10000 was passed in, resulting in an effective price increase of
   * 117905400%, a disparity of ~1 billion wei was seen. While these are not necessarily
   * too problematic since they are still small in terms of wei values, this means the
   * disparity grows along with the size of the increase/decrease.
   */
  describe('# updatePrice', () => {
    beforeEach(async () => {
      await dynamicPrice.connect(deployer).setIncreasePercentPerBump(TEST_INCREASE_PER_BUMP)
      await dynamicPrice.connect(deployer).setReductionPercentPerSecond(TEST_DECREASE_PER_SECOND)
      await dynamicPrice.connect(deployer).setTimestep(DEFAULT_TIMESTEP)
    })

    it("should return 0 if start time hasn't been set", async () => {
      expect(await dynamicPrice.getCheckpointTime()).to.eq(0)
      expect(await dynamicPrice.getCheckpointPrice()).to.eq(0)

      expect(await dynamicPrice.callStatic.updatePrice(TEST_M_BUMP)).to.eq(0)
    })

    it("should not update checkpoint price if the timestep hasn't passed", async () => {
      await dynamicPrice.connect(deployer).resetCheckpoint(TEST_STARTING_PRICE)
      const checkpointBefore = await dynamicPrice.getCheckpointPrice()

      await dynamicPrice.updatePrice(TEST_M_BUMP)

      expect(await dynamicPrice.getCheckpointPrice()).to.eq(checkpointBefore)
    })

    it('should calculate the first checkpoint from the starting price set', async () => {
      await dynamicPrice.connect(deployer).resetCheckpoint(TEST_STARTING_PRICE)
      const updateTime = (await getLastTimestamp()) + DEFAULT_TIMESTEP
      const expectedCheckpoint = await calculateCheckpointPrice(
        TEST_STARTING_PRICE,
        TEST_M_BUMP,
        updateTime
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, updateTime)

      await dynamicPrice.updatePrice(TEST_M_BUMP)

      expect(await dynamicPrice.getCheckpointPrice()).to.be.closeTo(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expectedCheckpoint as any,
        NORMAL_ERROR_THRESHOLD
      )
    })

    it('should calculate update correctly if multiple timesteps have passed', async () => {
      await dynamicPrice.connect(deployer).resetCheckpoint(TEST_STARTING_PRICE)
      const updateTime = (await getLastTimestamp()) + DEFAULT_TIMESTEP * 2
      const expectedCheckpoint = await calculateCheckpointPrice(
        TEST_STARTING_PRICE,
        TEST_M_BUMP,
        updateTime
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, updateTime)

      await dynamicPrice.updatePrice(TEST_M_BUMP)

      expect(await dynamicPrice.getCheckpointPrice()).to.be.closeTo(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expectedCheckpoint as any,
        NORMAL_ERROR_THRESHOLD
      )
    })

    it('should calculate the subsequent updates from the last price', async () => {
      await dynamicPrice.connect(deployer).resetCheckpoint(TEST_STARTING_PRICE)
      // initial update
      let updateTime = (await getLastTimestamp()) + DEFAULT_TIMESTEP
      let expectedCheckpoint = await calculateCheckpointPrice(
        TEST_STARTING_PRICE,
        TEST_M_BUMP,
        updateTime
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, updateTime)
      await dynamicPrice.updatePrice(TEST_M_BUMP)
      // subsequent update
      updateTime += DEFAULT_TIMESTEP
      expectedCheckpoint = await calculateCheckpointPrice(
        await dynamicPrice.getCheckpointPrice(),
        TEST_M_BUMP,
        updateTime
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, updateTime)

      await dynamicPrice.updatePrice(TEST_M_BUMP)

      expect(await dynamicPrice.getCheckpointPrice()).to.be.closeTo(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expectedCheckpoint as any,
        NORMAL_ERROR_THRESHOLD
      )
    })

    it('should accumulate bumps and reset total bump count once checkpoint is reached', async () => {
      await dynamicPrice.connect(deployer).resetCheckpoint(TEST_STARTING_PRICE)
      const updateTime = (await getLastTimestamp()) + DEFAULT_TIMESTEP
      await dynamicPrice.updatePrice(TEST_M_BUMP)
      expect(await dynamicPrice.getBumpCountSinceCheckpoint()).to.eq(TEST_M_BUMP)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, updateTime)

      await dynamicPrice.updatePrice(TEST_M_BUMP)

      expect(await dynamicPrice.getBumpCountSinceCheckpoint()).to.eq(0)
    })

    it('should calculate checkpoint using the accumulated bumps since the last checkpoint', async () => {
      await dynamicPrice.connect(deployer).resetCheckpoint(TEST_STARTING_PRICE)
      const updateTime = (await getLastTimestamp()) + DEFAULT_TIMESTEP
      await dynamicPrice.updatePrice(TEST_M_BUMP)
      const expectedCheckpoint = await calculateCheckpointPrice(
        TEST_STARTING_PRICE,
        TEST_M_BUMP * 2,
        updateTime
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, updateTime)

      await dynamicPrice.updatePrice(TEST_M_BUMP)

      expect(await dynamicPrice.getCheckpointPrice()).to.be.closeTo(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expectedCheckpoint as any,
        NORMAL_ERROR_THRESHOLD
      )
    })

    it('should be able to handle a small bump count', async () => {
      await dynamicPrice.connect(deployer).resetCheckpoint(TEST_STARTING_PRICE)
      const updateTime = (await getLastTimestamp()) + DEFAULT_TIMESTEP
      const expectedCheckpoint = await calculateCheckpointPrice(
        TEST_STARTING_PRICE,
        TEST_S_BUMP,
        updateTime
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, updateTime)

      await dynamicPrice.updatePrice(TEST_S_BUMP)

      expect(await dynamicPrice.getCheckpointPrice()).to.be.closeTo(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expectedCheckpoint as any,
        NORMAL_ERROR_THRESHOLD
      )
    })

    it('should be able to handle a large bump count', async () => {
      await dynamicPrice.connect(deployer).resetCheckpoint(TEST_STARTING_PRICE)
      const updateTime = (await getLastTimestamp()) + DEFAULT_TIMESTEP
      const expectedCheckpoint = await calculateCheckpointPrice(
        TEST_STARTING_PRICE,
        TEST_L_BUMP,
        updateTime
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, updateTime)

      await dynamicPrice.updatePrice(TEST_L_BUMP)

      expect(await dynamicPrice.getCheckpointPrice()).to.be.closeTo(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expectedCheckpoint as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        LARGE_ERROR_THRESHOLD as any
      )
    })

    it('should emit a CheckpointUpdated event', async () => {
      await dynamicPrice.connect(deployer).resetCheckpoint(TEST_STARTING_PRICE)
      const updateTime = (await getLastTimestamp()) + DEFAULT_TIMESTEP
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, updateTime)

      await dynamicPrice.updatePrice(TEST_M_BUMP)

      const event = await getCheckpointUpdatedEvent(dynamicPrice)
      expect(event.time).to.eq(updateTime)
      expect(event.price).to.eq(await dynamicPrice.getCheckpointPrice())
    })
  })
})
