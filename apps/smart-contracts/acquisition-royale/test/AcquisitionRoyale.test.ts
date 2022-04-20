import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import chai, { expect } from 'chai'
import { solidity } from 'ethereum-waffle'
import { BigNumber, Contract, providers } from 'ethers'
import { parseEther } from 'ethers/lib/utils'
import { ethers } from 'hardhat'
import { MerkleTree } from 'merkletreejs'
import { MockContract, smock } from '@defi-wonderland/smock'
import {
  getAcquisitionEvent,
  getCompeteChangedEvent,
  getCompeteEvent,
  getDepositEvent,
  getERC20TransferEvent,
  getFallbackBrandingChangedEvent,
  getFoundingPriceAndTimeChangedEvent,
  getGameStartTimeChangedEvent,
  getImmunityPeriodsChangedEvent,
  getMergerBurnPercentageChangedEvent,
  getMergerEvent,
  getPassiveRpPerDayChangedEvent,
  getRebrandEvent,
  getRenameEvent,
  getRevivalEvent,
  getSupportForBrandingChangedEvent,
  getWithdrawalBurnPercentageChangedEvent,
  getWithdrawalEvent,
} from './events'
import { acquisitionRoyaleConsumablesFixture } from './fixtures/AcquisitionRoyaleConsumablesFixture'
import {
  mockAcquisitionRoyaleFixture,
  PassiveRpParams,
  PriceAndTimeParams,
  setFoundingPriceAndTimeFixture,
  setPassiveRpPerDayFixture,
} from './fixtures/AcquisitionRoyaleFixture'
import {
  mockBlankBrandingFixture,
  mockBrandingFixture,
  mockFallbackBrandingFixture,
  mockRevertBrandingFixture,
} from './fixtures/BrandingFixture'
import { mockCompeteFixture } from './fixtures/CompeteFixture'
import { fixedCostFixture } from './fixtures/FixedCostFixture'
import { merkleProofVerifierFixture } from './fixtures/MerkleProofVerifierFixture'
import { mockERC20Fixture } from './fixtures/MockERC20Fixture'
import { runwayPointsFixture } from './fixtures/RunwayPointsFixture'
import { acqrHookV1Fixture } from './fixtures/AcqrHookFixture'
import {
  AddressZero,
  generateMerkleTree,
  getLastTimestamp,
  hashAddress,
  mineBlock,
  mineBlocks,
  PERCENT_DENOMINATOR,
  setNextTimestamp,
} from './utils'
import { moatFixture } from './fixtures/MoatFixture'
import { FixedCost } from '../typechain'
import { AcquisitionRoyaleConsumables } from '../typechain/AcquisitionRoyaleConsumables'
import { MerkleProofVerifier } from '../typechain/MerkleProofVerifier'
import { MockAcquisitionRoyale } from '../typechain/MockAcquisitionRoyale'
import { MockBlankBranding } from '../typechain/MockBlankBranding'
import { MockBranding } from '../typechain/MockBranding'
import { MockCompete } from '../typechain/MockCompete'
import { MockERC20 } from '../typechain/MockERC20'
import { MockFallbackBranding } from '../typechain/MockFallbackBranding'
import { MockRevertBranding } from '../typechain/MockRevertBranding'
import { RunwayPoints } from '../typechain/RunwayPoints'
import { AcqrHookV1 } from '../typechain/AcqrHookV1'
import { Moat } from '../typechain/Moat'
import { randomInt } from 'crypto'

chai.use(solidity)
chai.use(smock.matchers)

describe('=> AcquisitionRoyale', () => {
  let merkleProofVerifier: MerkleProofVerifier
  let acquisitionRoyale: MockAcquisitionRoyale
  let mockWeth: MockERC20
  let runwayPoints: RunwayPoints
  let royaleConsumables: AcquisitionRoyaleConsumables
  let mockCompete: MockCompete
  let acquireCost: FixedCost
  let acquireRpCost: FixedCost
  let mergeCost: FixedCost
  let mergeRpCost: FixedCost
  let acquireRpRewardCost: FixedCost
  let mockBranding: MockBranding
  let mockFallbackBranding: MockFallbackBranding
  let mockBlankBranding: MockBlankBranding
  let mockRevertBranding: MockRevertBranding
  let acqrHook: AcqrHookV1
  let moat: Moat
  let deployer: SignerWithAddress
  let user: SignerWithAddress
  let user2: SignerWithAddress
  let treasury: SignerWithAddress
  let eligibleAddresses: string[]
  let userProof: string[]
  let merkleTree: MerkleTree
  let testStartTime: number
  let testEndTime: number
  let defaultPriceAndTimeParams: PriceAndTimeParams
  let testPassiveRpParams: PassiveRpParams
  let setFoundingPriceAndTime: (params: PriceAndTimeParams) => Promise<void>
  let setPassiveRpPerDay: (params: PassiveRpParams) => Promise<void>
  let calculateAuctionPrice: (blockTime: number) => Promise<BigNumber>
  let calculateCompeteSpend: (rpToSpend: BigNumber, targetBalance: BigNumber) => Promise<BigNumber>
  let calculateMergerBurn: (targetBalance: BigNumber) => Promise<BigNumber>
  let calculateVirtualBalance: (enterpriseId: number, blockTime: number) => Promise<BigNumber>
  let fundEnterprise: (
    account: SignerWithAddress,
    enterpriseId: number,
    amount: BigNumber
  ) => Promise<void>
  let rpToKillTarget: (blockTime: number, callerId: number, targetId: number) => Promise<BigNumber>
  let preventVirtualBalanceUpdate: (enterpriseIds: number[]) => Promise<void>
  let fundRenameTokens: (recipient: string, amount: number) => Promise<void>
  let fundRebrandTokens: (recipient: string, amount: number) => Promise<void>
  let fundReviveTokens: (recipient: string, amount: number) => Promise<void>
  let renameTokenBalance: (account: string) => Promise<BigNumber>
  let rebrandTokenBalance: (account: string) => Promise<BigNumber>
  let reviveTokenBalance: (account: string) => Promise<BigNumber>
  const TEST_START_PRICE = ethers.utils.parseEther('0.08')
  const TEST_END_PRICE = ethers.utils.parseEther('0.008')
  const AUCTION_SUPPLY = 9000
  const FREE_SUPPLY = 5000 // deprecated, purely for checking correct value of contract constant
  const RESERVED_SUPPLY = 1000
  const AUCTION_STARTING_ID = 0
  const RESERVED_STARTING_ID = AUCTION_SUPPLY
  const TEST_FOUNDING_PERIOD = 1209600 // 2 weeks
  const TEST_ACQUISITION_IMMUNITY = 86400 // 1 days
  const TEST_MERGER_IMMUNITY = 43200 // 0.5 days
  const TEST_REVIVAL_IMMUNITY = 172800 // 2 days
  const TEST_COMPETE_RP = ethers.utils.parseEther('3')
  const TEST_DEPOSIT_RP = ethers.utils.parseEther('1')
  const TEST_MERGER_BURN = 500000000 // 5%
  const DEFAULT_WITHDRAWAL_BURN = 2500000000 // 25%
  const TEST_WITHDRAWAL_BURN = 1500000000 // 15%
  const TEST_TIME_DELAY = 10
  // default 20 max rp/day, 1 base rp/day, 2 rp/day per acquisition, 1 rp/day per merger
  const DEFAULT_PASSIVE_MAX = ethers.utils.parseEther('20')
  const DEFAULT_PASSIVE_BASE = ethers.utils.parseEther('1')
  const DEFAULT_PASSIVE_ACQUISITIONS = ethers.utils.parseEther('2')
  const DEFAULT_PASSIVE_MERGERS = ethers.utils.parseEther('1')
  /**
   * ICost contract starting values for native funding, they should all be unique so we
   * can verify the right value is being read from. Although amountToBurn is ignored, we
   * need to configure the contract with a value to demonstrate it is ignored.
   */
  const acquireNativeDefaultParams = {
    amountToRecipient: parseEther('1'),
    amountToTreasury: parseEther('2'),
    amountToBurn: parseEther('3'),
  }
  const mergeNativeDefaultParams = {
    amountToRecipient: parseEther('4'),
    amountToTreasury: parseEther('5'),
    amountToBurn: parseEther('6'),
  }
  // ICost contract starting values for RP funding.
  const acquireRpDefaultParams = {
    amountToRecipient: parseEther('1.1'),
    amountToTreasury: parseEther('2.1'),
    amountToBurn: parseEther('3.1'),
  }
  const mergeRpDefaultParams = {
    amountToRecipient: parseEther('4.1'),
    amountToTreasury: parseEther('5.1'),
    amountToBurn: parseEther('6.1'),
  }
  // ICost contract values for RP rewards given to acquisition targets.
  const acquireRpRewardDefaultParams = {
    amountToRecipient: parseEther('1.2'),
    amountToTreasury: parseEther('2.2'),
    amountToBurn: parseEther('3.2'),
  }
  const testMoatThreshold = parseEther('50')
  const testMoatImmunityPeriod = 172800 // 2 days in seconds

  before(async () => {
    ;[deployer, user, user2, treasury] = await ethers.getSigners()
    eligibleAddresses = [deployer.address, user.address, treasury.address]
    merkleTree = generateMerkleTree(eligibleAddresses)
    merkleProofVerifier = await merkleProofVerifierFixture(merkleTree.getHexRoot())
    userProof = merkleTree.getHexProof(hashAddress(user.address))
    setFoundingPriceAndTime = async (params): Promise<void> => {
      await setFoundingPriceAndTimeFixture(params)
    }
    setPassiveRpPerDay = async (params): Promise<void> => {
      await setPassiveRpPerDayFixture(params)
    }
    calculateAuctionPrice = async (blockTime: number): Promise<BigNumber> => {
      const blockTimeBN = BigNumber.from(blockTime)
      const foundingParameters = await acquisitionRoyale.getFoundingPriceAndTime()
      const decayPerSecond = foundingParameters._startPrice
        .sub(foundingParameters._endPrice)
        .div(foundingParameters._endTime.sub(foundingParameters._startTime))
        .add(1)
      const auctionPrice = foundingParameters._startPrice.sub(
        decayPerSecond.mul(blockTimeBN.sub(foundingParameters._startTime))
      )
      return auctionPrice.lt(foundingParameters._endPrice)
        ? foundingParameters._endPrice
        : auctionPrice
    }
    calculateCompeteSpend = async (
      rpToSpend: BigNumber,
      targetBalance: BigNumber
    ): Promise<BigNumber> => {
      const damage = await mockCompete.getDamage(0, 0, rpToSpend)
      if (damage.eq(targetBalance)) {
        return rpToSpend
      }
      const percentOfBase = targetBalance.mul(PERCENT_DENOMINATOR).div(damage).add(1)
      return rpToSpend.mul(percentOfBase).div(PERCENT_DENOMINATOR)
    }
    calculateMergerBurn = async (targetBalance: BigNumber): Promise<BigNumber> =>
      targetBalance
        .mul(await acquisitionRoyale.getMergerBurnPercentage())
        .div(PERCENT_DENOMINATOR)
        .add(1)
    calculateVirtualBalance = async (
      enterpriseId: number,
      blockTime: number
    ): Promise<BigNumber> => {
      const gameStartTime = (await acquisitionRoyale.getGameStartTime()).toNumber()
      const enterpriseBefore = await acquisitionRoyale.getEnterprise(enterpriseId)
      if (blockTime < gameStartTime || gameStartTime === 0) {
        return enterpriseBefore.rp
      }
      const lastUpdated = enterpriseBefore.lastRpUpdateTime.eq(0)
        ? gameStartTime
        : enterpriseBefore.lastRpUpdateTime.toNumber()
      const passiveRates = await acquisitionRoyale.getPassiveRpPerDay()
      let rpPerDay = passiveRates._base
        .add(passiveRates._acquisitions.mul(enterpriseBefore.acquisitions))
        .add(passiveRates._mergers.mul(enterpriseBefore.mergers))
      rpPerDay = rpPerDay.gt(passiveRates._max) ? passiveRates._max : rpPerDay
      return enterpriseBefore.rp.add(rpPerDay.mul(blockTime - lastUpdated).div(86400))
    }
    fundEnterprise = async (
      account: SignerWithAddress,
      enterpriseId: number,
      amount: BigNumber
    ): Promise<void> => {
      await runwayPoints.connect(deployer).transfer(account.address, amount)
      await acquisitionRoyale.connect(account).deposit(enterpriseId, amount)
    }
    rpToKillTarget = async (
      callerId: number,
      targetId: number,
      blockTime: number
    ): Promise<BigNumber> => {
      const expectedTargetBalance = await calculateVirtualBalance(targetId, blockTime)
      const amountToBankrupt = await mockCompete.getRpRequiredForDamage(
        callerId,
        targetId,
        expectedTargetBalance
      )
      return amountToBankrupt
    }
    preventVirtualBalanceUpdate = async (enterpriseIds: number[]): Promise<void> => {
      const expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
      // eslint-disable-next-line no-restricted-syntax
      for (const id of enterpriseIds) {
        // eslint-disable-next-line no-await-in-loop
        await acquisitionRoyale.connect(treasury).setEnterpriseLastRpUpdateTime(id, expectedTime)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, expectedTime)
    }
    fundRenameTokens = async (recipient: string, amount: number): Promise<void> => {
      await royaleConsumables.safeTransferFrom(deployer.address, recipient, 0, amount, [])
    }
    fundRebrandTokens = async (recipient: string, amount: number): Promise<void> => {
      await royaleConsumables.safeTransferFrom(deployer.address, recipient, 1, amount, [])
    }
    fundReviveTokens = async (recipient: string, amount: number): Promise<void> => {
      await royaleConsumables.safeTransferFrom(deployer.address, recipient, 2, amount, [])
    }
    renameTokenBalance = async (account: string): Promise<BigNumber> =>
      // eslint-disable-next-line @typescript-eslint/return-await
      await royaleConsumables.balanceOf(account, 0)
    rebrandTokenBalance = async (account: string): Promise<BigNumber> =>
      // eslint-disable-next-line @typescript-eslint/return-await
      await royaleConsumables.balanceOf(account, 1)
    reviveTokenBalance = async (account: string): Promise<BigNumber> =>
      // eslint-disable-next-line @typescript-eslint/return-await
      await royaleConsumables.balanceOf(account, 2)
  })

  beforeEach(async () => {
    mockWeth = await mockERC20Fixture('WETH9', 'WETH9')
    mockCompete = await mockCompeteFixture()
    acquireCost = await fixedCostFixture(acquireNativeDefaultParams)
    acquireRpCost = await fixedCostFixture(acquireRpDefaultParams)
    mergeCost = await fixedCostFixture(mergeNativeDefaultParams)
    mergeRpCost = await fixedCostFixture(mergeRpDefaultParams)
    acquireRpRewardCost = await fixedCostFixture(acquireRpRewardDefaultParams)
    mockBranding = await mockBrandingFixture()
    mockFallbackBranding = await mockFallbackBrandingFixture()
    mockBlankBranding = await mockBlankBrandingFixture()
    mockRevertBranding = await mockRevertBrandingFixture()
    acquisitionRoyale = await mockAcquisitionRoyaleFixture()
    runwayPoints = await runwayPointsFixture(acquisitionRoyale.address)
    royaleConsumables = await acquisitionRoyaleConsumablesFixture(
      'Acquisition Royale Consumables',
      'AQR-C',
      'rename.json',
      'rebrand.json',
      'revive.json',
      acquisitionRoyale.address
    )
    await acquisitionRoyale.initialize(
      'Acquisition Royale',
      'AQR',
      merkleProofVerifier.address,
      mockWeth.address,
      runwayPoints.address,
      royaleConsumables.address
    )
    await acquisitionRoyale.transferOwnership(treasury.address)
    await acquisitionRoyale
      .connect(treasury)
      .setCostContracts(
        acquireCost.address,
        mergeCost.address,
        acquireRpCost.address,
        mergeRpCost.address,
        acquireRpRewardCost.address
      )
    moat = await moatFixture(acquisitionRoyale.address, testMoatThreshold, testMoatImmunityPeriod)
    acqrHook = await acqrHookV1Fixture(acquisitionRoyale.address, moat.address)
    await moat.setAcqrHook(acqrHook.address)
    await acquisitionRoyale.connect(treasury).setHook(acqrHook.address)
    testStartTime = await getLastTimestamp()
    testEndTime = testStartTime + TEST_FOUNDING_PERIOD
    defaultPriceAndTimeParams = {
      caller: treasury,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      royale: acquisitionRoyale as any,
      startPrice: TEST_START_PRICE,
      endPrice: TEST_END_PRICE,
      startTime: testStartTime,
      endTime: testEndTime,
    }
    testPassiveRpParams = {
      caller: treasury,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      royale: acquisitionRoyale as any,
      max: DEFAULT_PASSIVE_MAX.add(1),
      base: DEFAULT_PASSIVE_BASE.add(1),
      acquisitions: DEFAULT_PASSIVE_ACQUISITIONS.add(1),
      mergers: DEFAULT_PASSIVE_MERGERS.add(1),
    }
  })

  describe('# initialize', () => {
    it('should be initialized with correct values', async () => {
      expect(await acquisitionRoyale.owner()).to.eq(treasury.address)
      expect(await acquisitionRoyale.getRunwayPoints()).to.eq(runwayPoints.address)
      expect(await acquisitionRoyale.getConsumables()).to.eq(royaleConsumables.address)
      expect(await acquisitionRoyale.getReservedCount()).to.eq(0)
      expect(await acquisitionRoyale.getFreeCount()).to.eq(0)
      expect(await acquisitionRoyale.getAuctionCount()).to.eq(0)
      const foundingParameters = await acquisitionRoyale.getFoundingPriceAndTime()
      expect(foundingParameters._startPrice).to.eq(0)
      expect(foundingParameters._endPrice).to.eq(0)
      expect(foundingParameters._startTime).to.eq(0)
      expect(foundingParameters._endTime).to.eq(0)
      expect(await acquisitionRoyale.hasFoundedFree(user.address)).to.eq(false)
      expect(await acquisitionRoyale.getMaxReserved()).to.eq(1000)
      expect(await acquisitionRoyale.getMaxFree()).to.eq(FREE_SUPPLY)
      expect(await acquisitionRoyale.getMaxAuctioned()).to.eq(AUCTION_SUPPLY)
    })
  })

  describe('# fallback', () => {
    it('should have contract revert upon a direct native token transfer', async () => {
      await expect(
        user.sendTransaction({
          to: acquisitionRoyale.address,
          value: ethers.utils.parseEther('1.0'),
        })
      ).revertedWith('Direct transfers not supported')
    })
  })

  describe('# setGameStartTime', () => {
    it('should only be usable by the owner', async () => {
      await expect(
        acquisitionRoyale.connect(user).setGameStartTime(await getLastTimestamp())
      ).revertedWith('Ownable: caller is not the owner')
    })

    it('should allow setting to a non-zero value', async () => {
      const currentTime = await getLastTimestamp()
      await acquisitionRoyale.connect(treasury).setGameStartTime(currentTime)

      expect(await acquisitionRoyale.getGameStartTime()).to.eq(currentTime)
    })

    it('should not be settable after game start time has already passed', async () => {
      const currentTime = await getLastTimestamp()
      await acquisitionRoyale.connect(treasury).setGameStartTime(currentTime)

      await expect(acquisitionRoyale.connect(treasury).setGameStartTime(currentTime)).revertedWith(
        'game already started'
      )
    })

    it('should emit a GameStartTimeChanged event', async () => {
      const currentTime = await getLastTimestamp()
      await acquisitionRoyale.connect(treasury).setGameStartTime(currentTime)

      const gameStartTimeChangedEvent = await getGameStartTimeChangedEvent(acquisitionRoyale)
      expect(gameStartTimeChangedEvent.startTime).to.eq(currentTime)
    })
  })

  describe('# setFoundingPriceAndTime', () => {
    it('should only be usable by the owner', async () => {
      await expect(
        setFoundingPriceAndTime({
          ...defaultPriceAndTimeParams,
          caller: user,
        })
      ).to.revertedWith('Ownable: caller is not the owner')
    })

    it('should not allow end price to be >= start price', async () => {
      await expect(
        setFoundingPriceAndTime({
          ...defaultPriceAndTimeParams,
          endPrice: TEST_START_PRICE,
        })
      ).to.revertedWith('start price must be > end price')
    })

    it('should not allow start time to be >= end time', async () => {
      await expect(
        setFoundingPriceAndTime({
          ...defaultPriceAndTimeParams,
          startTime: testEndTime,
        })
      ).to.revertedWith('end time must be > start time')
    })

    it('should correctly set start/end time and start/end price', async () => {
      const foundingParameters = await acquisitionRoyale.getFoundingPriceAndTime()
      expect(foundingParameters._startPrice).to.eq(0)
      expect(foundingParameters._endPrice).to.eq(0)
      expect(foundingParameters._startTime).to.eq(0)
      expect(foundingParameters._endTime).to.eq(0)

      await setFoundingPriceAndTime(defaultPriceAndTimeParams)

      const newFoundingParameters = await acquisitionRoyale.getFoundingPriceAndTime()
      expect(newFoundingParameters._startPrice).to.eq(TEST_START_PRICE)
      expect(newFoundingParameters._endPrice).to.eq(TEST_END_PRICE)
      expect(newFoundingParameters._startTime).to.eq(testStartTime)
      expect(newFoundingParameters._endTime).to.eq(testEndTime)
    })

    it('should correctly set the same values twice', async () => {
      const foundingParameters = await acquisitionRoyale.getFoundingPriceAndTime()
      expect(foundingParameters._startPrice).to.eq(0)
      expect(foundingParameters._endPrice).to.eq(0)
      expect(foundingParameters._startTime).to.eq(0)
      expect(foundingParameters._endTime).to.eq(0)

      await setFoundingPriceAndTime(defaultPriceAndTimeParams)

      let newFoundingParameters = await acquisitionRoyale.getFoundingPriceAndTime()
      expect(newFoundingParameters._startPrice).to.eq(TEST_START_PRICE)
      expect(newFoundingParameters._endPrice).to.eq(TEST_END_PRICE)
      expect(newFoundingParameters._startTime).to.eq(testStartTime)
      expect(newFoundingParameters._endTime).to.eq(testEndTime)

      await setFoundingPriceAndTime(defaultPriceAndTimeParams)

      newFoundingParameters = await acquisitionRoyale.getFoundingPriceAndTime()
      expect(newFoundingParameters._startPrice).to.eq(TEST_START_PRICE)
      expect(newFoundingParameters._endPrice).to.eq(TEST_END_PRICE)
      expect(newFoundingParameters._startTime).to.eq(testStartTime)
      expect(newFoundingParameters._endTime).to.eq(testEndTime)
    })

    it('should emit a FoundingPriceAndTimeSet event', async () => {
      await setFoundingPriceAndTime(defaultPriceAndTimeParams)
      const foundingPriceAndTimeChangedEvent = await getFoundingPriceAndTimeChangedEvent(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        acquisitionRoyale as any
      )

      expect(foundingPriceAndTimeChangedEvent.startPrice).to.eq(TEST_START_PRICE)
      expect(foundingPriceAndTimeChangedEvent.endPrice).to.eq(TEST_END_PRICE)
      expect(foundingPriceAndTimeChangedEvent.startTime).to.eq(testStartTime)
      expect(foundingPriceAndTimeChangedEvent.endTime).to.eq(testEndTime)
    })
  })

  describe('# setPassiveRpPerDay', () => {
    it('should only be usable by the owner', async () => {
      await expect(
        setPassiveRpPerDay({
          ...testPassiveRpParams,
          caller: user,
        })
      ).to.revertedWith('Ownable: caller is not the owner')
    })

    it('should correctly set rp accumulation parameters', async () => {
      const passiveRpParameters = await acquisitionRoyale.getPassiveRpPerDay()
      expect(passiveRpParameters._max).to.eq(DEFAULT_PASSIVE_MAX)
      expect(passiveRpParameters._base).to.eq(DEFAULT_PASSIVE_BASE)
      expect(passiveRpParameters._acquisitions).to.eq(DEFAULT_PASSIVE_ACQUISITIONS)
      expect(passiveRpParameters._mergers).to.eq(DEFAULT_PASSIVE_MERGERS)

      await setPassiveRpPerDay(testPassiveRpParams)

      const newPassiveRpParameters = await acquisitionRoyale.getPassiveRpPerDay()
      expect(newPassiveRpParameters._max).to.eq(DEFAULT_PASSIVE_MAX.add(1))
      expect(newPassiveRpParameters._base).to.eq(DEFAULT_PASSIVE_BASE.add(1))
      expect(newPassiveRpParameters._acquisitions).to.eq(DEFAULT_PASSIVE_ACQUISITIONS.add(1))
      expect(newPassiveRpParameters._mergers).to.eq(DEFAULT_PASSIVE_MERGERS.add(1))
    })

    it('should correctly set the same values twice', async () => {
      await setPassiveRpPerDay(testPassiveRpParams)

      const passiveRpParameters = await acquisitionRoyale.getPassiveRpPerDay()
      expect(passiveRpParameters._max).to.eq(DEFAULT_PASSIVE_MAX.add(1))
      expect(passiveRpParameters._base).to.eq(DEFAULT_PASSIVE_BASE.add(1))
      expect(passiveRpParameters._acquisitions).to.eq(DEFAULT_PASSIVE_ACQUISITIONS.add(1))
      expect(passiveRpParameters._mergers).to.eq(DEFAULT_PASSIVE_MERGERS.add(1))

      await setPassiveRpPerDay(testPassiveRpParams)

      const newPassiveRpParameters = await acquisitionRoyale.getPassiveRpPerDay()
      expect(newPassiveRpParameters._max).to.eq(DEFAULT_PASSIVE_MAX.add(1))
      expect(newPassiveRpParameters._base).to.eq(DEFAULT_PASSIVE_BASE.add(1))
      expect(newPassiveRpParameters._acquisitions).to.eq(DEFAULT_PASSIVE_ACQUISITIONS.add(1))
      expect(newPassiveRpParameters._mergers).to.eq(DEFAULT_PASSIVE_MERGERS.add(1))
    })

    it('should emit a PassiveRpPerDayChanged event', async () => {
      await setPassiveRpPerDay(testPassiveRpParams)
      const passiveRpPerDayChangedEvent = await getPassiveRpPerDayChangedEvent(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        acquisitionRoyale as any
      )

      expect(passiveRpPerDayChangedEvent.max).to.eq(DEFAULT_PASSIVE_MAX.add(1))
      expect(passiveRpPerDayChangedEvent.base).to.eq(DEFAULT_PASSIVE_BASE.add(1))
      expect(passiveRpPerDayChangedEvent.acquisitions).to.eq(DEFAULT_PASSIVE_ACQUISITIONS.add(1))
      expect(passiveRpPerDayChangedEvent.mergers).to.eq(DEFAULT_PASSIVE_MERGERS.add(1))
    })
  })

  describe('# setImmunityPeriods', () => {
    it('should only be usable by the owner', async () => {
      await expect(
        acquisitionRoyale
          .connect(user)
          .setImmunityPeriods(
            TEST_ACQUISITION_IMMUNITY,
            TEST_MERGER_IMMUNITY,
            TEST_REVIVAL_IMMUNITY
          )
      ).revertedWith('Ownable: caller is not the owner')
    })

    it('should be able to set immunity periods to zero', async () => {
      await acquisitionRoyale.connect(treasury).setImmunityPeriods(0, 0, 0)

      const immunityPeriodAfter = await acquisitionRoyale.getImmunityPeriods()
      expect(immunityPeriodAfter._acquisition).to.eq(0)
      expect(immunityPeriodAfter._merger).to.eq(0)
      expect(immunityPeriodAfter._revival).to.eq(0)
    })

    it('should be able to set acquisition immunity period to a non-zero value', async () => {
      const immunityPeriodBefore = await acquisitionRoyale.getImmunityPeriods()
      expect(immunityPeriodBefore._acquisition).to.eq(0)

      await acquisitionRoyale.connect(treasury).setImmunityPeriods(TEST_ACQUISITION_IMMUNITY, 0, 0)

      const immunityPeriodAfter = await acquisitionRoyale.getImmunityPeriods()
      expect(immunityPeriodAfter._acquisition).to.eq(TEST_ACQUISITION_IMMUNITY)
    })

    it('should be able to set merger immunity period to a non-zero value', async () => {
      const immunityPeriodBefore = await acquisitionRoyale.getImmunityPeriods()
      expect(immunityPeriodBefore._merger).to.eq(0)

      await acquisitionRoyale.connect(treasury).setImmunityPeriods(0, TEST_MERGER_IMMUNITY, 0)

      const immunityPeriodAfter = await acquisitionRoyale.getImmunityPeriods()
      expect(immunityPeriodAfter._merger).to.eq(TEST_MERGER_IMMUNITY)
    })

    it('should be able to set revival immunity period to a non-zero value', async () => {
      const immunityPeriodBefore = await acquisitionRoyale.getImmunityPeriods()
      expect(immunityPeriodBefore._revival).to.eq(0)

      await acquisitionRoyale.connect(treasury).setImmunityPeriods(0, 0, TEST_REVIVAL_IMMUNITY)

      const immunityPeriodAfter = await acquisitionRoyale.getImmunityPeriods()
      expect(immunityPeriodAfter._revival).to.eq(TEST_REVIVAL_IMMUNITY)
    })

    it('should be able to set all periods to non-zero values atomically', async () => {
      const immunityPeriodBefore = await acquisitionRoyale.getImmunityPeriods()
      expect(immunityPeriodBefore._acquisition).to.eq(0)
      expect(immunityPeriodBefore._merger).to.eq(0)
      expect(immunityPeriodBefore._revival).to.eq(0)

      await acquisitionRoyale
        .connect(treasury)
        .setImmunityPeriods(TEST_ACQUISITION_IMMUNITY, TEST_MERGER_IMMUNITY, TEST_REVIVAL_IMMUNITY)

      const immunityPeriodAfter = await acquisitionRoyale.getImmunityPeriods()
      expect(immunityPeriodAfter._acquisition).to.eq(TEST_ACQUISITION_IMMUNITY)
      expect(immunityPeriodAfter._merger).to.eq(TEST_MERGER_IMMUNITY)
      expect(immunityPeriodAfter._revival).to.eq(TEST_REVIVAL_IMMUNITY)
    })

    it('should correctly set the same values twice', async () => {
      const immunityPeriodBefore = await acquisitionRoyale.getImmunityPeriods()
      expect(immunityPeriodBefore._acquisition).to.eq(0)
      expect(immunityPeriodBefore._merger).to.eq(0)
      expect(immunityPeriodBefore._revival).to.eq(0)

      await acquisitionRoyale
        .connect(treasury)
        .setImmunityPeriods(TEST_ACQUISITION_IMMUNITY, TEST_MERGER_IMMUNITY, TEST_REVIVAL_IMMUNITY)

      const immunityPeriodAfterFirstSetting = await acquisitionRoyale.getImmunityPeriods()
      expect(immunityPeriodAfterFirstSetting._acquisition).to.eq(TEST_ACQUISITION_IMMUNITY)
      expect(immunityPeriodAfterFirstSetting._merger).to.eq(TEST_MERGER_IMMUNITY)
      expect(immunityPeriodAfterFirstSetting._revival).to.eq(TEST_REVIVAL_IMMUNITY)

      await acquisitionRoyale
        .connect(treasury)
        .setImmunityPeriods(TEST_ACQUISITION_IMMUNITY, TEST_MERGER_IMMUNITY, TEST_REVIVAL_IMMUNITY)

      const immunityPeriodAfterSecondSetting = await acquisitionRoyale.getImmunityPeriods()
      expect(immunityPeriodAfterSecondSetting._acquisition).to.eq(TEST_ACQUISITION_IMMUNITY)
      expect(immunityPeriodAfterSecondSetting._merger).to.eq(TEST_MERGER_IMMUNITY)
      expect(immunityPeriodAfterSecondSetting._revival).to.eq(TEST_REVIVAL_IMMUNITY)
    })

    it('should emit a ImmunityPeriodsChanged event', async () => {
      await acquisitionRoyale
        .connect(treasury)
        .setImmunityPeriods(TEST_ACQUISITION_IMMUNITY, TEST_MERGER_IMMUNITY, TEST_REVIVAL_IMMUNITY)

      const immunityPeriodChangedEvent = await getImmunityPeriodsChangedEvent(acquisitionRoyale)
      expect(immunityPeriodChangedEvent.acquisition).to.eq(TEST_ACQUISITION_IMMUNITY)
      expect(immunityPeriodChangedEvent.merger).to.eq(TEST_MERGER_IMMUNITY)
      expect(immunityPeriodChangedEvent.revival).to.eq(TEST_REVIVAL_IMMUNITY)
    })
  })

  describe('# setMergerBurnPercentage', () => {
    it('should only be usable by the owner', async () => {
      await expect(
        acquisitionRoyale.connect(user).setMergerBurnPercentage(TEST_MERGER_BURN)
      ).revertedWith('Ownable: caller is not the owner')
    })

    it('should be settable to the zero', async () => {
      await acquisitionRoyale.connect(treasury).setMergerBurnPercentage(0)

      expect(await acquisitionRoyale.getMergerBurnPercentage()).to.eq(0)
    })

    it('should be settable to a non-zero value', async () => {
      await acquisitionRoyale.connect(treasury).setMergerBurnPercentage(TEST_MERGER_BURN)

      expect(await acquisitionRoyale.getMergerBurnPercentage()).to.eq(TEST_MERGER_BURN)
    })

    it('should be settable to the same value twice', async () => {
      await acquisitionRoyale.connect(treasury).setMergerBurnPercentage(TEST_MERGER_BURN)

      expect(await acquisitionRoyale.getMergerBurnPercentage()).to.eq(TEST_MERGER_BURN)

      await acquisitionRoyale.connect(treasury).setMergerBurnPercentage(TEST_MERGER_BURN)

      expect(await acquisitionRoyale.getMergerBurnPercentage()).to.eq(TEST_MERGER_BURN)
    })

    it('should emit a MergerBurnPercentageChanged event', async () => {
      await acquisitionRoyale.connect(treasury).setMergerBurnPercentage(TEST_MERGER_BURN)

      const mergerBurnPercentageChangedEvent = await getMergerBurnPercentageChangedEvent(
        acquisitionRoyale
      )
      expect(mergerBurnPercentageChangedEvent.percentage).to.eq(TEST_MERGER_BURN)
    })
  })

  describe('# setWithdrawalBurnPercentage', () => {
    it('should only be usable by the owner', async () => {
      await expect(
        acquisitionRoyale.connect(user).setWithdrawalBurnPercentage(TEST_WITHDRAWAL_BURN)
      ).revertedWith('Ownable: caller is not the owner')
    })

    it('should be settable to the zero', async () => {
      await acquisitionRoyale.connect(treasury).setWithdrawalBurnPercentage(0)

      expect(await acquisitionRoyale.getWithdrawalBurnPercentage()).to.eq(0)
    })

    it('should be settable to a non-zero value', async () => {
      await acquisitionRoyale.connect(treasury).setWithdrawalBurnPercentage(TEST_WITHDRAWAL_BURN)

      expect(await acquisitionRoyale.getWithdrawalBurnPercentage()).to.eq(TEST_WITHDRAWAL_BURN)
    })

    it('should be settable to the same value twice', async () => {
      await acquisitionRoyale.connect(treasury).setWithdrawalBurnPercentage(TEST_WITHDRAWAL_BURN)

      expect(await acquisitionRoyale.getWithdrawalBurnPercentage()).to.eq(TEST_WITHDRAWAL_BURN)

      await acquisitionRoyale.connect(treasury).setWithdrawalBurnPercentage(TEST_WITHDRAWAL_BURN)

      expect(await acquisitionRoyale.getWithdrawalBurnPercentage()).to.eq(TEST_WITHDRAWAL_BURN)
    })

    it('should emit a WithdrawalBurnPercentageChanged event', async () => {
      await acquisitionRoyale.connect(treasury).setWithdrawalBurnPercentage(TEST_WITHDRAWAL_BURN)

      const withdrawalBurnPercentageChangedEvent = await getWithdrawalBurnPercentageChangedEvent(
        acquisitionRoyale
      )
      expect(withdrawalBurnPercentageChangedEvent.percentage).to.eq(TEST_WITHDRAWAL_BURN)
    })
  })

  describe('# setCompete', () => {
    it('should only be usable by the owner', async () => {
      await expect(acquisitionRoyale.connect(user).setCompete(mockCompete.address)).revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should not be settable to the zero address', async () => {
      await expect(acquisitionRoyale.connect(treasury).setCompete(AddressZero)).revertedWith(
        'zero address'
      )
    })

    it('should be settable to a non-zero address', async () => {
      await acquisitionRoyale.connect(treasury).setCompete(mockCompete.address)

      expect(await acquisitionRoyale.getCompete()).to.eq(mockCompete.address)
    })

    it('should be settable to the same value twice', async () => {
      await acquisitionRoyale.connect(treasury).setCompete(mockCompete.address)

      expect(await acquisitionRoyale.getCompete()).to.eq(mockCompete.address)

      await acquisitionRoyale.connect(treasury).setCompete(mockCompete.address)

      expect(await acquisitionRoyale.getCompete()).to.eq(mockCompete.address)
    })

    it('should emit a CompeteChanged event', async () => {
      await acquisitionRoyale.connect(treasury).setCompete(mockCompete.address)

      const competeChangedEvent = await getCompeteChangedEvent(acquisitionRoyale)
      expect(competeChangedEvent.compete).to.eq(mockCompete.address)
    })
  })

  describe('# setSupportForBranding', () => {
    it('should only be usable by the owner', async () => {
      await expect(
        acquisitionRoyale.connect(user).setSupportForBranding(mockBranding.address, true)
      ).revertedWith('Ownable: caller is not the owner')
    })

    it('should not accept the zero address for a brand', async () => {
      await expect(
        acquisitionRoyale.connect(treasury).setSupportForBranding(AddressZero, true)
      ).revertedWith('zero address')
    })

    it('should correctly set support for a brand to true', async () => {
      await acquisitionRoyale.connect(treasury).setSupportForBranding(mockBranding.address, true)

      expect(await acquisitionRoyale.isBrandingSupported(mockBranding.address)).to.eq(true)
    })

    it('should correctly set support for a brand to false', async () => {
      await acquisitionRoyale.connect(treasury).setSupportForBranding(mockBranding.address, false)

      expect(await acquisitionRoyale.isBrandingSupported(mockBranding.address)).to.eq(false)
    })

    it('should be settable to the same value twice', async () => {
      await acquisitionRoyale.connect(treasury).setSupportForBranding(mockBranding.address, true)

      expect(await acquisitionRoyale.isBrandingSupported(mockBranding.address)).to.eq(true)

      await acquisitionRoyale.connect(treasury).setSupportForBranding(mockBranding.address, true)

      expect(await acquisitionRoyale.isBrandingSupported(mockBranding.address)).to.eq(true)
    })

    it('should emit a SupportForBrandingChanged event', async () => {
      await acquisitionRoyale.connect(treasury).setSupportForBranding(mockBranding.address, true)

      const supportForBrandingChangedEvent = await getSupportForBrandingChangedEvent(
        acquisitionRoyale
      )
      expect(supportForBrandingChangedEvent.branding).to.eq(mockBranding.address)
      expect(supportForBrandingChangedEvent.supported).to.eq(true)
    })
  })

  describe('# setFallbackBranding', () => {
    it('should only be usable by the owner', async () => {
      await expect(
        acquisitionRoyale.connect(user).setFallbackBranding(mockBranding.address)
      ).revertedWith('Ownable: caller is not the owner')
    })

    it('should not be settable to the zero address', async () => {
      await expect(
        acquisitionRoyale.connect(treasury).setFallbackBranding(AddressZero)
      ).revertedWith('zero address')
    })

    it('should be settable to a non-zero address', async () => {
      await acquisitionRoyale.connect(treasury).setFallbackBranding(mockBranding.address)

      expect(await acquisitionRoyale.getFallbackBranding()).to.eq(mockBranding.address)
    })

    it('should be settable to the same value twice', async () => {
      await acquisitionRoyale.connect(treasury).setFallbackBranding(mockBranding.address)

      expect(await acquisitionRoyale.getFallbackBranding()).to.eq(mockBranding.address)

      await acquisitionRoyale.connect(treasury).setFallbackBranding(mockBranding.address)

      expect(await acquisitionRoyale.getFallbackBranding()).to.eq(mockBranding.address)
    })

    it('should emit a FallbackBrandingChanged event', async () => {
      await acquisitionRoyale.connect(treasury).setFallbackBranding(mockBranding.address)

      const fallbackBrandingChangedEvent = await getFallbackBrandingChangedEvent(acquisitionRoyale)
      expect(fallbackBrandingChangedEvent.branding).to.eq(mockBranding.address)
    })
  })

  describe('# setAdmin', () => {
    it('should only be usable by the owner', async () => {
      await expect(acquisitionRoyale.connect(user).setAdmin(user.address)).revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should be settable to an address', async () => {
      expect(await acquisitionRoyale.getAdmin()).to.eq(AddressZero)

      await acquisitionRoyale.connect(treasury).setAdmin(user.address)

      expect(await acquisitionRoyale.getAdmin()).to.eq(user.address)
    })

    it('should be settable to the same value twice', async () => {
      expect(await acquisitionRoyale.getAdmin()).to.eq(AddressZero)

      await acquisitionRoyale.connect(treasury).setAdmin(user.address)

      expect(await acquisitionRoyale.getAdmin()).to.eq(user.address)

      await acquisitionRoyale.connect(treasury).setAdmin(user.address)

      expect(await acquisitionRoyale.getAdmin()).to.eq(user.address)
    })
  })

  describe('# foundReserved', () => {
    it('should not be usable by caller who is not owner or admin', async () => {
      await expect(acquisitionRoyale.connect(user).foundReserved(user.address)).to.revertedWith(
        'caller is not owner or admin'
      )
    })

    it('should be usable by admin', async () => {
      await acquisitionRoyale.connect(treasury).setAdmin(user.address)
      expect(await acquisitionRoyale.getAdmin()).to.eq(user.address)
      expect(await acquisitionRoyale.ownerOf(RESERVED_STARTING_ID)).to.eq(AddressZero)

      await acquisitionRoyale.connect(user).foundReserved(user.address)

      expect(await acquisitionRoyale.ownerOf(RESERVED_STARTING_ID)).to.eq(user.address)
    })

    it('should mint to the recipient starting at correct index', async () => {
      expect(await acquisitionRoyale.ownerOf(RESERVED_STARTING_ID)).to.eq(AddressZero)

      await acquisitionRoyale.connect(treasury).foundReserved(user.address)

      expect(await acquisitionRoyale.ownerOf(RESERVED_STARTING_ID)).to.eq(user.address)
    })

    it('should mint the next index if called again', async () => {
      await acquisitionRoyale.connect(treasury).foundReserved(user.address)
      expect(await acquisitionRoyale.ownerOf(RESERVED_STARTING_ID)).to.eq(user.address)
      expect(await acquisitionRoyale.ownerOf(RESERVED_STARTING_ID + 1)).to.eq(AddressZero)

      await acquisitionRoyale.connect(treasury).foundReserved(user.address)

      expect(await acquisitionRoyale.ownerOf(RESERVED_STARTING_ID + 1)).to.eq(user.address)
    })

    it('should start with minting from freeCount', async () => {
      expect(await acquisitionRoyale.getFreeCount()).to.eq(0)

      await acquisitionRoyale.connect(treasury).foundReserved(user.address)

      expect(await acquisitionRoyale.getFreeCount()).to.eq(1)
    })

    it('should start minting with reservedCount after free supply is depleted', async () => {
      await acquisitionRoyale.connect(treasury).setFreeCount(5000)
      expect(await acquisitionRoyale.getReservedCount()).to.eq(0)

      await acquisitionRoyale.connect(treasury).foundReserved(user.address)

      expect(await acquisitionRoyale.getReservedCount()).to.eq(1)
    })

    it('should not allow minting after reserved supply depleted', async () => {
      await acquisitionRoyale.connect(treasury).setFreeCount(5000)
      await acquisitionRoyale.connect(treasury).setReservedCount(1000)

      await expect(acquisitionRoyale.connect(treasury).foundReserved(user.address)).revertedWith(
        'exceeds supply'
      )
    })

    it("should set the name to 'Enterprise #<ID>'", async () => {
      await acquisitionRoyale.connect(treasury).foundReserved(user.address)

      expect((await acquisitionRoyale.getEnterprise(RESERVED_STARTING_ID)).name).to.eq(
        `Enterprise #${RESERVED_STARTING_ID}`
      )
    })

    it('should set both immunity start times to the current time', async () => {
      expect(
        (await acquisitionRoyale.getEnterprise(RESERVED_STARTING_ID)).revivalImmunityStartTime
      ).to.eq(0)

      await acquisitionRoyale.connect(treasury).foundReserved(user.address)

      const foundingTime = await getLastTimestamp()
      expect(
        (await acquisitionRoyale.getEnterprise(RESERVED_STARTING_ID)).revivalImmunityStartTime
      ).to.eq(foundingTime)
    })
  })

  describe('# foundAuctioned', () => {
    it('should prevent minting if start parameters not set', async () => {
      const foundingParameters = await acquisitionRoyale.getFoundingPriceAndTime()
      expect(foundingParameters._startPrice).to.eq(0)
      expect(foundingParameters._endPrice).to.eq(0)
      expect(foundingParameters._startTime).to.eq(0)
      expect(foundingParameters._endTime).to.eq(0)

      await expect(acquisitionRoyale.connect(user).foundAuctioned(1)).revertedWith(
        'founding has not started'
      )
    })

    it('should prevent minting when founding has not started', async () => {
      await setFoundingPriceAndTime({
        ...defaultPriceAndTimeParams,
        startTime: testEndTime,
        endTime: testEndTime + 1,
      })

      await expect(acquisitionRoyale.connect(user).foundAuctioned(1)).revertedWith(
        'founding has not started'
      )
    })

    it('should prevent minting when founding has ended', async () => {
      await setFoundingPriceAndTime({
        ...defaultPriceAndTimeParams,
        startTime: testStartTime,
        endTime: testStartTime + TEST_TIME_DELAY,
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mineBlock(ethers.provider as any, testStartTime + TEST_TIME_DELAY + 1)

      await expect(acquisitionRoyale.connect(user).foundAuctioned(1)).revertedWith(
        'founding has ended'
      )
    })

    it('should not allow minting amount of zero', async () => {
      await setFoundingPriceAndTime(defaultPriceAndTimeParams)

      await expect(acquisitionRoyale.connect(user).foundAuctioned(0)).revertedWith(
        'amount cannot be zero'
      )
    })

    it('should not allow minting without sufficient native token', async () => {
      await setFoundingPriceAndTime(defaultPriceAndTimeParams)
      expect(await acquisitionRoyale.ownerOf(AUCTION_STARTING_ID)).to.eq(AddressZero)
      const expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
      const expectedAmount = await calculateAuctionPrice(expectedTime)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, expectedTime)

      await expect(
        acquisitionRoyale.connect(user).foundAuctioned(1, {
          value: expectedAmount.sub(1),
        })
      ).revertedWith('insufficient MATIC')
    })

    it('should mint starting at the correct index', async () => {
      await setFoundingPriceAndTime(defaultPriceAndTimeParams)
      expect(await acquisitionRoyale.ownerOf(AUCTION_STARTING_ID)).to.eq(AddressZero)
      const expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
      const expectedAmount = await calculateAuctionPrice(expectedTime)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, expectedTime)

      await acquisitionRoyale.connect(user).foundAuctioned(1, { value: expectedAmount })

      expect(await acquisitionRoyale.ownerOf(AUCTION_STARTING_ID)).to.eq(user.address)
    })

    it('should charge the correct auction price for a founding', async () => {
      await setFoundingPriceAndTime(defaultPriceAndTimeParams)
      const treasuryBalanceBefore = await treasury.getBalance()
      const userBalanceBefore = await user2.getBalance()
      expect(await ethers.provider.getBalance(acquisitionRoyale.address)).to.eq(0)
      const expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
      const expectedAmount = await calculateAuctionPrice(expectedTime)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, expectedTime)

      await acquisitionRoyale.connect(user2).foundAuctioned(1, { value: expectedAmount })

      expect(await treasury.getBalance()).to.eq(treasuryBalanceBefore.add(expectedAmount))
      expect(await user2.getBalance()).to.eq(userBalanceBefore.sub(expectedAmount))
      expect(await ethers.provider.getBalance(acquisitionRoyale.address)).to.eq(0)
    })

    it('should transfer any excess native token back to the user', async () => {
      await setFoundingPriceAndTime(defaultPriceAndTimeParams)
      const treasuryBalanceBefore = await treasury.getBalance()
      const userBalanceBefore = await user2.getBalance()
      expect(await ethers.provider.getBalance(acquisitionRoyale.address)).to.eq(0)
      const expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
      const expectedAmount = await calculateAuctionPrice(expectedTime)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, expectedTime)

      await acquisitionRoyale.connect(user2).foundAuctioned(1, {
        value: expectedAmount.add(1),
      })

      expect(await treasury.getBalance()).to.eq(treasuryBalanceBefore.add(expectedAmount))
      expect(await user2.getBalance()).to.eq(userBalanceBefore.sub(expectedAmount))
      expect(await ethers.provider.getBalance(acquisitionRoyale.address)).to.eq(0)
    })

    it('should transfer back any native token sent by the owner', async () => {
      await setFoundingPriceAndTime(defaultPriceAndTimeParams)
      const treasuryBalanceBefore = await treasury.getBalance()
      expect(await ethers.provider.getBalance(acquisitionRoyale.address)).to.eq(0)
      const expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
      const expectedAmount = await calculateAuctionPrice(expectedTime)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, expectedTime)

      await acquisitionRoyale.connect(treasury).foundAuctioned(1, {
        value: expectedAmount,
      })

      expect(await treasury.getBalance()).to.eq(treasuryBalanceBefore)
      expect(await ethers.provider.getBalance(acquisitionRoyale.address)).to.eq(0)
    })

    it('should correctly mint multiple indices when amount > 1', async () => {
      await setFoundingPriceAndTime(defaultPriceAndTimeParams)
      expect(await acquisitionRoyale.ownerOf(AUCTION_STARTING_ID)).to.eq(AddressZero)
      expect(await acquisitionRoyale.ownerOf(AUCTION_STARTING_ID + 1)).to.eq(AddressZero)
      const expectedAmount = (await calculateAuctionPrice(await getLastTimestamp())).mul(2)

      await acquisitionRoyale.connect(user).foundAuctioned(2, { value: expectedAmount })

      expect(await acquisitionRoyale.ownerOf(AUCTION_STARTING_ID)).to.eq(user.address)
      expect(await acquisitionRoyale.ownerOf(AUCTION_STARTING_ID + 1)).to.eq(user.address)
    })

    it('should increment auction count', async () => {
      await setFoundingPriceAndTime(defaultPriceAndTimeParams)
      const expectedAmount = await calculateAuctionPrice(await getLastTimestamp())
      expect(await acquisitionRoyale.getAuctionCount()).to.eq(0)

      await acquisitionRoyale.connect(user).foundAuctioned(1, { value: expectedAmount })

      expect(await acquisitionRoyale.getAuctionCount()).to.eq(1)
    })

    it('should not allow minting after auction supply depleted', async () => {
      await setFoundingPriceAndTime(defaultPriceAndTimeParams)
      const expectedAmount = await calculateAuctionPrice(await getLastTimestamp())
      await acquisitionRoyale
        .connect(treasury)
        .setAuctionCount(AUCTION_STARTING_ID + AUCTION_SUPPLY)

      await expect(
        acquisitionRoyale.connect(user).foundAuctioned(1, { value: expectedAmount })
      ).revertedWith('exceeds supply')
    })

    it('should allow treasury unrestricted minting after founding period is over', async () => {
      await setFoundingPriceAndTime({
        ...defaultPriceAndTimeParams,
        startTime: testStartTime,
        endTime: testStartTime + 1,
      })
      expect(await acquisitionRoyale.ownerOf(AUCTION_STARTING_ID)).to.eq(AddressZero)
      expect(await acquisitionRoyale.ownerOf(AUCTION_STARTING_ID + 1)).to.eq(AddressZero)

      // no need to pass in a new proof as treasury should have minting unrestricted except by supply constraints
      await acquisitionRoyale.connect(treasury).foundAuctioned(2)

      expect(await acquisitionRoyale.ownerOf(AUCTION_STARTING_ID)).to.eq(treasury.address)
      expect(await acquisitionRoyale.ownerOf(AUCTION_STARTING_ID + 1)).to.eq(treasury.address)
    })

    it("should set the name to 'Enterprise #<ID>'", async () => {
      await setFoundingPriceAndTime(defaultPriceAndTimeParams)
      const expectedAmount = await calculateAuctionPrice(await getLastTimestamp())

      await acquisitionRoyale.connect(user).foundAuctioned(1, { value: expectedAmount })

      expect((await acquisitionRoyale.getEnterprise(AUCTION_STARTING_ID)).name).to.eq(
        `Enterprise #${AUCTION_STARTING_ID}`
      )
    })

    it('should set both immunity start times to the current time', async () => {
      await setFoundingPriceAndTime(defaultPriceAndTimeParams)
      const expectedAmount = await calculateAuctionPrice(await getLastTimestamp())
      expect(
        (await acquisitionRoyale.getEnterprise(AUCTION_STARTING_ID)).revivalImmunityStartTime
      ).to.eq(0)

      await acquisitionRoyale.connect(user).foundAuctioned(1, { value: expectedAmount })

      const foundingTime = await getLastTimestamp()
      expect(
        (await acquisitionRoyale.getEnterprise(AUCTION_STARTING_ID)).revivalImmunityStartTime
      ).to.eq(foundingTime)
    })
  })

  describe('# getAuctionPrice', () => {
    it('should return the correct price after decay', async () => {
      const decayPerSecond = TEST_START_PRICE.sub(TEST_END_PRICE)
        .div(testEndTime - testStartTime)
        .add(1)
      await setFoundingPriceAndTime(defaultPriceAndTimeParams)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlock(ethers.provider as any, testStartTime + TEST_TIME_DELAY)

      expect(await acquisitionRoyale.getAuctionPrice()).to.eq(
        TEST_START_PRICE.sub(decayPerSecond.mul(TEST_TIME_DELAY))
      )
    })

    it('should return end price when price reduction exceeds starting price', async () => {
      const decayPerSecond = TEST_START_PRICE.sub(TEST_END_PRICE)
        .div(testEndTime - testStartTime)
        .add(1)
      const secondsToStartPrice = TEST_START_PRICE.div(decayPerSecond)
      await setFoundingPriceAndTime({
        ...defaultPriceAndTimeParams,
        startTime: 1,
        endTime: 1 + Number(secondsToStartPrice),
      })

      expect(await acquisitionRoyale.getAuctionPrice()).to.eq(TEST_END_PRICE)
    })

    it('should return end price when price falls below end price', async () => {
      await setFoundingPriceAndTime({
        ...defaultPriceAndTimeParams,
        endTime: testStartTime + TEST_TIME_DELAY,
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlock(ethers.provider as any, testStartTime + TEST_TIME_DELAY + 1)

      expect(await acquisitionRoyale.getAuctionPrice()).to.eq(TEST_END_PRICE)
    })
  })

  describe('# isEnterpriseImmune', () => {
    it('should return true if a enterprise has acquisition immunity', async () => {
      await acquisitionRoyale.connect(treasury).setImmunityPeriods(TEST_ACQUISITION_IMMUNITY, 0, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      const currentTime = await getLastTimestamp()
      await acquisitionRoyale.connect(treasury).setEnterpriseImmunityStartTime(0, currentTime, 0, 0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlocks(ethers.provider as any, 1)
      expect(
        (await acquisitionRoyale.getEnterprise(0)).acquisitionImmunityStartTime.add(
          TEST_ACQUISITION_IMMUNITY
        )
      ).to.be.gte(currentTime)

      expect(await acquisitionRoyale.isEnterpriseImmune(0)).to.eq(true)
    })

    it('should return true if a enterprise has merger immunity', async () => {
      await acquisitionRoyale.connect(treasury).setImmunityPeriods(0, TEST_MERGER_IMMUNITY, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      const currentTime = await getLastTimestamp()
      await acquisitionRoyale.connect(treasury).setEnterpriseImmunityStartTime(0, 0, currentTime, 0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlocks(ethers.provider as any, 1)
      expect(
        (await acquisitionRoyale.getEnterprise(0)).mergerImmunityStartTime.add(TEST_MERGER_IMMUNITY)
      ).to.be.gte(currentTime)

      expect(await acquisitionRoyale.isEnterpriseImmune(0)).to.eq(true)
    })

    it('should return true if a enterprise has revival immunity', async () => {
      await acquisitionRoyale.connect(treasury).setImmunityPeriods(0, 0, TEST_REVIVAL_IMMUNITY)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      const currentTime = await getLastTimestamp()
      await acquisitionRoyale.connect(treasury).setEnterpriseImmunityStartTime(0, 0, 0, currentTime)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlocks(ethers.provider as any, 1)
      expect(
        (await acquisitionRoyale.getEnterprise(0)).revivalImmunityStartTime.add(
          TEST_REVIVAL_IMMUNITY
        )
      ).to.be.gte(currentTime)

      expect(await acquisitionRoyale.isEnterpriseImmune(0)).to.eq(true)
    })

    it('should return false if a enterprise has no immunity', async () => {
      await acquisitionRoyale
        .connect(treasury)
        .setImmunityPeriods(TEST_ACQUISITION_IMMUNITY, TEST_MERGER_IMMUNITY, TEST_REVIVAL_IMMUNITY)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).setEnterpriseImmunityStartTime(0, 0, 0, 0)
      const currentTime = await getLastTimestamp()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlocks(ethers.provider as any, 1)
      expect(
        (
          await acquisitionRoyale.getEnterprise(RESERVED_STARTING_ID)
        ).acquisitionImmunityStartTime.add(TEST_ACQUISITION_IMMUNITY)
      ).to.be.lt(currentTime)
      expect(
        (await acquisitionRoyale.getEnterprise(RESERVED_STARTING_ID)).mergerImmunityStartTime.add(
          TEST_MERGER_IMMUNITY
        )
      ).to.be.lt(currentTime)
      expect(
        (await acquisitionRoyale.getEnterprise(RESERVED_STARTING_ID)).revivalImmunityStartTime.add(
          TEST_REVIVAL_IMMUNITY
        )
      ).to.be.lt(currentTime)

      expect(await acquisitionRoyale.isEnterpriseImmune(RESERVED_STARTING_ID)).to.eq(false)
    })
  })

  describe('# compete', () => {
    // use function() here to prevent inheriting of parent scope and allow access to mocha test name
    beforeEach(async function () {
      await acquisitionRoyale.connect(treasury).setCompete(mockCompete.address)
      if (this.currentTest?.title !== 'should not be callable before game start time') {
        await acquisitionRoyale.connect(treasury).setGameStartTime(await getLastTimestamp())
      }
    })

    it('should not be callable before game start time', async () => {
      const currentTime = await getLastTimestamp()
      await acquisitionRoyale.connect(treasury).setGameStartTime(currentTime + TEST_TIME_DELAY)

      await expect(acquisitionRoyale.connect(user).compete(1, 0, TEST_COMPETE_RP)).revertedWith(
        'game has not begun'
      )
    })

    it('should not allow caller and target id to be the same', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await fundEnterprise(user, 0, TEST_COMPETE_RP)

      await expect(acquisitionRoyale.connect(user).compete(0, 0, TEST_COMPETE_RP)).revertedWith(
        'enterprises are identical'
      )
    })

    it('should not allow caller to use a enterprise they do not own', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 1)
      expect(await acquisitionRoyale.ownerOf(0)).to.eq(user.address)
      expect(await acquisitionRoyale.ownerOf(1)).to.eq(user2.address)

      await expect(acquisitionRoyale.connect(user).compete(1, 0, TEST_COMPETE_RP)).revertedWith(
        'not enterprise owner'
      )
    })

    it("should not allow spending RP amount that exceeds calling enterprise's balance", async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 1)
      expect(await acquisitionRoyale.ownerOf(0)).to.eq(user.address)
      expect(await acquisitionRoyale.ownerOf(1)).to.eq(user2.address)
      expect((await acquisitionRoyale.getEnterprise(0)).rp).to.be.lt(TEST_COMPETE_RP)

      await expect(acquisitionRoyale.connect(user).compete(0, 1, TEST_COMPETE_RP)).revertedWith(
        'reverted with panic code 0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)'
      )
    })

    it('should not allow caller to use a non-existent enterprise', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      expect(await acquisitionRoyale.ownerOf(0)).to.eq(user.address)
      expect(await acquisitionRoyale.ownerOf(1)).to.eq(AddressZero)

      await expect(acquisitionRoyale.connect(user).compete(1, 0, TEST_COMPETE_RP)).revertedWith(
        'not enterprise owner'
      )
    })

    it('should not allow caller to target a non-existent enterprise', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      expect(await acquisitionRoyale.ownerOf(0)).to.eq(user.address)
      expect(await acquisitionRoyale.ownerOf(1)).to.eq(AddressZero)

      await expect(acquisitionRoyale.connect(user).compete(0, 1, TEST_COMPETE_RP)).revertedWith(
        "target enterprise doesn't exist"
      )
    })

    it('should not allow caller to target an immune enterprise', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 1)
      await acquisitionRoyale.connect(treasury).setImmunityPeriods(TEST_ACQUISITION_IMMUNITY, 0, 0)
      await fundEnterprise(user, 0, TEST_COMPETE_RP)
      const currentTime = await getLastTimestamp()
      await acquisitionRoyale.connect(treasury).setEnterpriseImmunityStartTime(1, currentTime, 0, 0)
      expect(await acquisitionRoyale.isEnterpriseImmune(1)).to.eq(true)

      await expect(acquisitionRoyale.connect(user).compete(0, 1, TEST_COMPETE_RP)).revertedWith(
        'target enterprise is immune'
      )
    })

    it('should calculate damage correctly based on target and RP provided', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 1)
      await fundEnterprise(user, 0, TEST_COMPETE_RP)
      await fundEnterprise(user2, 1, TEST_COMPETE_RP)
      const expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
      const expectedCallerBalance = await calculateVirtualBalance(0, expectedTime)
      const expectedTargetBalance = await calculateVirtualBalance(1, expectedTime)
      const expectedDamage = await mockCompete.getDamage(0, 1, TEST_COMPETE_RP)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, expectedTime)

      await acquisitionRoyale.connect(user).compete(0, 1, TEST_COMPETE_RP)

      expect((await acquisitionRoyale.getEnterprise(0)).rp).to.eq(
        expectedCallerBalance.sub(TEST_COMPETE_RP)
      )
      expect((await acquisitionRoyale.getEnterprise(0)).damageDealt).to.eq(expectedDamage)
      expect((await acquisitionRoyale.getEnterprise(1)).rp).to.eq(
        expectedTargetBalance.sub(expectedDamage)
      )
      expect((await acquisitionRoyale.getEnterprise(1)).damageTaken).to.eq(expectedDamage)
    })

    it('should not spend more than needed to bring target RP balance to zero', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 1)
      await fundEnterprise(user2, 1, TEST_COMPETE_RP)
      const expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
      const expectedTargetBalance = await calculateVirtualBalance(1, expectedTime)
      const amountToBankrupt = await mockCompete.getRpRequiredForDamage(0, 1, expectedTargetBalance)
      // fund caller enterprise with more than enough to kill target
      await fundEnterprise(user, 0, amountToBankrupt.mul(2))
      const expectedCallerBalance = await calculateVirtualBalance(0, expectedTime)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, expectedTime)

      await acquisitionRoyale.connect(user).compete(0, 1, amountToBankrupt.mul(2))

      /**
       * Take the previous balance (amountToBankrupt.mul(2)), subtract the amount spent during compete().
       * This needs to be calculated because if the amount spent exceeds target balance, it will only
       * charge a percentage of the RP provided. compete() adds 0.00000001% to prevent zero values
       * from being charged, which makes balances end up slightly less than expected.
       */
      expect((await acquisitionRoyale.getEnterprise(0)).rp).to.eq(
        expectedCallerBalance.sub(
          await calculateCompeteSpend(amountToBankrupt.mul(2), expectedTargetBalance)
        )
      )
      expect((await acquisitionRoyale.getEnterprise(1)).rp).to.eq(0)
    })

    it('should increment the compete amount by the RP spent', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 1)
      await fundEnterprise(user, 0, TEST_COMPETE_RP)
      expect((await acquisitionRoyale.getEnterprise(0)).competes).to.eq(0)
      await fundEnterprise(user2, 1, TEST_COMPETE_RP)
      expect((await acquisitionRoyale.getEnterprise(1)).competes).to.eq(0)

      await acquisitionRoyale.connect(user).compete(0, 1, TEST_COMPETE_RP)

      expect((await acquisitionRoyale.getEnterprise(0)).competes).to.eq(TEST_COMPETE_RP)
      expect((await acquisitionRoyale.getEnterprise(1)).competes).to.eq(0)
    })

    it('should reset the immunity start times of the calling enterprise', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 1)
      await acquisitionRoyale.connect(treasury).setEnterpriseImmunityStartTime(0, 1, 1, 1)
      expect((await acquisitionRoyale.getEnterprise(0)).acquisitionImmunityStartTime).to.be.eq(1)
      expect((await acquisitionRoyale.getEnterprise(0)).mergerImmunityStartTime).to.be.eq(1)
      expect((await acquisitionRoyale.getEnterprise(0)).revivalImmunityStartTime).to.be.eq(1)
      await fundEnterprise(user, 0, TEST_COMPETE_RP)
      await fundEnterprise(user2, 1, TEST_COMPETE_RP)

      await acquisitionRoyale.connect(user).compete(0, 1, TEST_COMPETE_RP)

      expect((await acquisitionRoyale.getEnterprise(0)).acquisitionImmunityStartTime).to.be.eq(0)
      expect((await acquisitionRoyale.getEnterprise(0)).mergerImmunityStartTime).to.be.eq(0)
      expect((await acquisitionRoyale.getEnterprise(0)).revivalImmunityStartTime).to.be.eq(0)
    })

    it('should emit an Compete Event indexed by callerId and targetId', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 1)
      await fundEnterprise(user, 0, TEST_COMPETE_RP)
      await fundEnterprise(user2, 1, TEST_COMPETE_RP)

      await acquisitionRoyale.connect(user).compete(0, 1, TEST_COMPETE_RP)

      const competeEvent = await getCompeteEvent(acquisitionRoyale, 0, 1)
      expect(competeEvent.callerId).to.eq(0)
      expect(competeEvent.targetId).to.eq(1)
      expect(competeEvent.rpSpent).to.eq(TEST_COMPETE_RP)
      expect(competeEvent.damage).to.eq(await mockCompete.getDamage(0, 1, TEST_COMPETE_RP))
    })

    describe('Moat testing', () => {
      let expectedTime: number
      let expectedCallerBalance: BigNumber
      let expectedTargetBalance: BigNumber
      let damageToDeal: BigNumber
      let rpToSpend: BigNumber
      const callerId = 0
      const targetId = 1
      beforeEach(async () => {
        await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, callerId)
        await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, targetId)
      })

      describe('when both enterprises earn enough RP passively to qualify for a moat', () => {
        beforeEach(async () => {
          await acquisitionRoyale.connect(treasury).setEnterpriseRp(callerId, testMoatThreshold)
          await acquisitionRoyale.connect(treasury).setEnterpriseRp(targetId, testMoatThreshold)
          expect(await moat.getLastHadMoat(callerId)).to.eq(false)
          expect(await moat.getLastHadMoat(targetId)).to.eq(false)
          expect(await moat.getMoatCountdown(callerId)).to.eq(0)
          expect(await moat.getMoatCountdown(targetId)).to.eq(0)
          expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
          // Verify that both balances will qualify for a moat when balances are updated
          expectedCallerBalance = await calculateVirtualBalance(callerId, expectedTime)
          expect(expectedCallerBalance).to.be.gte(testMoatThreshold)
          expectedTargetBalance = await calculateVirtualBalance(targetId, expectedTime)
          expect(expectedTargetBalance).to.be.gte(testMoatThreshold)
          // Spend enough RP to bring the caller and target's balance below the threshold
          damageToDeal = expectedCallerBalance.sub(testMoatThreshold).add(1)
          rpToSpend = await mockCompete.getRpRequiredForDamage(callerId, targetId, damageToDeal)
          // Directly set immunity start times for the calling enterprise to verify later that they are reset for competing.
          await acquisitionRoyale
            .connect(treasury)
            .setEnterpriseImmunityStartTime(callerId, 1, 1, 1)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await setNextTimestamp(ethers.provider as any, expectedTime)

          await acquisitionRoyale.connect(user).compete(callerId, targetId, rpToSpend)
        })

        it('should give both enterprises a moat prior to evaluating the compete action', async () => {
          /**
           * Since the post-compete balances would put both enterprise below the threshold,
           * if an enterprise's lastHadMoat is true, this means that it was recognized before
           * the results of the compete action.
           */
          expect(await moat.getLastHadMoat(callerId)).to.eq(true)
          expect(await moat.getLastHadMoat(targetId)).to.eq(true)
        })

        it('should begin the moat countdown for both when competing brings both balances < threshold', async () => {
          expect((await acquisitionRoyale.getEnterprise(callerId)).rp).to.be.lt(testMoatThreshold)
          expect((await acquisitionRoyale.getEnterprise(targetId)).rp).to.be.lt(testMoatThreshold)
          expect(await moat.getMoatCountdown(callerId)).to.eq(await getLastTimestamp())
          expect(await moat.getMoatCountdown(targetId)).to.eq(await getLastTimestamp())
        })

        it('should calculate damage correctly based on target and RP provided', async () => {
          expect((await acquisitionRoyale.getEnterprise(callerId)).rp).to.eq(
            expectedCallerBalance.sub(rpToSpend)
          )
          expect((await acquisitionRoyale.getEnterprise(callerId)).damageDealt).to.eq(damageToDeal)
          expect((await acquisitionRoyale.getEnterprise(targetId)).rp).to.eq(
            expectedTargetBalance.sub(damageToDeal)
          )
          expect((await acquisitionRoyale.getEnterprise(targetId)).damageTaken).to.eq(damageToDeal)
        })

        it('should increment the compete amount by the RP spent', async () => {
          expect((await acquisitionRoyale.getEnterprise(callerId)).competes).to.eq(rpToSpend)
          expect((await acquisitionRoyale.getEnterprise(targetId)).competes).to.eq(0)
        })

        it('should reset the immunity start times of the calling enterprise', async () => {
          expect(
            (await acquisitionRoyale.getEnterprise(callerId)).acquisitionImmunityStartTime
          ).to.be.eq(0)
          expect(
            (await acquisitionRoyale.getEnterprise(callerId)).mergerImmunityStartTime
          ).to.be.eq(0)
          expect(
            (await acquisitionRoyale.getEnterprise(callerId)).revivalImmunityStartTime
          ).to.be.eq(0)
        })
      })

      describe('when the target but not the caller earns enough RP passively for a moat', () => {
        beforeEach(async () => {
          await acquisitionRoyale
            .connect(treasury)
            .setEnterpriseRp(callerId, testMoatThreshold.div(2))
          await acquisitionRoyale.connect(treasury).setEnterpriseRp(targetId, testMoatThreshold)
          expect(await moat.getLastHadMoat(callerId)).to.eq(false)
          expect(await moat.getLastHadMoat(targetId)).to.eq(false)
          expect(await moat.getMoatCountdown(callerId)).to.eq(0)
          expect(await moat.getMoatCountdown(targetId)).to.eq(0)
          // Verify that the target's balance will qualify for a moat when balances are updated
          expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
          expectedCallerBalance = await calculateVirtualBalance(callerId, expectedTime)
          expect(expectedCallerBalance).to.be.lt(testMoatThreshold)
          expectedTargetBalance = await calculateVirtualBalance(targetId, expectedTime)
          expect(expectedTargetBalance).to.be.gte(testMoatThreshold)
          // Directly set immunity start times for the calling enterprise to verify later that they are reset for competing.
          await acquisitionRoyale
            .connect(treasury)
            .setEnterpriseImmunityStartTime(callerId, 1, 1, 1)
          // Spend enough RP to bring the target's balance below the threshold
          damageToDeal = expectedTargetBalance.sub(testMoatThreshold).add(1)
          rpToSpend = await mockCompete.getRpRequiredForDamage(callerId, targetId, damageToDeal)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await setNextTimestamp(ethers.provider as any, expectedTime)

          await acquisitionRoyale.connect(user).compete(callerId, targetId, rpToSpend)
        })

        it('should give the target a moat prior to evaluating the compete action', async () => {
          expect(await moat.getLastHadMoat(callerId)).to.eq(false)
          expect(await moat.getLastHadMoat(targetId)).to.eq(true)
        })

        it("should begin target's moat countdown when damage brings its balance < threshold", async () => {
          expect((await acquisitionRoyale.getEnterprise(callerId)).rp).to.be.lt(testMoatThreshold)
          expect((await acquisitionRoyale.getEnterprise(targetId)).rp).to.be.lt(testMoatThreshold)
          expect(await moat.getMoatCountdown(callerId)).to.eq(0)
          expect(await moat.getMoatCountdown(targetId)).to.eq(await getLastTimestamp())
        })

        it('should calculate damage correctly based on target and RP provided', async () => {
          expect((await acquisitionRoyale.getEnterprise(callerId)).rp).to.eq(
            expectedCallerBalance.sub(rpToSpend)
          )
          expect((await acquisitionRoyale.getEnterprise(callerId)).damageDealt).to.eq(damageToDeal)
          expect((await acquisitionRoyale.getEnterprise(targetId)).rp).to.eq(
            expectedTargetBalance.sub(damageToDeal)
          )
          expect((await acquisitionRoyale.getEnterprise(targetId)).damageTaken).to.eq(damageToDeal)
        })

        it('should increment the compete amount by the RP spent', async () => {
          expect((await acquisitionRoyale.getEnterprise(callerId)).competes).to.eq(rpToSpend)
          expect((await acquisitionRoyale.getEnterprise(targetId)).competes).to.eq(0)
        })

        it('should reset the immunity start times of the calling enterprise', async () => {
          expect(
            (await acquisitionRoyale.getEnterprise(callerId)).acquisitionImmunityStartTime
          ).to.be.eq(0)
          expect(
            (await acquisitionRoyale.getEnterprise(callerId)).mergerImmunityStartTime
          ).to.be.eq(0)
          expect(
            (await acquisitionRoyale.getEnterprise(callerId)).revivalImmunityStartTime
          ).to.be.eq(0)
        })
      })

      describe('when the caller but not the target earns enough RP passively for a moat', () => {
        beforeEach(async () => {
          await acquisitionRoyale.connect(treasury).setEnterpriseRp(callerId, testMoatThreshold)
          await acquisitionRoyale
            .connect(treasury)
            .setEnterpriseRp(targetId, testMoatThreshold.div(2))
          expect(await moat.getLastHadMoat(callerId)).to.eq(false)
          expect(await moat.getLastHadMoat(targetId)).to.eq(false)
          expect(await moat.getMoatCountdown(callerId)).to.eq(0)
          expect(await moat.getMoatCountdown(targetId)).to.eq(0)
          expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
          // Verify that the caller's balance will qualify for a moat when balances are updated
          expectedCallerBalance = await calculateVirtualBalance(callerId, expectedTime)
          expect(expectedCallerBalance).to.be.gte(testMoatThreshold)
          expectedTargetBalance = await calculateVirtualBalance(targetId, expectedTime)
          expect(expectedTargetBalance).to.be.lt(testMoatThreshold)
          // Spend enough RP to bring the caller's balance below the threshold
          damageToDeal = expectedCallerBalance.sub(testMoatThreshold).add(1)
          rpToSpend = await mockCompete.getRpRequiredForDamage(callerId, targetId, damageToDeal)
          // Directly set immunity start times for the calling enterprise to verify later that they are reset for competing.
          await acquisitionRoyale
            .connect(treasury)
            .setEnterpriseImmunityStartTime(callerId, 1, 1, 1)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await setNextTimestamp(ethers.provider as any, expectedTime)

          await acquisitionRoyale.connect(user).compete(callerId, targetId, rpToSpend)
        })

        it('should give the caller a moat prior to evaluating the compete action', async () => {
          expect(await moat.getLastHadMoat(callerId)).to.eq(true)
          expect(await moat.getLastHadMoat(targetId)).to.eq(false)
        })

        it("should begin caller's moat countdown when the RP spent brings its balance < threshold", async () => {
          expect((await acquisitionRoyale.getEnterprise(callerId)).rp).to.be.lt(testMoatThreshold)
          expect((await acquisitionRoyale.getEnterprise(targetId)).rp).to.be.lt(testMoatThreshold)
          expect(await moat.getMoatCountdown(callerId)).to.eq(await getLastTimestamp())
          expect(await moat.getMoatCountdown(targetId)).to.eq(0)
        })

        it('should calculate damage correctly based on target and RP provided', async () => {
          expect((await acquisitionRoyale.getEnterprise(callerId)).rp).to.eq(
            expectedCallerBalance.sub(rpToSpend)
          )
          expect((await acquisitionRoyale.getEnterprise(callerId)).damageDealt).to.eq(damageToDeal)
          expect((await acquisitionRoyale.getEnterprise(targetId)).rp).to.eq(
            expectedTargetBalance.sub(damageToDeal)
          )
          expect((await acquisitionRoyale.getEnterprise(targetId)).damageTaken).to.eq(damageToDeal)
        })

        it('should increment the compete amount by the RP spent', async () => {
          expect((await acquisitionRoyale.getEnterprise(callerId)).competes).to.eq(rpToSpend)
          expect((await acquisitionRoyale.getEnterprise(targetId)).competes).to.eq(0)
        })

        it('should reset the immunity start times of the calling enterprise', async () => {
          expect(
            (await acquisitionRoyale.getEnterprise(callerId)).acquisitionImmunityStartTime
          ).to.be.eq(0)
          expect(
            (await acquisitionRoyale.getEnterprise(callerId)).mergerImmunityStartTime
          ).to.be.eq(0)
          expect(
            (await acquisitionRoyale.getEnterprise(callerId)).revivalImmunityStartTime
          ).to.be.eq(0)
        })
      })

      describe('when neither enterprise has earned enough RP passively for a moat', () => {
        beforeEach(async () => {
          await acquisitionRoyale
            .connect(treasury)
            .setEnterpriseRp(callerId, testMoatThreshold.div(2))
          await acquisitionRoyale
            .connect(treasury)
            .setEnterpriseRp(targetId, testMoatThreshold.div(2))
          expect(await moat.getLastHadMoat(callerId)).to.eq(false)
          expect(await moat.getLastHadMoat(targetId)).to.eq(false)
          expect(await moat.getMoatCountdown(callerId)).to.eq(0)
          expect(await moat.getMoatCountdown(targetId)).to.eq(0)
          expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
          // Verify that neither balance will qualify for a moat when balances are updated
          expectedCallerBalance = await calculateVirtualBalance(callerId, expectedTime)
          expect(expectedCallerBalance).to.be.lt(testMoatThreshold)
          expectedTargetBalance = await calculateVirtualBalance(targetId, expectedTime)
          expect(expectedTargetBalance).to.be.lt(testMoatThreshold)
          // Deal 1 ether RP of damage for simplicity since neither enterprise will have a moat anyway.
          damageToDeal = parseEther('1')
          rpToSpend = await mockCompete.getRpRequiredForDamage(callerId, targetId, damageToDeal)
          // Directly set immunity start times for the calling enterprise to verify later that they are reset for competing.
          await acquisitionRoyale
            .connect(treasury)
            .setEnterpriseImmunityStartTime(callerId, 1, 1, 1)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await setNextTimestamp(ethers.provider as any, expectedTime)

          await acquisitionRoyale.connect(user).compete(callerId, targetId, rpToSpend)
        })

        it('should not give a moat to either enterprise', async () => {
          expect(await moat.getLastHadMoat(callerId)).to.eq(false)
          expect(await moat.getLastHadMoat(targetId)).to.eq(false)
        })

        it('should not begin moat countdown for either enterprise', async () => {
          expect((await acquisitionRoyale.getEnterprise(callerId)).rp).to.be.lt(testMoatThreshold)
          expect((await acquisitionRoyale.getEnterprise(targetId)).rp).to.be.lt(testMoatThreshold)
          expect(await moat.getMoatCountdown(callerId)).to.eq(0)
          expect(await moat.getMoatCountdown(targetId)).to.eq(0)
        })

        it('should calculate damage correctly based on target and RP provided', async () => {
          expect((await acquisitionRoyale.getEnterprise(callerId)).rp).to.eq(
            expectedCallerBalance.sub(rpToSpend)
          )
          expect((await acquisitionRoyale.getEnterprise(callerId)).damageDealt).to.eq(damageToDeal)
          expect((await acquisitionRoyale.getEnterprise(targetId)).rp).to.eq(
            expectedTargetBalance.sub(damageToDeal)
          )
          expect((await acquisitionRoyale.getEnterprise(targetId)).damageTaken).to.eq(damageToDeal)
        })

        it('should increment the compete amount by the RP spent', async () => {
          expect((await acquisitionRoyale.getEnterprise(callerId)).competes).to.eq(rpToSpend)
          expect((await acquisitionRoyale.getEnterprise(targetId)).competes).to.eq(0)
        })

        it('should reset the immunity start times of the calling enterprise', async () => {
          expect(
            (await acquisitionRoyale.getEnterprise(callerId)).acquisitionImmunityStartTime
          ).to.be.eq(0)
          expect(
            (await acquisitionRoyale.getEnterprise(callerId)).mergerImmunityStartTime
          ).to.be.eq(0)
          expect(
            (await acquisitionRoyale.getEnterprise(callerId)).revivalImmunityStartTime
          ).to.be.eq(0)
        })
      })
    })
  })

  describe('# isFundingNative', () => {
    const BOTH = 0
    const ONLY_RP = 1
    const ONLY_MATIC = 2
    it('Should return true if msg.value > 0, and both funding methods are allowed', async () => {
      await acquisitionRoyale.connect(treasury).setFundingMode(BOTH)
      expect(await acquisitionRoyale.isFundingNative(1)).to.eq(true)
    })

    it('Should return true if msg.value > 0, and only MATIC is allowed', async () => {
      await acquisitionRoyale.connect(treasury).setFundingMode(ONLY_MATIC)
      expect(await acquisitionRoyale.isFundingNative(1)).to.eq(true)
    })

    it('Should return false if msg.value = 0 and both funding methods are allowed', async () => {
      await acquisitionRoyale.connect(treasury).setFundingMode(BOTH)
      expect(await acquisitionRoyale.isFundingNative(0)).to.eq(false)
    })

    it('Should return false if msg.value = 0 and only RP is allowed', async () => {
      await acquisitionRoyale.connect(treasury).setFundingMode(ONLY_RP)
      expect(await acquisitionRoyale.isFundingNative(0)).to.eq(false)
    })

    it('Should revert if msg.value = 0 and only MATIC is allowed', async () => {
      await acquisitionRoyale.connect(treasury).setFundingMode(ONLY_MATIC)
      await expect(acquisitionRoyale.isFundingNative(0)).to.be.revertedWith(
        'Invalid funding method'
      )
    })

    it('Should revert if msg.value > 0 and only RP is allowed', async () => {
      await acquisitionRoyale.connect(treasury).setFundingMode(ONLY_RP)
      await expect(acquisitionRoyale.isFundingNative(1)).to.be.revertedWith(
        'Invalid funding method'
      )
    })
  })

  describe('# competeAndAcquire', () => {
    // use function() here to prevent inheriting of parent scope and allow access to mocha test name
    beforeEach(async function () {
      await acquisitionRoyale.connect(treasury).setCompete(mockCompete.address)
      if (this.currentTest?.title !== 'should not be callable before game start time') {
        await acquisitionRoyale.connect(treasury).setGameStartTime(await getLastTimestamp())
      }
    })

    it('should not be callable before game start time', async () => {
      const currentTime = await getLastTimestamp()
      await acquisitionRoyale.connect(treasury).setGameStartTime(currentTime + TEST_TIME_DELAY)

      await expect(acquisitionRoyale.connect(user).competeAndAcquire(1, 0, 0)).revertedWith(
        'game has not begun'
      )
    })

    it('should not allow caller and target id to be the same', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)

      await expect(acquisitionRoyale.connect(user).competeAndAcquire(0, 0, 0)).revertedWith(
        'enterprises are identical'
      )
    })

    it('should not allow caller to use a enterprise they do not own', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 1)
      expect(await acquisitionRoyale.ownerOf(0)).to.eq(user.address)
      expect(await acquisitionRoyale.ownerOf(1)).to.eq(user2.address)

      await expect(acquisitionRoyale.connect(user).competeAndAcquire(1, 0, 0)).revertedWith(
        'not enterprise owner'
      )
    })

    it('should not allow caller to target a non-existent enterprise', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      expect(await acquisitionRoyale.ownerOf(0)).to.eq(user.address)
      expect(await acquisitionRoyale.ownerOf(1)).to.eq(AddressZero)

      await expect(acquisitionRoyale.connect(user).competeAndAcquire(0, 1, 1)).revertedWith(
        "target enterprise doesn't exist"
      )
    })

    it('should not allow caller to target an immune enterprise', async () => {
      await acquisitionRoyale.connect(treasury).setImmunityPeriods(TEST_ACQUISITION_IMMUNITY, 0, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 1)
      const currentTime = await getLastTimestamp()
      await acquisitionRoyale.connect(treasury).setEnterpriseImmunityStartTime(1, currentTime, 0, 0)
      expect(await acquisitionRoyale.isEnterpriseImmune(1)).to.eq(true)

      await expect(acquisitionRoyale.connect(user).competeAndAcquire(0, 1, 1)).revertedWith(
        'target enterprise is immune'
      )
    })

    it('should enforce burn target to be the acquirer or the acquisition target', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 1)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 2)
      expect(await acquisitionRoyale.ownerOf(0)).to.eq(user.address)
      expect(await acquisitionRoyale.ownerOf(1)).to.eq(user2.address)
      expect(await acquisitionRoyale.ownerOf(2)).to.eq(user2.address)

      await expect(acquisitionRoyale.connect(user).competeAndAcquire(0, 1, 2)).revertedWith(
        'invalid burn target'
      )
    })

    it('should spend exact amount to bring target balance to zero and acquire the target', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 1)
      await fundEnterprise(user2, 1, TEST_COMPETE_RP)
      const expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
      const expectedTargetBalance = await calculateVirtualBalance(1, expectedTime)
      const amountToBankrupt = await mockCompete.getRpRequiredForDamage(0, 1, expectedTargetBalance)
      await fundEnterprise(user, 0, amountToBankrupt)
      expect((await acquisitionRoyale.getEnterprise(0)).acquisitions).to.eq(0)
      expect(await acquisitionRoyale.ownerOf(1)).to.eq(user2.address)
      const expectedCallerBalance = await calculateVirtualBalance(0, expectedTime)
      const costs = await acquireCost.getCost(0, 1)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, expectedTime)

      await acquisitionRoyale.connect(user).competeAndAcquire(0, 1, 1, {
        value: costs._amountToTreasury.add(costs._amountToRecipient),
      })

      expect((await acquisitionRoyale.getEnterprise(0)).rp).to.eq(
        expectedCallerBalance.sub(
          await calculateCompeteSpend(amountToBankrupt, expectedTargetBalance)
        )
      )
      expect((await acquisitionRoyale.getEnterprise(0)).acquisitions).to.eq(1)
      expect((await acquisitionRoyale.getEnterprise(0)).damageDealt).to.eq(expectedTargetBalance)
      expect((await acquisitionRoyale.getEnterprise(1)).rp).to.eq(0)
      expect((await acquisitionRoyale.getEnterprise(1)).damageTaken).to.eq(expectedTargetBalance)
      expect(await acquisitionRoyale.ownerOf(1)).to.eq(AddressZero)
    })

    it("should revert if calling enterprise's balance is insufficient", async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 1)
      await fundEnterprise(user2, 1, TEST_COMPETE_RP)
      const expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
      const amountToBankrupt = await rpToKillTarget(0, 1, expectedTime)
      expect((await acquisitionRoyale.getEnterprise(0)).rp).to.be.lt(amountToBankrupt)
      const costs = await acquireCost.getCost(0, 1)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, expectedTime)

      await expect(
        acquisitionRoyale.connect(user).competeAndAcquire(0, 1, 1, {
          value: costs._amountToTreasury.add(costs._amountToRecipient),
        })
      ).revertedWith(
        'reverted with panic code 0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)'
      )
    })

    it("should burn the target enterprise without clearing the target enterprise's attributes", async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 1)
      await acquisitionRoyale.connect(treasury).setEnterpriseImmunityStartTime(0, 1, 1, 1)
      const costs = await acquireCost.getCost(0, 1)
      await preventVirtualBalanceUpdate([1])
      const attributesBeforeBurn = await acquisitionRoyale.getEnterprise(1)

      await acquisitionRoyale.connect(user).competeAndAcquire(0, 1, 1, {
        value: costs._amountToTreasury.add(costs._amountToRecipient),
      })

      expect(await acquisitionRoyale.ownerOf(1)).to.eq(AddressZero)
      const attributesAfterBurn = await acquisitionRoyale.getEnterprise(1)
      attributesBeforeBurn.forEach(function (key) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(attributesBeforeBurn[key as any]).to.eq(attributesAfterBurn[key as any])
      })
    })

    it("should increment acquisition count by one for the enterprise that wasn't burnt", async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 1)
      expect((await acquisitionRoyale.getEnterprise(0)).acquisitions).to.eq(0)
      const costs = await acquireCost.getCost(0, 1)
      await preventVirtualBalanceUpdate([1])

      await acquisitionRoyale.connect(user).competeAndAcquire(0, 1, 1, {
        value: costs._amountToTreasury.add(costs._amountToRecipient),
      })

      expect((await acquisitionRoyale.getEnterprise(0)).acquisitions).to.eq(1)
    })

    it('should transfer over target enterprise to caller if acquiring enterprise is being burnt', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 1)
      expect(await acquisitionRoyale.ownerOf(0)).to.eq(user.address)
      expect(await acquisitionRoyale.ownerOf(1)).to.eq(user2.address)
      expect((await acquisitionRoyale.getEnterprise(0)).acquisitions).to.eq(0)
      expect((await acquisitionRoyale.getEnterprise(1)).acquisitions).to.eq(0)
      const costs = await acquireCost.getCost(0, 1)
      await preventVirtualBalanceUpdate([1])

      await acquisitionRoyale.connect(user).competeAndAcquire(0, 1, 0, {
        value: costs._amountToTreasury.add(costs._amountToRecipient),
      })

      expect(await acquisitionRoyale.ownerOf(0)).to.eq(AddressZero)
      expect(await acquisitionRoyale.ownerOf(1)).to.eq(user.address)
      expect((await acquisitionRoyale.getEnterprise(0)).acquisitions).to.eq(0)
      expect((await acquisitionRoyale.getEnterprise(1)).acquisitions).to.eq(1)
    })

    it("should transfer over acquirer's RP (minus a fee) to the target if the acquirer is being burnt", async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 1)
      await acquisitionRoyale.connect(treasury).setEnterpriseRp(0, TEST_DEPOSIT_RP)
      expect((await acquisitionRoyale.getEnterprise(0)).rp).to.eq(TEST_DEPOSIT_RP)
      expect((await acquisitionRoyale.getEnterprise(1)).rp).to.eq(0)
      const costs = await acquireCost.getCost(0, 1)
      const mergerBurn = await calculateMergerBurn(TEST_DEPOSIT_RP)
      await preventVirtualBalanceUpdate([0, 1])

      await acquisitionRoyale.connect(user).competeAndAcquire(0, 1, 0, {
        value: costs._amountToTreasury.add(costs._amountToRecipient),
      })

      expect(await acquisitionRoyale.ownerOf(0)).to.eq(AddressZero)
      expect(await acquisitionRoyale.ownerOf(1)).to.eq(user.address)
      expect((await acquisitionRoyale.getEnterprise(0)).rp).to.eq(0)
      expect((await acquisitionRoyale.getEnterprise(1)).rp).to.eq(TEST_DEPOSIT_RP.sub(mergerBurn))
    })

    it('should round up fee to 1 if RP balance is too small, before transferring', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 1)
      const amountTooSmall = 2
      await acquisitionRoyale.connect(treasury).setEnterpriseRp(0, amountTooSmall)
      expect((await acquisitionRoyale.getEnterprise(0)).rp).to.eq(2)
      expect((await acquisitionRoyale.getEnterprise(1)).rp).to.eq(0)
      const costs = await acquireCost.getCost(0, 1)
      await preventVirtualBalanceUpdate([0, 1])

      await acquisitionRoyale.connect(user).competeAndAcquire(0, 1, 0, {
        value: costs._amountToTreasury.add(costs._amountToRecipient),
      })

      expect(await acquisitionRoyale.ownerOf(0)).to.eq(AddressZero)
      expect(await acquisitionRoyale.ownerOf(1)).to.eq(user.address)
      expect((await acquisitionRoyale.getEnterprise(0)).rp).to.eq(0)
      expect((await acquisitionRoyale.getEnterprise(1)).rp).to.eq(amountTooSmall - 1)
    })

    it("should avoid underflow revert when acquirer's RP balance is zero", async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 1)
      expect((await acquisitionRoyale.getEnterprise(0)).rp).to.eq(0)
      expect((await acquisitionRoyale.getEnterprise(1)).rp).to.eq(0)
      const costs = await acquireCost.getCost(0, 1)
      await preventVirtualBalanceUpdate([0, 1])

      await acquisitionRoyale.connect(user).competeAndAcquire(0, 1, 0, {
        value: costs._amountToTreasury.add(costs._amountToRecipient),
      })

      expect(await acquisitionRoyale.ownerOf(0)).to.eq(AddressZero)
      expect(await acquisitionRoyale.ownerOf(1)).to.eq(user.address)
      expect((await acquisitionRoyale.getEnterprise(0)).rp).to.eq(0)
      expect((await acquisitionRoyale.getEnterprise(1)).rp).to.eq(0)
    })

    it('should set acquisition immunity start time to current time for the non-burnt enterprise', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 1)
      const costs = await acquireCost.getCost(0, 1)
      await preventVirtualBalanceUpdate([1])

      await acquisitionRoyale.connect(user).competeAndAcquire(0, 1, 1, {
        value: costs._amountToTreasury.add(costs._amountToRecipient),
      })

      expect((await acquisitionRoyale.getEnterprise(0)).acquisitionImmunityStartTime).to.eq(
        await getLastTimestamp()
      )
    })

    it('should emit an Acquisitioned Event indexed by callerId and targetId', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 1)
      const costs = await acquireCost.getCost(0, 1)
      await preventVirtualBalanceUpdate([1])

      await acquisitionRoyale.connect(user).competeAndAcquire(0, 1, 0, {
        value: costs._amountToTreasury.add(costs._amountToRecipient),
      })

      const acquisitionEvent = await getAcquisitionEvent(acquisitionRoyale, 0, 1)
      expect(acquisitionEvent.callerId).to.eq(0)
      expect(acquisitionEvent.targetId).to.eq(1)
      expect(acquisitionEvent.burnedId).to.eq(0)
    })

    describe('When an invalid funding method is used', () => {
      let expectedTime: number
      let amountToBankrupt: BigNumber
      beforeEach(async () => {
        await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
        await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 1)
        await fundEnterprise(user2, 1, TEST_COMPETE_RP)
        expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
        amountToBankrupt = await rpToKillTarget(0, 1, expectedTime)
        await fundEnterprise(user, 0, amountToBankrupt)
      })

      it("should revert when 'msg.value' = 0, but only MATIC is allowed", async () => {
        // Restrict funding mode to MATIC only.
        await acquisitionRoyale.connect(treasury).setFundingMode(2)
        // Attempt to pay for the acquisition in RP.
        const costs = await acquireRpCost.getCost(0, 1)
        const rpToAcquire = costs._amountToRecipient.add(costs._amountToBurn)
        await runwayPoints.connect(deployer).transfer(user.address, rpToAcquire)
        await runwayPoints.connect(user).approve(acquisitionRoyale.address, rpToAcquire)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await setNextTimestamp(ethers.provider as any, expectedTime)

        await expect(acquisitionRoyale.connect(user).competeAndAcquire(0, 1, 1)).revertedWith(
          'Invalid funding method'
        )
      })

      it("should revert when 'msg.value' > 0, but only RP is allowed", async () => {
        // Restrict funding mode to RP only.
        await acquisitionRoyale.connect(treasury).setFundingMode(1)
        // Attempt to pay for the acquisition in MATIC.
        const costs = await acquireCost.getCost(0, 1)
        const nativeToAcquire = costs._amountToTreasury.add(costs._amountToRecipient)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await setNextTimestamp(ethers.provider as any, expectedTime)

        await expect(
          acquisitionRoyale.connect(user).competeAndAcquire(0, 1, 1, {
            value: nativeToAcquire,
          })
        ).revertedWith('Invalid funding method')
      })
    })

    describe('When it is detected that the action will be paid for in native token', () => {
      let expectedTime: number
      let amountToBankrupt: BigNumber
      beforeEach(async () => {
        await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
        await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 1)
        await fundEnterprise(user2, 1, TEST_COMPETE_RP)
        expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
        amountToBankrupt = await rpToKillTarget(0, 1, expectedTime)
        await fundEnterprise(user, 0, amountToBankrupt)
      })

      it('should revert if sender has not provided sufficient native token amount', async () => {
        const costs = await acquireCost.getCost(0, 1)
        const nativeToAcquire = costs._amountToTreasury.add(costs._amountToRecipient)
        expect(await acquisitionRoyale.isFundingNative(nativeToAcquire.sub(1))).to.eq(true)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await setNextTimestamp(ethers.provider as any, expectedTime)

        await expect(
          acquisitionRoyale.connect(user).competeAndAcquire(0, 1, 1, {
            value: nativeToAcquire.sub(1),
          })
        ).revertedWith('insufficient MATIC')
      })

      it('should transfer the correct native token amounts to the target owner and treasury if the cost contract specifies amounts for both', async () => {
        const userBalanceBefore = await user.getBalance()
        const user2BalanceBefore = await user2.getBalance()
        const treasuryBalanceBefore = await treasury.getBalance()
        const user2RpBalanceBefore = await runwayPoints.balanceOf(user2.address)
        expect(await ethers.provider.getBalance(acquisitionRoyale.address)).to.eq(0)
        const costs = await acquireCost.getCost(0, 1)
        const reward = await acquireRpRewardCost.getCost(0, 1)
        const nativeToAcquire = costs._amountToTreasury.add(costs._amountToRecipient)
        expect(await acquisitionRoyale.isFundingNative(nativeToAcquire)).to.eq(true)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await setNextTimestamp(ethers.provider as any, expectedTime)

        await acquisitionRoyale.connect(user).competeAndAcquire(0, 1, 1, {
          value: nativeToAcquire,
        })

        expect(await user.getBalance()).to.eq(userBalanceBefore.sub(nativeToAcquire))
        expect(await user2.getBalance()).to.eq(user2BalanceBefore.add(costs._amountToRecipient))
        expect(await treasury.getBalance()).to.eq(
          treasuryBalanceBefore.add(costs._amountToTreasury)
        )
        expect(await runwayPoints.balanceOf(user2.address)).to.eq(
          user2RpBalanceBefore.add(reward._amountToRecipient)
        )
        expect(await ethers.provider.getBalance(acquisitionRoyale.address)).to.eq(0)
      })

      it('should not transfer any native token to the treasury if the cost contract specifies none to be sent', async () => {
        const userBalanceBefore = await user.getBalance()
        const user2BalanceBefore = await user2.getBalance()
        const treasuryBalanceBefore = await treasury.getBalance()
        const user2RpBalanceBefore = await runwayPoints.balanceOf(user2.address)
        expect(await ethers.provider.getBalance(acquisitionRoyale.address)).to.eq(0)
        // Assign a new AcquireCost contract that specifies nothing be sent to the treasury.
        const acquireCostNoTreasury = await fixedCostFixture({
          ...acquireNativeDefaultParams,
          amountToTreasury: ethers.constants.Zero,
        })
        await acquisitionRoyale
          .connect(treasury)
          .setCostContracts(
            acquireCostNoTreasury.address,
            mergeCost.address,
            acquireRpCost.address,
            mergeRpCost.address,
            acquireRpRewardCost.address
          )
        const costs = await acquireCostNoTreasury.getCost(0, 1)
        const reward = await acquireRpRewardCost.getCost(0, 1)
        const nativeToAcquire = costs._amountToRecipient
        expect(await acquisitionRoyale.isFundingNative(nativeToAcquire)).to.eq(true)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await setNextTimestamp(ethers.provider as any, expectedTime)

        await acquisitionRoyale.connect(user).competeAndAcquire(0, 1, 1, {
          value: nativeToAcquire,
        })

        expect(await user.getBalance()).to.eq(userBalanceBefore.sub(nativeToAcquire))
        expect(await user2.getBalance()).to.eq(user2BalanceBefore.add(costs._amountToRecipient))
        expect(await treasury.getBalance()).to.eq(treasuryBalanceBefore)
        expect(await runwayPoints.balanceOf(user2.address)).to.eq(
          user2RpBalanceBefore.add(reward._amountToRecipient)
        )
        expect(await ethers.provider.getBalance(acquisitionRoyale.address)).to.eq(0)
      })

      it('should not transfer any native token to the target owner if the cost contract specifies none to be sent', async () => {
        const userBalanceBefore = await user.getBalance()
        const user2BalanceBefore = await user2.getBalance()
        const treasuryBalanceBefore = await treasury.getBalance()
        const user2RpBalanceBefore = await runwayPoints.balanceOf(user2.address)
        expect(await ethers.provider.getBalance(acquisitionRoyale.address)).to.eq(0)
        // Assign a new AcquireCost contract that specifies nothing be sent to the target owner.
        const acquireCostNoRecipient = await fixedCostFixture({
          ...acquireNativeDefaultParams,
          amountToRecipient: ethers.constants.Zero,
        })
        await acquisitionRoyale
          .connect(treasury)
          .setCostContracts(
            acquireCostNoRecipient.address,
            mergeCost.address,
            acquireRpCost.address,
            mergeRpCost.address,
            acquireRpRewardCost.address
          )
        const costs = await acquireCostNoRecipient.getCost(0, 1)
        const reward = await acquireRpRewardCost.getCost(0, 1)
        const nativeToAcquire = costs._amountToTreasury
        expect(await acquisitionRoyale.isFundingNative(nativeToAcquire)).to.eq(true)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await setNextTimestamp(ethers.provider as any, expectedTime)

        await acquisitionRoyale.connect(user).competeAndAcquire(0, 1, 1, {
          value: nativeToAcquire,
        })

        expect(await user.getBalance()).to.eq(userBalanceBefore.sub(nativeToAcquire))
        expect(await user2.getBalance()).to.eq(user2BalanceBefore)
        expect(await treasury.getBalance()).to.eq(
          treasuryBalanceBefore.add(costs._amountToTreasury)
        )
        expect(await runwayPoints.balanceOf(user2.address)).to.eq(
          user2RpBalanceBefore.add(reward._amountToRecipient)
        )
        expect(await ethers.provider.getBalance(acquisitionRoyale.address)).to.eq(0)
      })

      it('should transfer any excess native token back to the user', async () => {
        const userBalanceBefore = await user.getBalance()
        const user2BalanceBefore = await user2.getBalance()
        const treasuryBalanceBefore = await treasury.getBalance()
        const user2RpBalanceBefore = await runwayPoints.balanceOf(user2.address)
        expect(await ethers.provider.getBalance(acquisitionRoyale.address)).to.eq(0)
        const costs = await acquireCost.getCost(0, 1)
        const reward = await acquireRpRewardCost.getCost(0, 1)
        const nativeToAcquire = costs._amountToTreasury.add(costs._amountToRecipient)
        expect(await acquisitionRoyale.isFundingNative(nativeToAcquire)).to.eq(true)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await setNextTimestamp(ethers.provider as any, expectedTime)

        await acquisitionRoyale.connect(user).competeAndAcquire(0, 1, 1, {
          value: nativeToAcquire.add(1),
        })

        expect(await user.getBalance()).to.eq(userBalanceBefore.sub(nativeToAcquire))
        expect(await user2.getBalance()).to.eq(user2BalanceBefore.add(costs._amountToRecipient))
        expect(await treasury.getBalance()).to.eq(
          treasuryBalanceBefore.add(costs._amountToTreasury)
        )
        expect(await runwayPoints.balanceOf(user2.address)).to.eq(
          user2RpBalanceBefore.add(reward._amountToRecipient)
        )
        expect(await ethers.provider.getBalance(acquisitionRoyale.address)).to.eq(0)
      })
    })

    describe('When it is detected that the action will be paid for in RP', () => {
      let expectedTime: number
      let amountToBankrupt: BigNumber
      // No native assets will be spent for these test cases.
      const nativeToSpend = 0
      beforeEach(async () => {
        await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
        await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 1)
        await fundEnterprise(user2, 1, TEST_COMPETE_RP)
        expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
        amountToBankrupt = await rpToKillTarget(0, 1, expectedTime)
        await fundEnterprise(user, 0, amountToBankrupt)
      })

      it('should transfer to the target owner and burn the correct amount of RP if the cost contract specifies amounts for both', async () => {
        expect(await acquisitionRoyale.isFundingNative(nativeToSpend)).to.eq(false)
        const costs = await acquireRpCost.getCost(0, 1)
        const reward = await acquireRpRewardCost.getCost(0, 1)
        const rpToAcquire = costs._amountToRecipient.add(costs._amountToBurn)
        await runwayPoints.connect(deployer).transfer(user.address, rpToAcquire)
        const userRpBalanceBefore = await runwayPoints.balanceOf(user.address)
        const user2RpBalanceBefore = await runwayPoints.balanceOf(user2.address)
        await runwayPoints.connect(user).approve(acquisitionRoyale.address, rpToAcquire)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await setNextTimestamp(ethers.provider as any, expectedTime)

        await acquisitionRoyale.connect(user).competeAndAcquire(0, 1, 1)

        expect(await runwayPoints.balanceOf(user.address)).to.eq(
          userRpBalanceBefore.sub(rpToAcquire)
        )
        expect(await runwayPoints.balanceOf(user2.address)).to.eq(
          user2RpBalanceBefore.add(costs._amountToRecipient).add(reward._amountToRecipient)
        )
        const burnEvent = await getERC20TransferEvent(runwayPoints, user.address, AddressZero)
        expect(burnEvent.args.value).to.eq(costs._amountToBurn)
      })

      it('should not transfer any RP to the target owner if the cost contract specifies none to be sent', async () => {
        expect(await acquisitionRoyale.isFundingNative(nativeToSpend)).to.eq(false)
        // Assign a new AcquireCost contract that specifies nothing be sent to the target owner.
        const acquireRpCostNoRecipient = await fixedCostFixture({
          ...acquireRpDefaultParams,
          amountToRecipient: ethers.constants.Zero,
        })
        await acquisitionRoyale
          .connect(treasury)
          .setCostContracts(
            acquireCost.address,
            mergeCost.address,
            acquireRpCostNoRecipient.address,
            mergeRpCost.address,
            acquireRpRewardCost.address
          )
        const costs = await acquireRpCostNoRecipient.getCost(0, 1)
        const reward = await acquireRpRewardCost.getCost(0, 1)
        const rpToAcquire = costs._amountToBurn
        await runwayPoints.connect(deployer).transfer(user.address, rpToAcquire)
        const userRpBalanceBefore = await runwayPoints.balanceOf(user.address)
        const user2RpBalanceBefore = await runwayPoints.balanceOf(user2.address)
        await runwayPoints.connect(user).approve(acquisitionRoyale.address, rpToAcquire)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await setNextTimestamp(ethers.provider as any, expectedTime)

        await acquisitionRoyale.connect(user).competeAndAcquire(0, 1, 1)

        expect(await runwayPoints.balanceOf(user.address)).to.eq(
          userRpBalanceBefore.sub(rpToAcquire)
        )
        expect(await runwayPoints.balanceOf(user2.address)).to.eq(
          user2RpBalanceBefore.add(reward._amountToRecipient)
        )
        const burnEvent = await getERC20TransferEvent(runwayPoints, user.address, AddressZero)
        expect(burnEvent.args.value).to.eq(costs._amountToBurn)
      })

      it('should not burn any RP if the cost contract specifies none to be burnt', async () => {
        expect(await acquisitionRoyale.isFundingNative(nativeToSpend)).to.eq(false)
        // Assign a new AcquireCost contract that specifies nothing be sent to the target owner.
        const acquireRpCostNoBurn = await fixedCostFixture({
          ...acquireRpDefaultParams,
          amountToBurn: ethers.constants.Zero,
        })
        await acquisitionRoyale
          .connect(treasury)
          .setCostContracts(
            acquireCost.address,
            mergeCost.address,
            acquireRpCostNoBurn.address,
            mergeRpCost.address,
            acquireRpRewardCost.address
          )
        const costs = await acquireRpCostNoBurn.getCost(0, 1)
        const reward = await acquireRpRewardCost.getCost(0, 1)
        const rpToAcquire = costs._amountToRecipient
        await runwayPoints.connect(deployer).transfer(user.address, rpToAcquire)
        const userRpBalanceBefore = await runwayPoints.balanceOf(user.address)
        const user2RpBalanceBefore = await runwayPoints.balanceOf(user2.address)
        await runwayPoints.connect(user).approve(acquisitionRoyale.address, rpToAcquire)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await setNextTimestamp(ethers.provider as any, expectedTime)

        await acquisitionRoyale.connect(user).competeAndAcquire(0, 1, 1)

        expect(await runwayPoints.balanceOf(user.address)).to.eq(
          userRpBalanceBefore.sub(rpToAcquire)
        )
        expect(await runwayPoints.balanceOf(user2.address)).to.eq(
          user2RpBalanceBefore.add(costs._amountToRecipient).add(reward._amountToRecipient)
        )
        const burnEvent = await getERC20TransferEvent(runwayPoints, user.address, AddressZero)
        expect(burnEvent).to.eq(undefined)
      })
    })

    describe('Moat testing', () => {
      let mockAR: MockContract<Contract>
      let mockRP: MockContract<Contract>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let fakeAcqrHook: any
      let deployerSigner: providers.JsonRpcSigner
      let treasurySigner: providers.JsonRpcSigner
      let userSigner: providers.JsonRpcSigner
      let user2Signer: providers.JsonRpcSigner
      beforeEach(async () => {
        const mockRunwayPointsFactory = await smock.mock('RunwayPoints')
        const mockAcquisitionRoyaleFactory = await smock.mock('MockAcquisitionRoyale')
        mockAR = await mockAcquisitionRoyaleFactory.deploy()
        mockRP = await mockRunwayPointsFactory.deploy(mockAR.address)
        fakeAcqrHook = await smock.fake('AcqrHookV1')
        await moat.connect(deployer).setAcqrHook(fakeAcqrHook.address)
        // Set the owner of the RP contract directly using Smock
        await mockRP.setVariable('_owner', mockAR.address)
        await mockAR.initialize(
          'Acquisition Royale',
          'AQR',
          merkleProofVerifier.address,
          mockWeth.address,
          mockRP.address,
          royaleConsumables.address
        )
        await mockAR.transferOwnership(treasury.address)
        /**
         * Need to extract a JsonRpcSigner since Smock library only accepts JsonRpcSigner
         * and not the SignerWithAddress that ethers getSigners() returns.
         */
        deployerSigner = ethers.provider.getSigner(deployer.address)
        treasurySigner = ethers.provider.getSigner(treasury.address)
        userSigner = ethers.provider.getSigner(user.address)
        user2Signer = ethers.provider.getSigner(user2.address)
        await mockAR
          .connect(treasurySigner)
          .setCostContracts(
            acquireCost.address,
            mergeCost.address,
            acquireRpCost.address,
            mergeRpCost.address,
            acquireRpRewardCost.address
          )
        await mockAR.connect(treasurySigner).setCompete(mockCompete.address)
        await mockAR.connect(treasurySigner).setHook(fakeAcqrHook.address)
        await mockAR.connect(treasurySigner).setGameStartTime(await getLastTimestamp())
        await mockAR.connect(treasurySigner).mintEnterprise(user.address, 1)
        await mockAR.connect(treasurySigner).mintEnterprise(user2.address, 2)
      })

      it('should call acquireHook with the correct parameters', async () => {
        const costs = await acquireCost.getCost(1, 2)
        await mockRP.connect(deployerSigner).transfer(user2.address, TEST_COMPETE_RP)
        await mockAR.connect(user2Signer).deposit(2, TEST_COMPETE_RP)
        await mockRP.connect(deployerSigner).transfer(user.address, TEST_COMPETE_RP.mul(2))
        await mockAR.connect(userSigner).deposit(1, TEST_COMPETE_RP.mul(2))

        await mockAR.connect(userSigner).competeAndAcquire(1, 2, 1, {
          value: costs._amountToTreasury.add(costs._amountToRecipient),
        })

        expect(fakeAcqrHook.acquireHook).to.be.calledWith(
          1,
          2,
          1,
          costs._amountToTreasury.add(costs._amountToRecipient)
        )
      })

      it('should set the caller and rp balances to whatever is returned by acquireHook', async () => {
        const costs = await acquireCost.getCost(1, 2)
        await mockRP.connect(deployerSigner).transfer(user2.address, TEST_COMPETE_RP)
        await mockAR.connect(user2Signer).deposit(2, TEST_COMPETE_RP)
        await mockRP.connect(deployerSigner).transfer(user.address, TEST_COMPETE_RP.mul(2))
        await mockAR.connect(userSigner).deposit(1, TEST_COMPETE_RP.mul(2))
        fakeAcqrHook.acquireHook
          .whenCalledWith(1, 2, 1, costs._amountToTreasury.add(costs._amountToRecipient))
          .returns([parseEther('1234'), parseEther('5678')])

        await mockAR.connect(userSigner).competeAndAcquire(1, 2, 1, {
          value: costs._amountToTreasury.add(costs._amountToRecipient),
        })

        expect((await mockAR.getEnterprise(1)).rp).to.eq(parseEther('1234'))
        expect((await mockAR.getEnterprise(2)).rp).to.eq(parseEther('5678'))
      })

      it('should revert if acquireHook reverts', async () => {
        await moat.connect(deployer).setAcqrHook(acqrHook.address)
        await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 1)
        await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 2)
        const costs = await acquireCost.getCost(1, 2)
        await runwayPoints.connect(deployer).transfer(user2.address, testMoatThreshold)
        await acquisitionRoyale.connect(user2).deposit(2, testMoatThreshold)
        await runwayPoints.connect(deployer).transfer(user.address, testMoatThreshold.mul(2))
        await acquisitionRoyale.connect(user).deposit(1, testMoatThreshold.mul(2))

        await expect(
          acquisitionRoyale.connect(user).competeAndAcquire(1, 2, 1, {
            value: costs._amountToTreasury.add(costs._amountToRecipient),
          })
        ).revertedWith('Target has moat immunity')
      })
    })
  })

  describe('# merge', () => {
    const TEST_DEPOSIT = ethers.utils.parseEther('1')
    // use function() here to prevent inheriting of parent scope and allow access to mocha test name
    beforeEach(async function () {
      if (this.currentTest?.title !== 'should not be callable before game start time') {
        await acquisitionRoyale.connect(treasury).setGameStartTime(await getLastTimestamp())
      }
      await acquisitionRoyale.connect(treasury).setMergerBurnPercentage(TEST_MERGER_BURN)
    })

    it('should not be callable before game start time', async () => {
      const currentTime = await getLastTimestamp()
      await acquisitionRoyale.connect(treasury).setGameStartTime(currentTime + TEST_TIME_DELAY)

      await expect(acquisitionRoyale.connect(user).merge(1, 0, 0)).revertedWith(
        'game has not begun'
      )
    })

    it('should not allow caller and target id to be the same', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)

      await expect(acquisitionRoyale.connect(user).merge(0, 0, 0)).revertedWith(
        'enterprises are identical'
      )
    })

    it('should not allow caller to use a enterprise they do not own', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 1)
      expect(await acquisitionRoyale.ownerOf(0)).to.eq(user.address)
      expect(await acquisitionRoyale.ownerOf(1)).to.eq(user2.address)

      await expect(acquisitionRoyale.connect(user).merge(1, 0, 0)).revertedWith(
        'not enterprise owner'
      )
    })

    it('should not allow caller to target a enterprise they do not own', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 1)
      expect(await acquisitionRoyale.ownerOf(0)).to.eq(user.address)
      expect(await acquisitionRoyale.ownerOf(1)).to.eq(user2.address)

      await expect(acquisitionRoyale.connect(user).merge(0, 1, 1)).revertedWith(
        'not owner of target enterprise'
      )
    })

    it('should enforce burn target to be the acquirer or the acquisition target', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 1)
      expect(await acquisitionRoyale.ownerOf(0)).to.eq(user.address)
      expect(await acquisitionRoyale.ownerOf(1)).to.eq(user.address)

      await expect(acquisitionRoyale.connect(user).merge(0, 1, 2)).revertedWith(
        'invalid burn target'
      )
    })

    it("should burn the target enterprise without clearing the target enterprise's attributes", async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 1)
      await acquisitionRoyale.connect(treasury).setEnterpriseImmunityStartTime(1, 1, 1, 1)
      const attributesBeforeBurn = await acquisitionRoyale.getEnterprise(1)
      const costs = await mergeCost.getCost(0, 1)

      await acquisitionRoyale.connect(user).merge(0, 1, 1, { value: costs._amountToTreasury })

      expect(await acquisitionRoyale.ownerOf(1)).to.eq(AddressZero)
      const attributesAfterBurn = await acquisitionRoyale.getEnterprise(1)
      attributesBeforeBurn.forEach(function (key) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(attributesBeforeBurn[key as any]).to.eq(attributesAfterBurn[key as any])
      })
    })

    it("should increment merge count by one for the enterprise that wasn't burnt", async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 1)
      const costs = await mergeCost.getCost(0, 1)
      expect((await acquisitionRoyale.getEnterprise(0)).mergers).to.eq(0)

      await acquisitionRoyale.connect(user).merge(0, 1, 1, { value: costs._amountToTreasury })

      expect((await acquisitionRoyale.getEnterprise(0)).mergers).to.eq(1)
    })

    it("should transfer burnt enterprise's RP over to the non-burnt enterprise, minus a fee", async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 1)
      const costs = await mergeCost.getCost(0, 1)
      const testDeposit = ethers.utils.parseEther('1')
      await fundEnterprise(user, 0, testDeposit)
      await fundEnterprise(user, 1, testDeposit)
      const expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
      const expectedCallerBalance = await calculateVirtualBalance(0, expectedTime)
      const expectedTargetBalance = await calculateVirtualBalance(1, expectedTime)
      const mergerBurn = await calculateMergerBurn(expectedTargetBalance)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, expectedTime)

      await acquisitionRoyale.connect(user).merge(0, 1, 1, { value: costs._amountToTreasury })

      expect((await acquisitionRoyale.getEnterprise(0)).rp).to.eq(
        expectedCallerBalance.add(expectedTargetBalance.sub(mergerBurn))
      )
      expect((await acquisitionRoyale.getEnterprise(1)).rp).to.eq(0)
    })

    it('should avoid underflow revert when target RP balance is zero', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 1)
      const costs = await mergeCost.getCost(0, 1)
      expect((await acquisitionRoyale.getEnterprise(0)).rp).to.eq(0)
      expect((await acquisitionRoyale.getEnterprise(1)).rp).to.eq(0)
      await preventVirtualBalanceUpdate([0, 1])

      await acquisitionRoyale.connect(user).merge(0, 1, 1, { value: costs._amountToTreasury })

      expect((await acquisitionRoyale.getEnterprise(0)).rp).to.eq(0)
      expect((await acquisitionRoyale.getEnterprise(1)).rp).to.eq(0)
    })

    it('should set merge immunity start time to current time for the non-burnt enterprise', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 1)
      const costs = await mergeCost.getCost(0, 1)

      await acquisitionRoyale.connect(user).merge(0, 1, 1, { value: costs._amountToTreasury })

      expect((await acquisitionRoyale.getEnterprise(0)).mergerImmunityStartTime).to.eq(
        await getLastTimestamp()
      )
    })

    it('should emit an Merger Event indexed by callerId and targetId', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 1)
      const costs = await mergeCost.getCost(0, 1)

      await acquisitionRoyale.connect(user).merge(0, 1, 1, { value: costs._amountToTreasury })

      const mergerEvent = await getMergerEvent(acquisitionRoyale, 0, 1)
      expect(mergerEvent.callerId).to.eq(0)
      expect(mergerEvent.targetId).to.eq(1)
      expect(mergerEvent.burnedId).to.eq(1)
    })

    describe('When an invalid funding method is used', () => {
      beforeEach(async () => {
        await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
        await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 1)
        await fundEnterprise(user, 0, TEST_DEPOSIT)
        await fundEnterprise(user, 1, TEST_DEPOSIT)
      })

      it("should revert when 'msg.value' = 0, but only MATIC is allowed", async () => {
        // Restrict funding mode to MATIC only.
        await acquisitionRoyale.connect(treasury).setFundingMode(2)
        // Attempt to pay for the acquisition in RP.
        const costs = await mergeRpCost.getCost(0, 1)
        const rpToMerge = costs._amountToBurn
        await runwayPoints.connect(deployer).transfer(user.address, rpToMerge)
        await runwayPoints.connect(user).approve(acquisitionRoyale.address, rpToMerge)

        await expect(acquisitionRoyale.connect(user).merge(0, 1, 1)).revertedWith(
          'Invalid funding method'
        )
      })

      it("should revert when 'msg.value' > 0, but only RP is allowed", async () => {
        // Restrict funding mode to RP only.
        await acquisitionRoyale.connect(treasury).setFundingMode(1)
        // Attempt to pay for the acquisition in MATIC.
        const costs = await mergeCost.getCost(0, 1)
        const nativeToMerge = costs._amountToTreasury

        await expect(
          acquisitionRoyale.connect(user).merge(0, 1, 1, { value: nativeToMerge })
        ).revertedWith('Invalid funding method')
      })
    })

    describe('When it is detected that the action will be paid for in native token', () => {
      beforeEach(async () => {
        await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
        await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 1)
        await fundEnterprise(user, 0, TEST_DEPOSIT)
        await fundEnterprise(user, 1, TEST_DEPOSIT)
      })

      it('should revert if sender has not provided sufficient native token amount', async () => {
        const costs = await mergeCost.getCost(0, 1)
        const nativeToMerge = costs._amountToTreasury
        expect(await acquisitionRoyale.isFundingNative(nativeToMerge.sub(1))).to.eq(true)

        await expect(
          acquisitionRoyale.connect(user).merge(0, 1, 1, { value: nativeToMerge.sub(1) })
        ).revertedWith('insufficient MATIC')
      })

      it('should transfer the native token amount specified by the cost contract to the treasury', async () => {
        const userBalanceBefore = await user.getBalance()
        const treasuryBalanceBefore = await treasury.getBalance()
        const costs = await mergeCost.getCost(0, 1)
        const nativeToMerge = costs._amountToTreasury
        expect(await acquisitionRoyale.isFundingNative(nativeToMerge)).to.eq(true)

        await acquisitionRoyale.connect(user).merge(0, 1, 1, { value: nativeToMerge })

        expect(await user.getBalance()).to.eq(userBalanceBefore.sub(costs._amountToTreasury))
        expect(await treasury.getBalance()).to.eq(
          treasuryBalanceBefore.add(costs._amountToTreasury)
        )
      })

      it('should transfer any excess native token back to the user', async () => {
        const userBalanceBefore = await user.getBalance()
        const treasuryBalanceBefore = await treasury.getBalance()
        const costs = await mergeCost.getCost(0, 1)
        const nativeToMerge = costs._amountToTreasury
        expect(await acquisitionRoyale.isFundingNative(nativeToMerge.add(1))).to.eq(true)

        await acquisitionRoyale.connect(user).merge(0, 1, 1, { value: nativeToMerge.add(1) })

        expect(await user.getBalance()).to.eq(userBalanceBefore.sub(costs._amountToTreasury))
        expect(await treasury.getBalance()).to.eq(
          treasuryBalanceBefore.add(costs._amountToTreasury)
        )
      })
    })

    describe('When it is detected that the action will be paid for in RP', () => {
      // No native assets will be spent for these test cases.
      const nativeToSpend = 0
      beforeEach(async () => {
        await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
        await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 1)
        await fundEnterprise(user, 0, TEST_DEPOSIT)
        await fundEnterprise(user, 1, TEST_DEPOSIT)
      })

      it('should burn the amount of RP specified by the cost contract', async () => {
        expect(await acquisitionRoyale.isFundingNative(nativeToSpend)).to.eq(false)
        const costs = await mergeRpCost.getCost(0, 1)
        const rpToMerge = costs._amountToBurn
        await runwayPoints.connect(deployer).transfer(user.address, rpToMerge)
        const userRpBalanceBefore = await runwayPoints.balanceOf(user.address)
        await runwayPoints.connect(user).approve(acquisitionRoyale.address, rpToMerge)

        await acquisitionRoyale.connect(user).merge(0, 1, 1)

        expect(await runwayPoints.balanceOf(user.address)).to.eq(
          userRpBalanceBefore.sub(costs._amountToBurn)
        )
        const burnEvent = await getERC20TransferEvent(runwayPoints, user.address, AddressZero)
        expect(burnEvent.args.value).to.eq(costs._amountToBurn)
      })
    })

    describe('Moat testing', () => {
      const callerId = 0
      const targetId = 1
      const casesForWhatToKeep = [
        {
          it: 'when calling enterprise is kept',
          keptId: callerId,
          burntId: targetId,
        },
        {
          it: 'when target enterprise is kept',
          keptId: targetId,
          burntId: callerId,
        },
      ]
      beforeEach(async () => {
        await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, callerId)
        await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, targetId)
      })

      casesForWhatToKeep.forEach((whatToKeep) => {
        describe(whatToKeep.it, () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let attributesBeforeBurn: any
          let keptEnterpriseMergersBefore: BigNumber
          let expectedTime: number
          let expectedKeptBalance: BigNumber
          let expectedBurntBalance: BigNumber
          let expectedRpToBurn: BigNumber
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let costs: any
          describe('when both enterprises have earned enough RP passively to get a moat', () => {
            beforeEach(async () => {
              await acquisitionRoyale
                .connect(treasury)
                .setEnterpriseRp(whatToKeep.keptId, testMoatThreshold)
              await acquisitionRoyale
                .connect(treasury)
                .setEnterpriseRp(whatToKeep.burntId, testMoatThreshold)
              // Verify starting state for the Moat contract
              expect(await moat.getLastHadMoat(whatToKeep.keptId)).to.eq(false)
              expect(await moat.getLastHadMoat(whatToKeep.burntId)).to.eq(false)
              expect(await moat.getMoatCountdown(whatToKeep.keptId)).to.eq(0)
              expect(await moat.getMoatCountdown(whatToKeep.burntId)).to.eq(0)
              // Grab enterprise attributes to verify against
              attributesBeforeBurn = await acquisitionRoyale.getEnterprise(whatToKeep.burntId)
              keptEnterpriseMergersBefore = (
                await acquisitionRoyale.getEnterprise(whatToKeep.keptId)
              ).mergers
              expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
              expectedKeptBalance = await calculateVirtualBalance(whatToKeep.keptId, expectedTime)
              expect(expectedKeptBalance).to.be.gte(testMoatThreshold)
              expectedBurntBalance = await calculateVirtualBalance(whatToKeep.burntId, expectedTime)
              expect(expectedBurntBalance).to.be.gte(testMoatThreshold)
              expectedRpToBurn = await calculateMergerBurn(expectedBurntBalance)
              costs = await mergeCost.getCost(whatToKeep.keptId, whatToKeep.burntId)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await setNextTimestamp(ethers.provider as any, expectedTime)

              await acquisitionRoyale
                .connect(user)
                .merge(whatToKeep.keptId, whatToKeep.burntId, whatToKeep.burntId, {
                  value: costs._amountToTreasury,
                })
            })

            it("should not affect kept enterprise's moat", async () => {
              expect(await moat.getLastHadMoat(whatToKeep.keptId)).to.eq(true)
              expect(await moat.getLastHadMoat(whatToKeep.burntId)).to.eq(true)
            })

            it("should begin burnt enterprise's moat countdown", async () => {
              expect(await moat.getMoatCountdown(whatToKeep.keptId)).to.eq(0)
              expect(await moat.getMoatCountdown(whatToKeep.burntId)).to.eq(
                await getLastTimestamp()
              )
            })

            it("should transfer burnt enterprise's RP over to the kept enterprise, minus a fee", async () => {
              expect((await acquisitionRoyale.getEnterprise(whatToKeep.keptId)).rp).to.eq(
                expectedKeptBalance.add(expectedBurntBalance.sub(expectedRpToBurn))
              )
              expect((await acquisitionRoyale.getEnterprise(whatToKeep.burntId)).rp).to.eq(0)
            })

            it("should increment merge count by one for the enterprise that wasn't burnt", async () => {
              expect((await acquisitionRoyale.getEnterprise(whatToKeep.keptId)).mergers).to.eq(
                keptEnterpriseMergersBefore.add(1)
              )
            })

            it('should set merge immunity start time to current time for the non-burnt enterprise', async () => {
              expect(
                (await acquisitionRoyale.getEnterprise(whatToKeep.keptId)).mergerImmunityStartTime
              ).to.eq(await getLastTimestamp())
            })

            it("should burn the target enterprise without clearing the target enterprise's attributes", async () => {
              expect(await acquisitionRoyale.ownerOf(whatToKeep.burntId)).to.eq(AddressZero)
              const attributesAfterBurn = await acquisitionRoyale.getEnterprise(whatToKeep.burntId)
              attributesBeforeBurn.forEach(function (key: string) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                expect(attributesBeforeBurn[key as any]).to.eq(attributesAfterBurn[key as any])
              })
            })
          })

          describe('when only the burnt enterprise earns enough RP passively for a moat and the post-merger balance is sufficient for a moat', () => {
            beforeEach(async () => {
              await acquisitionRoyale
                .connect(treasury)
                .setEnterpriseRp(whatToKeep.keptId, testMoatThreshold.div(2))
              await acquisitionRoyale
                .connect(treasury)
                .setEnterpriseRp(whatToKeep.burntId, testMoatThreshold)
              expect(await moat.getLastHadMoat(whatToKeep.keptId)).to.eq(false)
              expect(await moat.getLastHadMoat(whatToKeep.burntId)).to.eq(false)
              expect(await moat.getMoatCountdown(whatToKeep.keptId)).to.eq(0)
              expect(await moat.getMoatCountdown(whatToKeep.burntId)).to.eq(0)
              attributesBeforeBurn = await acquisitionRoyale.getEnterprise(whatToKeep.burntId)
              keptEnterpriseMergersBefore = (
                await acquisitionRoyale.getEnterprise(whatToKeep.keptId)
              ).mergers
              expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
              expectedKeptBalance = await calculateVirtualBalance(whatToKeep.keptId, expectedTime)
              expect(expectedKeptBalance).to.be.lt(testMoatThreshold)
              expectedBurntBalance = await calculateVirtualBalance(whatToKeep.burntId, expectedTime)
              expect(expectedBurntBalance).to.be.gte(testMoatThreshold)
              expectedRpToBurn = await calculateMergerBurn(expectedBurntBalance)
              costs = await mergeCost.getCost(whatToKeep.keptId, whatToKeep.burntId)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await setNextTimestamp(ethers.provider as any, expectedTime)

              await acquisitionRoyale
                .connect(user)
                .merge(whatToKeep.keptId, whatToKeep.burntId, whatToKeep.burntId, {
                  value: costs._amountToTreasury,
                })
            })

            it('should give kept enterprise a moat', async () => {
              expect(await moat.getLastHadMoat(whatToKeep.keptId)).to.eq(true)
              expect(await moat.getLastHadMoat(whatToKeep.burntId)).to.eq(true)
            })

            it("should begin burnt enterprise's moat countdown", async () => {
              expect(await moat.getMoatCountdown(whatToKeep.keptId)).to.eq(0)
              expect(await moat.getMoatCountdown(whatToKeep.burntId)).to.eq(
                await getLastTimestamp()
              )
            })

            it("should transfer burnt enterprise's RP over to the kept enterprise, minus a fee", async () => {
              expect((await acquisitionRoyale.getEnterprise(whatToKeep.keptId)).rp).to.eq(
                expectedKeptBalance.add(expectedBurntBalance.sub(expectedRpToBurn))
              )
              expect((await acquisitionRoyale.getEnterprise(whatToKeep.burntId)).rp).to.eq(0)
            })

            it("should increment merge count by one for the enterprise that wasn't burnt", async () => {
              expect((await acquisitionRoyale.getEnterprise(whatToKeep.keptId)).mergers).to.eq(
                keptEnterpriseMergersBefore.add(1)
              )
            })

            it('should set merge immunity start time to current time for the non-burnt enterprise', async () => {
              expect(
                (await acquisitionRoyale.getEnterprise(whatToKeep.keptId)).mergerImmunityStartTime
              ).to.eq(await getLastTimestamp())
            })

            it("should burn the target enterprise without clearing the target enterprise's attributes", async () => {
              expect(await acquisitionRoyale.ownerOf(whatToKeep.burntId)).to.eq(AddressZero)
              const attributesAfterBurn = await acquisitionRoyale.getEnterprise(whatToKeep.burntId)
              attributesBeforeBurn.forEach(function (key: string) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                expect(attributesBeforeBurn[key as any]).to.eq(attributesAfterBurn[key as any])
              })
            })
          })

          describe('when only the kept enterprise earns enough RP passively for a moat and the post-merger balance is sufficient for a moat', () => {
            beforeEach(async () => {
              await acquisitionRoyale
                .connect(treasury)
                .setEnterpriseRp(whatToKeep.keptId, testMoatThreshold)
              await acquisitionRoyale
                .connect(treasury)
                .setEnterpriseRp(whatToKeep.burntId, testMoatThreshold.div(2))
              expect(await moat.getLastHadMoat(whatToKeep.keptId)).to.eq(false)
              expect(await moat.getLastHadMoat(whatToKeep.burntId)).to.eq(false)
              expect(await moat.getMoatCountdown(whatToKeep.keptId)).to.eq(0)
              expect(await moat.getMoatCountdown(whatToKeep.burntId)).to.eq(0)
              attributesBeforeBurn = await acquisitionRoyale.getEnterprise(whatToKeep.burntId)
              keptEnterpriseMergersBefore = (
                await acquisitionRoyale.getEnterprise(whatToKeep.keptId)
              ).mergers
              expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
              expectedKeptBalance = await calculateVirtualBalance(whatToKeep.keptId, expectedTime)
              expect(expectedKeptBalance).to.be.gte(testMoatThreshold)
              expectedBurntBalance = await calculateVirtualBalance(whatToKeep.burntId, expectedTime)
              expect(expectedBurntBalance).to.be.lt(testMoatThreshold)
              expectedRpToBurn = await calculateMergerBurn(expectedBurntBalance)
              costs = await mergeCost.getCost(whatToKeep.keptId, whatToKeep.burntId)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await setNextTimestamp(ethers.provider as any, expectedTime)

              await acquisitionRoyale
                .connect(user)
                .merge(whatToKeep.keptId, whatToKeep.burntId, whatToKeep.burntId, {
                  value: costs._amountToTreasury,
                })
            })

            it('should give kept enterprise a moat', async () => {
              expect(await moat.getLastHadMoat(whatToKeep.keptId)).to.eq(true)
              expect(await moat.getLastHadMoat(whatToKeep.burntId)).to.eq(false)
            })

            it('should not begin the moat countdown for either enterprise', async () => {
              expect(await moat.getMoatCountdown(whatToKeep.keptId)).to.eq(0)
              expect(await moat.getMoatCountdown(whatToKeep.burntId)).to.eq(0)
            })

            it("should transfer burnt enterprise's RP over to the kept enterprise, minus a fee", async () => {
              expect((await acquisitionRoyale.getEnterprise(whatToKeep.keptId)).rp).to.eq(
                expectedKeptBalance.add(expectedBurntBalance.sub(expectedRpToBurn))
              )
              expect((await acquisitionRoyale.getEnterprise(whatToKeep.burntId)).rp).to.eq(0)
            })

            it("should increment merge count by one for the enterprise that wasn't burnt", async () => {
              expect((await acquisitionRoyale.getEnterprise(whatToKeep.keptId)).mergers).to.eq(
                keptEnterpriseMergersBefore.add(1)
              )
            })

            it('should set merge immunity start time to current time for the non-burnt enterprise', async () => {
              expect(
                (await acquisitionRoyale.getEnterprise(whatToKeep.keptId)).mergerImmunityStartTime
              ).to.eq(await getLastTimestamp())
            })

            it("should burn the target enterprise without clearing the target enterprise's attributes", async () => {
              expect(await acquisitionRoyale.ownerOf(whatToKeep.burntId)).to.eq(AddressZero)
              const attributesAfterBurn = await acquisitionRoyale.getEnterprise(whatToKeep.burntId)
              attributesBeforeBurn.forEach(function (key: string) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                expect(attributesBeforeBurn[key as any]).to.eq(attributesAfterBurn[key as any])
              })
            })
          })

          describe('when neither enterprise has earned enough RP passively for a moat and the post-merger balance is insufficient for a moat', () => {
            beforeEach(async () => {
              await acquisitionRoyale
                .connect(treasury)
                .setEnterpriseRp(whatToKeep.keptId, testMoatThreshold.div(2))
              await acquisitionRoyale
                .connect(treasury)
                .setEnterpriseRp(whatToKeep.burntId, testMoatThreshold.div(2))
              expect(await moat.getLastHadMoat(whatToKeep.keptId)).to.eq(false)
              expect(await moat.getLastHadMoat(whatToKeep.burntId)).to.eq(false)
              expect(await moat.getMoatCountdown(whatToKeep.keptId)).to.eq(0)
              expect(await moat.getMoatCountdown(whatToKeep.burntId)).to.eq(0)
              attributesBeforeBurn = await acquisitionRoyale.getEnterprise(whatToKeep.burntId)
              keptEnterpriseMergersBefore = (
                await acquisitionRoyale.getEnterprise(whatToKeep.keptId)
              ).mergers
              expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
              expectedKeptBalance = await calculateVirtualBalance(whatToKeep.keptId, expectedTime)
              expect(expectedKeptBalance).to.be.lt(testMoatThreshold)
              expectedBurntBalance = await calculateVirtualBalance(whatToKeep.burntId, expectedTime)
              expect(expectedBurntBalance).to.be.lt(testMoatThreshold)
              expectedRpToBurn = await calculateMergerBurn(expectedBurntBalance)
              costs = await mergeCost.getCost(whatToKeep.keptId, whatToKeep.burntId)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await setNextTimestamp(ethers.provider as any, expectedTime)

              await acquisitionRoyale
                .connect(user)
                .merge(whatToKeep.keptId, whatToKeep.burntId, whatToKeep.burntId, {
                  value: costs._amountToTreasury,
                })
            })

            it('should not give either enterprise a moat', async () => {
              expect(await moat.getLastHadMoat(whatToKeep.keptId)).to.eq(false)
              expect(await moat.getLastHadMoat(whatToKeep.burntId)).to.eq(false)
            })

            it('should not begin the moat countdown for either enterprise', async () => {
              expect(await moat.getMoatCountdown(whatToKeep.keptId)).to.eq(0)
              expect(await moat.getMoatCountdown(whatToKeep.burntId)).to.eq(0)
            })

            it("should transfer burnt enterprise's RP over to the kept enterprise, minus a fee", async () => {
              expect((await acquisitionRoyale.getEnterprise(whatToKeep.keptId)).rp).to.eq(
                expectedKeptBalance.add(expectedBurntBalance.sub(expectedRpToBurn))
              )
              expect((await acquisitionRoyale.getEnterprise(whatToKeep.burntId)).rp).to.eq(0)
            })

            it("should increment merge count by one for the enterprise that wasn't burnt", async () => {
              expect((await acquisitionRoyale.getEnterprise(whatToKeep.keptId)).mergers).to.eq(
                keptEnterpriseMergersBefore.add(1)
              )
            })

            it('should set merge immunity start time to current time for the non-burnt enterprise', async () => {
              expect(
                (await acquisitionRoyale.getEnterprise(whatToKeep.keptId)).mergerImmunityStartTime
              ).to.eq(await getLastTimestamp())
            })

            it("should burn the target enterprise without clearing the target enterprise's attributes", async () => {
              expect(await acquisitionRoyale.ownerOf(whatToKeep.burntId)).to.eq(AddressZero)
              const attributesAfterBurn = await acquisitionRoyale.getEnterprise(whatToKeep.burntId)
              attributesBeforeBurn.forEach(function (key: string) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                expect(attributesBeforeBurn[key as any]).to.eq(attributesAfterBurn[key as any])
              })
            })
          })
        })
      })
    })
  })

  describe('# deposit', () => {
    const testEnterpriseId = 0
    // use function() here to prevent inheriting of parent scope and allow access to mocha test name
    beforeEach(async function () {
      if (this.currentTest?.title !== 'should not be callable before game start time') {
        await acquisitionRoyale.connect(treasury).setGameStartTime(await getLastTimestamp())
      }
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, testEnterpriseId)
    })

    it('should not be callable before game start time', async () => {
      const currentTime = await getLastTimestamp()
      await acquisitionRoyale.connect(treasury).setGameStartTime(currentTime + TEST_TIME_DELAY)

      await expect(
        acquisitionRoyale.connect(user).deposit(testEnterpriseId, TEST_DEPOSIT_RP)
      ).revertedWith('game has not begun')
    })

    it('should not allow caller to use a enterprise they do not own', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 1)
      expect(await acquisitionRoyale.ownerOf(testEnterpriseId)).to.eq(user.address)
      expect(await acquisitionRoyale.ownerOf(1)).to.eq(user2.address)

      await expect(acquisitionRoyale.connect(user).deposit(1, TEST_DEPOSIT_RP)).revertedWith(
        'not enterprise owner'
      )
    })

    it("should burn an account's RP and increase their enterprise balance by the same amount", async () => {
      await runwayPoints.connect(deployer).transfer(user.address, TEST_DEPOSIT_RP)
      expect(await runwayPoints.balanceOf(user.address)).to.eq(TEST_DEPOSIT_RP)
      expect(await runwayPoints.balanceOf(acquisitionRoyale.address)).to.eq(0)
      expect((await acquisitionRoyale.getEnterprise(testEnterpriseId)).rp).to.eq(0)
      const expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
      const expectedCallerBalance = await calculateVirtualBalance(testEnterpriseId, expectedTime)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, expectedTime)

      await acquisitionRoyale.connect(user).deposit(testEnterpriseId, TEST_DEPOSIT_RP)

      expect(await runwayPoints.balanceOf(user.address)).to.eq(0)
      expect(await runwayPoints.balanceOf(acquisitionRoyale.address)).to.eq(0)
      expect((await acquisitionRoyale.getEnterprise(testEnterpriseId)).rp).to.eq(
        expectedCallerBalance.add(TEST_DEPOSIT_RP)
      )
      const burnEvent = await getERC20TransferEvent(runwayPoints, user.address, AddressZero)
      expect(burnEvent.args.value).to.eq(TEST_DEPOSIT_RP)
    })

    it('should give enterprise a moat if its balance becomes >= threshold', async () => {
      await runwayPoints.connect(deployer).transfer(user.address, testMoatThreshold)
      expect((await acquisitionRoyale.getEnterprise(testEnterpriseId)).rp).to.be.lt(
        testMoatThreshold
      )
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(false)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)
      const userRpBalanceBefore = await runwayPoints.balanceOf(user.address)
      const royaleRpBalanceBefore = await runwayPoints.balanceOf(acquisitionRoyale.address)
      const expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
      const expectedCallerBalance = await calculateVirtualBalance(testEnterpriseId, expectedTime)
      const rpToDeposit = testMoatThreshold.sub(expectedCallerBalance)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, expectedTime)

      await acquisitionRoyale.connect(user).deposit(testEnterpriseId, rpToDeposit)

      expect(await runwayPoints.balanceOf(user.address)).to.eq(userRpBalanceBefore.sub(rpToDeposit))
      expect(await runwayPoints.balanceOf(acquisitionRoyale.address)).to.eq(royaleRpBalanceBefore)
      expect((await acquisitionRoyale.getEnterprise(testEnterpriseId)).rp).to.be.gte(
        testMoatThreshold
      )
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(true)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)
      const burnEvent = await getERC20TransferEvent(runwayPoints, user.address, AddressZero)
      expect(burnEvent.args.value).to.eq(rpToDeposit)
    })

    it('should not give enterprise a moat if its balance stays < threshold', async () => {
      await runwayPoints.connect(deployer).transfer(user.address, testMoatThreshold)
      expect((await acquisitionRoyale.getEnterprise(testEnterpriseId)).rp).to.be.lt(
        testMoatThreshold
      )
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(false)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)
      const userRpBalanceBefore = await runwayPoints.balanceOf(user.address)
      const royaleRpBalanceBefore = await runwayPoints.balanceOf(acquisitionRoyale.address)
      const expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
      const expectedCallerBalance = await calculateVirtualBalance(testEnterpriseId, expectedTime)
      const rpToDeposit = testMoatThreshold.sub(expectedCallerBalance).sub(1)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, expectedTime)

      await acquisitionRoyale.connect(user).deposit(testEnterpriseId, rpToDeposit)

      expect(await runwayPoints.balanceOf(user.address)).to.eq(userRpBalanceBefore.sub(rpToDeposit))
      expect(await runwayPoints.balanceOf(acquisitionRoyale.address)).to.eq(royaleRpBalanceBefore)
      expect((await acquisitionRoyale.getEnterprise(testEnterpriseId)).rp).to.be.lt(
        testMoatThreshold
      )
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(false)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)
      const burnEvent = await getERC20TransferEvent(runwayPoints, user.address, AddressZero)
      expect(burnEvent.args.value).to.eq(rpToDeposit)
    })

    it("should not affect enterprise's existing moat if its balance stays >= threshold", async () => {
      // Setup the enterprise with a moat
      await runwayPoints.connect(deployer).transfer(user.address, testMoatThreshold)
      const expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
      const expectedCallerBalance = await calculateVirtualBalance(testEnterpriseId, expectedTime)
      let rpToDeposit = testMoatThreshold.sub(expectedCallerBalance)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, expectedTime)
      await acquisitionRoyale.connect(user).deposit(testEnterpriseId, rpToDeposit)
      // Proceed with pre-testcase verification and depositing additional RP
      expect((await acquisitionRoyale.getEnterprise(testEnterpriseId)).rp).to.be.gte(
        testMoatThreshold
      )
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(true)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)
      const userRpBalanceBefore = await runwayPoints.balanceOf(user.address)
      const royaleRpBalanceBefore = await runwayPoints.balanceOf(acquisitionRoyale.address)
      // Deposit 1 additional RP for simplicity
      rpToDeposit = BigNumber.from(1)

      await acquisitionRoyale.connect(user).deposit(testEnterpriseId, rpToDeposit)

      expect(await runwayPoints.balanceOf(user.address)).to.eq(userRpBalanceBefore.sub(rpToDeposit))
      expect(await runwayPoints.balanceOf(acquisitionRoyale.address)).to.eq(royaleRpBalanceBefore)
      expect((await acquisitionRoyale.getEnterprise(testEnterpriseId)).rp).to.be.gte(
        testMoatThreshold
      )
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(true)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)
      const burnEvent = await getERC20TransferEvent(runwayPoints, user.address, AddressZero)
      expect(burnEvent.args.value).to.eq(rpToDeposit)
    })

    it('should emit a Deposit event', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 1)
      await runwayPoints.connect(deployer).transfer(user.address, TEST_DEPOSIT_RP)

      await acquisitionRoyale.connect(user).deposit(1, TEST_DEPOSIT_RP)

      const event = await getDepositEvent(acquisitionRoyale, 1)
      expect(event.enterpriseId).to.eq(1)
      expect(event.amount).to.eq(TEST_DEPOSIT_RP)
    })
  })

  describe('# withdraw', () => {
    const testEnterpriseId = 0
    // use function() here to prevent inheriting of parent scope and allow access to mocha test name
    beforeEach(async function () {
      if (this.currentTest?.title !== 'should not be callable before game start time') {
        await acquisitionRoyale.connect(treasury).setGameStartTime(await getLastTimestamp())
      }
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, testEnterpriseId)
    })

    it('should not be callable before game start time', async () => {
      const currentTime = await getLastTimestamp()
      await acquisitionRoyale.connect(treasury).setGameStartTime(currentTime + TEST_TIME_DELAY)

      await expect(
        acquisitionRoyale.connect(user).withdraw(testEnterpriseId, TEST_DEPOSIT_RP)
      ).revertedWith('game has not begun')
    })

    it('should not allow caller to use a enterprise they do not own', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 1)
      expect(await acquisitionRoyale.ownerOf(testEnterpriseId)).to.eq(user.address)
      expect(await acquisitionRoyale.ownerOf(1)).to.eq(user2.address)

      await expect(acquisitionRoyale.connect(user).withdraw(1, TEST_DEPOSIT_RP)).revertedWith(
        'not enterprise owner'
      )
    })

    it('should revert if RP being withdrawn exceeds enterprise balance', async () => {
      await runwayPoints.connect(deployer).transfer(user.address, TEST_DEPOSIT_RP)
      await acquisitionRoyale.connect(user).deposit(testEnterpriseId, TEST_DEPOSIT_RP)
      expect((await acquisitionRoyale.getEnterprise(testEnterpriseId)).rp).to.be.gt(TEST_DEPOSIT_RP)
      const expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
      const expectedCallerBalance = await calculateVirtualBalance(testEnterpriseId, expectedTime)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, expectedTime)

      await expect(
        acquisitionRoyale.connect(user).withdraw(testEnterpriseId, expectedCallerBalance.add(1))
      ).revertedWith(
        'reverted with panic code 0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)'
      )
    })

    it("should subtract from the enterprise's balance and mint the equivalent amount of RP to the user, minus a fee", async () => {
      await runwayPoints.connect(deployer).transfer(user.address, TEST_DEPOSIT_RP)
      await acquisitionRoyale.connect(user).deposit(testEnterpriseId, TEST_DEPOSIT_RP)
      expect(await runwayPoints.balanceOf(user.address)).to.eq(0)
      expect((await acquisitionRoyale.getEnterprise(testEnterpriseId)).rp).to.be.gt(TEST_DEPOSIT_RP)
      const expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
      const expectedCallerBalance = await calculateVirtualBalance(testEnterpriseId, expectedTime)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, expectedTime)

      await acquisitionRoyale.connect(user).withdraw(testEnterpriseId, TEST_DEPOSIT_RP)

      const withdrawalBurn = TEST_DEPOSIT_RP.mul(DEFAULT_WITHDRAWAL_BURN).div(PERCENT_DENOMINATOR)
      expect(await runwayPoints.balanceOf(user.address)).to.eq(TEST_DEPOSIT_RP.sub(withdrawalBurn))
      expect((await acquisitionRoyale.getEnterprise(testEnterpriseId)).rp).to.eq(
        expectedCallerBalance.sub(TEST_DEPOSIT_RP)
      )
      const mintEvent = await getERC20TransferEvent(runwayPoints, AddressZero, user.address)
      expect(mintEvent.args.value).to.eq(TEST_DEPOSIT_RP.sub(withdrawalBurn))
    })

    it('should give the enterprise a moat and begin its countdown if it obtains a moat from RP passively accumulated, but its balance falls < threshold', async () => {
      // Give the enterprise a balance to qualify for a moat, don't register with the Moat contract to simulate RP passively accumulated
      await acquisitionRoyale.connect(treasury).setEnterpriseRp(testEnterpriseId, testMoatThreshold)
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.be.eq(false)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.be.eq(0)
      const expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
      const expectedCallerBalance = await calculateVirtualBalance(testEnterpriseId, expectedTime)
      expect(expectedCallerBalance).to.be.gte(testMoatThreshold)
      // Withdraw 1 additional RP to bring the balance underneath the threshold
      const rpToWithdraw = expectedCallerBalance.sub(testMoatThreshold).add(1)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, expectedTime)

      await acquisitionRoyale.connect(user).withdraw(testEnterpriseId, rpToWithdraw)

      expect(await moat.getLastHadMoat(testEnterpriseId)).to.be.eq(true)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.be.eq(await getLastTimestamp())
      // Verify core withdrawal behavior along with Moat behavior
      const withdrawalBurn = rpToWithdraw.mul(DEFAULT_WITHDRAWAL_BURN).div(PERCENT_DENOMINATOR)
      expect(await runwayPoints.balanceOf(user.address)).to.eq(rpToWithdraw.sub(withdrawalBurn))
      expect((await acquisitionRoyale.getEnterprise(testEnterpriseId)).rp).to.eq(
        expectedCallerBalance.sub(rpToWithdraw)
      )
      const mintEvent = await getERC20TransferEvent(runwayPoints, AddressZero, user.address)
      expect(mintEvent.args.value).to.eq(rpToWithdraw.sub(withdrawalBurn))
    })

    it('should give the enterprise a moat and not begin its countdown if it obtains a moat from RP passively accumulated and its balance stays >= threshold', async () => {
      // Give the enterprise a balance to qualify for a moat, don't register with the Moat contract to simulate RP passively accumulated
      await acquisitionRoyale.connect(treasury).setEnterpriseRp(testEnterpriseId, testMoatThreshold)
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.be.eq(false)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.be.eq(0)
      const expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
      const expectedCallerBalance = await calculateVirtualBalance(testEnterpriseId, expectedTime)
      const rpToWithdraw = BigNumber.from(1)
      // Verify that if we withdraw 1 RP from the caller's balance, it remains above the treshold
      expect(expectedCallerBalance.sub(rpToWithdraw)).to.be.gte(testMoatThreshold)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, expectedTime)

      await acquisitionRoyale.connect(user).withdraw(testEnterpriseId, rpToWithdraw)

      expect(await moat.getLastHadMoat(testEnterpriseId)).to.be.eq(true)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.be.eq(0)
      // Verify core withdrawal behavior along with Moat behavior
      const withdrawalBurn = rpToWithdraw.mul(DEFAULT_WITHDRAWAL_BURN).div(PERCENT_DENOMINATOR)
      expect(await runwayPoints.balanceOf(user.address)).to.eq(rpToWithdraw.sub(withdrawalBurn))
      expect((await acquisitionRoyale.getEnterprise(testEnterpriseId)).rp).to.eq(
        expectedCallerBalance.sub(rpToWithdraw)
      )
      const mintEvent = await getERC20TransferEvent(runwayPoints, AddressZero, user.address)
      expect(mintEvent.args.value).to.eq(rpToWithdraw.sub(withdrawalBurn))
    })

    it("should begin an enterprise's moat countdown if its balance becomes < threshold", async () => {
      // Give the enterprise a balance to qualify for a moat and register it with the Moat contract
      await acquisitionRoyale.connect(treasury).setEnterpriseRp(testEnterpriseId, testMoatThreshold)
      await acquisitionRoyale.callDepositHook(testEnterpriseId, 0)
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.be.eq(true)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.be.eq(0)
      const expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
      const expectedCallerBalance = await calculateVirtualBalance(testEnterpriseId, expectedTime)
      // Withdraw an additional RP to bring the balance underneath the threshold
      const rpToWithdraw = expectedCallerBalance.sub(testMoatThreshold).add(1)
      expect(expectedCallerBalance.sub(rpToWithdraw)).to.be.lt(testMoatThreshold)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, expectedTime)

      await acquisitionRoyale.connect(user).withdraw(testEnterpriseId, rpToWithdraw)

      expect(await moat.getLastHadMoat(testEnterpriseId)).to.be.eq(true)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.be.eq(await getLastTimestamp())
      // Verify core withdrawal behavior along with Moat behavior
      const withdrawalBurn = rpToWithdraw.mul(DEFAULT_WITHDRAWAL_BURN).div(PERCENT_DENOMINATOR)
      expect(await runwayPoints.balanceOf(user.address)).to.eq(rpToWithdraw.sub(withdrawalBurn))
      expect((await acquisitionRoyale.getEnterprise(testEnterpriseId)).rp).to.eq(
        expectedCallerBalance.sub(rpToWithdraw)
      )
      const mintEvent = await getERC20TransferEvent(runwayPoints, AddressZero, user.address)
      expect(mintEvent.args.value).to.eq(rpToWithdraw.sub(withdrawalBurn))
    })

    it("should not affect an enterprise's moat if it already has one and its balance stays >= threshold", async () => {
      // Give the enterprise a balance to qualify for a moat and register it with the Moat contract
      await acquisitionRoyale.connect(treasury).setEnterpriseRp(testEnterpriseId, testMoatThreshold)
      await acquisitionRoyale.callDepositHook(testEnterpriseId, 0)
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.be.eq(true)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.be.eq(0)
      const expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
      const expectedCallerBalance = await calculateVirtualBalance(testEnterpriseId, expectedTime)
      const rpToWithdraw = BigNumber.from(1)
      // Verify that if we withdraw 1 RP from the caller's balance, it remains above the treshold
      expect(expectedCallerBalance.sub(rpToWithdraw)).to.be.gte(testMoatThreshold)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, expectedTime)

      await acquisitionRoyale.connect(user).withdraw(testEnterpriseId, rpToWithdraw)

      expect(await moat.getLastHadMoat(testEnterpriseId)).to.be.eq(true)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.be.eq(0)
      // Verify core withdrawal behavior along with Moat behavior
      const withdrawalBurn = rpToWithdraw.mul(DEFAULT_WITHDRAWAL_BURN).div(PERCENT_DENOMINATOR)
      expect(await runwayPoints.balanceOf(user.address)).to.eq(rpToWithdraw.sub(withdrawalBurn))
      expect((await acquisitionRoyale.getEnterprise(testEnterpriseId)).rp).to.eq(
        expectedCallerBalance.sub(rpToWithdraw)
      )
      const mintEvent = await getERC20TransferEvent(runwayPoints, AddressZero, user.address)
      expect(mintEvent.args.value).to.eq(rpToWithdraw.sub(withdrawalBurn))
    })

    it('should not give the enterprise a moat if its balance stays < threshold', async () => {
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.be.eq(false)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.be.eq(0)
      const expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
      const expectedCallerBalance = await calculateVirtualBalance(testEnterpriseId, expectedTime)
      const rpToWithdraw = BigNumber.from(1)
      // Verify that if we withdraw 1 RP from the caller's balance, it remains below the treshold
      expect(expectedCallerBalance.sub(rpToWithdraw)).to.be.lt(testMoatThreshold)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, expectedTime)

      await acquisitionRoyale.connect(user).withdraw(testEnterpriseId, rpToWithdraw)

      expect(await moat.getLastHadMoat(testEnterpriseId)).to.be.eq(false)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.be.eq(0)
      // Verify core withdrawal behavior along with Moat behavior
      const withdrawalBurn = rpToWithdraw.mul(DEFAULT_WITHDRAWAL_BURN).div(PERCENT_DENOMINATOR)
      expect(await runwayPoints.balanceOf(user.address)).to.eq(rpToWithdraw.sub(withdrawalBurn))
      expect((await acquisitionRoyale.getEnterprise(testEnterpriseId)).rp).to.eq(
        expectedCallerBalance.sub(rpToWithdraw)
      )
      const mintEvent = await getERC20TransferEvent(runwayPoints, AddressZero, user.address)
      expect(mintEvent.args.value).to.eq(rpToWithdraw.sub(withdrawalBurn))
    })

    it('should emit a Withdrawal event', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 1)
      await runwayPoints.connect(deployer).transfer(user.address, TEST_DEPOSIT_RP)
      await acquisitionRoyale.connect(user).deposit(1, TEST_DEPOSIT_RP)
      const expectedTime = (await getLastTimestamp()) + TEST_TIME_DELAY
      const expectedCallerBalance = await calculateVirtualBalance(1, expectedTime)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, expectedTime)

      await acquisitionRoyale.connect(user).withdraw(1, expectedCallerBalance)

      const withdrawalBurn = expectedCallerBalance
        .mul(DEFAULT_WITHDRAWAL_BURN)
        .div(PERCENT_DENOMINATOR)
      const event = await getWithdrawalEvent(acquisitionRoyale, 1)
      expect(event.enterpriseId).to.eq(1)
      expect(event.amountAfterFee).to.eq(expectedCallerBalance.sub(withdrawalBurn))
      expect(event.fee).to.eq(withdrawalBurn)
    })
  })

  describe('# rename', () => {
    it('should require user to have a rename token balance > 0', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      expect(await renameTokenBalance(user.address)).to.eq(0)

      await expect(acquisitionRoyale.connect(user).rename(0, 'Test Name')).revertedWith(
        'caller is not token owner'
      )
    })

    it('should not allow caller to use a enterprise they do not own', async () => {
      await fundRenameTokens(user.address, 1)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 1)
      expect(await acquisitionRoyale.ownerOf(0)).to.eq(user.address)
      expect(await acquisitionRoyale.ownerOf(1)).to.eq(user2.address)

      await expect(acquisitionRoyale.connect(user).rename(1, 'Test Name')).revertedWith(
        'not enterprise owner'
      )
    })

    it('should not allow setting to a name that is taken', async () => {
      await fundRenameTokens(user.address, 1)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(user).rename(0, 'Test Name')
      expect(await acquisitionRoyale.isNameInUse('Test Name')).to.eq(true)
      await fundRenameTokens(user2.address, 1)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 1)

      await expect(acquisitionRoyale.connect(user2).rename(1, 'Test Name')).revertedWith(
        'name in use'
      )
    })

    it('should not allow a name longer than 20 characters', async () => {
      await fundRenameTokens(user.address, 1)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)

      await expect(acquisitionRoyale.connect(user).rename(0, 'This name is 21 chars')).revertedWith(
        'invalid name'
      )
    })

    it('should not allow a name with a leading space', async () => {
      await fundRenameTokens(user.address, 1)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)

      await expect(acquisitionRoyale.connect(user).rename(0, ' leading space')).revertedWith(
        'invalid name'
      )
    })

    it('should not allow a name with a trailing space', async () => {
      await fundRenameTokens(user.address, 1)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)

      await expect(acquisitionRoyale.connect(user).rename(0, 'trailing space ')).revertedWith(
        'invalid name'
      )
    })

    it('should not allow a name with continuous spaces', async () => {
      await fundRenameTokens(user.address, 1)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)

      await expect(acquisitionRoyale.connect(user).rename(0, 'cont  inuous')).revertedWith(
        'invalid name'
      )
    })

    it('should correctly change the name of an enterprise if name is valid', async () => {
      await fundRenameTokens(user.address, 1)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      expect((await acquisitionRoyale.getEnterprise(0)).name).to.eq('')
      expect((await acquisitionRoyale.getEnterprise(0)).renames).to.eq(0)

      await acquisitionRoyale.connect(user).rename(0, 'Test Name')

      expect((await acquisitionRoyale.getEnterprise(0)).name).to.eq('Test Name')
      expect((await acquisitionRoyale.getEnterprise(0)).renames).to.eq(1)
    })

    it('should allow owner to rename enterprise without needing rename tokens', async () => {
      await fundRenameTokens(user.address, 1)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(user).rename(0, 'Test Name')
      expect((await acquisitionRoyale.getEnterprise(0)).name).to.eq('Test Name')
      expect(await renameTokenBalance(treasury.address)).to.eq(0)

      await acquisitionRoyale.connect(treasury).rename(0, '')

      expect((await acquisitionRoyale.getEnterprise(0)).name).to.eq('')
    })

    it('should emit a Rename event indexed by enterpriseId', async () => {
      await fundRenameTokens(user.address, 1)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(user).rename(0, 'Test Name')

      const renameEvent = await getRenameEvent(acquisitionRoyale, 0)
      expect(renameEvent.enterpriseId).to.eq(0)
      expect(renameEvent.name).to.eq('Test Name')
    })
  })

  describe('# rebrand', () => {
    beforeEach(async () => {
      await acquisitionRoyale.connect(treasury).setSupportForBranding(mockBranding.address, true)
    })

    it('should require user to have a rebrand token balance > 0', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      expect(await acquisitionRoyale.ownerOf(0)).to.eq(user.address)
      expect(await rebrandTokenBalance(user.address)).to.eq(0)

      await expect(acquisitionRoyale.connect(user).rebrand(0, mockBranding.address)).revertedWith(
        'caller is not token owner'
      )
    })

    it('should not allow caller to use a enterprise they do not own', async () => {
      await fundRebrandTokens(user.address, 1)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user2.address, 1)
      expect(await acquisitionRoyale.ownerOf(0)).to.eq(user.address)
      expect(await acquisitionRoyale.ownerOf(1)).to.eq(user2.address)

      await expect(acquisitionRoyale.connect(user).rebrand(1, mockBranding.address)).revertedWith(
        'not enterprise owner'
      )
    })

    it('should not allow setting to a branding that is not whitelisted', async () => {
      await fundRebrandTokens(user.address, 1)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      const notSupportedBranding = await mockBrandingFixture()
      expect(await acquisitionRoyale.isBrandingSupported(notSupportedBranding.address)).to.eq(false)

      await expect(
        acquisitionRoyale.connect(user).rebrand(0, notSupportedBranding.address)
      ).revertedWith('branding not supported')
    })

    it('should set branding of enterprise to the new branding', async () => {
      await fundRebrandTokens(user.address, 1)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      expect((await acquisitionRoyale.getEnterprise(0)).branding).to.eq(AddressZero)
      expect((await acquisitionRoyale.getEnterprise(0)).rebrands).to.eq(0)

      await acquisitionRoyale.connect(user).rebrand(0, mockBranding.address)

      expect((await acquisitionRoyale.getEnterprise(0)).branding).to.eq(mockBranding.address)
      expect((await acquisitionRoyale.getEnterprise(0)).rebrands).to.eq(1)
    })

    it('should allow owner to rebrand their enterprise without needing rebrand tokens', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(treasury.address, 0)
      expect((await acquisitionRoyale.getEnterprise(0)).branding).to.eq(AddressZero)
      expect(await rebrandTokenBalance(treasury.address)).to.eq(0)

      await acquisitionRoyale.connect(treasury).rebrand(0, mockBranding.address)

      expect((await acquisitionRoyale.getEnterprise(0)).branding).to.eq(mockBranding.address)
    })

    it('should prevent owner from rebranding non-owned enterprises', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      expect((await acquisitionRoyale.getEnterprise(0)).branding).to.eq(AddressZero)

      await expect(
        acquisitionRoyale.connect(treasury).rebrand(0, mockBranding.address)
      ).revertedWith('not enterprise owner')
    })

    it('should emit a Rebrand event indexed by enterpriseId', async () => {
      await fundRebrandTokens(user.address, 1)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)

      await acquisitionRoyale.connect(user).rebrand(0, mockBranding.address)

      const rebrandEvent = await getRebrandEvent(acquisitionRoyale, 0)
      expect(rebrandEvent.enterpriseId).to.eq(0)
      expect(rebrandEvent.branding).to.eq(mockBranding.address)
    })
  })

  describe('# revive', () => {
    // use function() here to prevent inheriting of parent scope and allow access to mocha test name
    beforeEach(async function () {
      if (this.currentTest?.title !== 'should not be callable before game start time') {
        await acquisitionRoyale.connect(treasury).setGameStartTime(await getLastTimestamp())
      }
    })

    it('should not be callable before game start time', async () => {
      const currentTime = await getLastTimestamp()
      await acquisitionRoyale.connect(treasury).setGameStartTime(currentTime + TEST_TIME_DELAY)

      await expect(acquisitionRoyale.connect(user).revive(0)).revertedWith('game has not begun')
    })

    it('should require user to have a revive token balance > 0', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).setAuctionCount(1)
      await acquisitionRoyale.connect(treasury).burnEnterprise(0)
      expect(await reviveTokenBalance(user.address)).to.eq(0)

      await expect(acquisitionRoyale.connect(user).revive(0)).revertedWith(
        'caller is not token owner'
      )
    })

    it('should not allow caller to revive an enterprise that exists', async () => {
      await fundReviveTokens(user.address, 1)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      expect(await acquisitionRoyale.ownerOf(0)).to.eq(user.address)

      await expect(acquisitionRoyale.connect(user).revive(0)).revertedWith(
        'enterprise already exists'
      )
    })

    it("should not allow caller to revive an enterprise that hasn't been minted", async () => {
      await fundReviveTokens(user.address, 1)
      expect(await acquisitionRoyale.ownerOf(0)).to.eq(AddressZero)
      expect(await acquisitionRoyale.getAuctionCount()).to.eq(0)

      await expect(acquisitionRoyale.connect(user).revive(0)).revertedWith(
        'enterprise has not been minted'
      )
    })

    it('should revive NFT by minting and transferring to sender', async () => {
      await fundReviveTokens(user.address, 1)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).setAuctionCount(1)
      await acquisitionRoyale.connect(treasury).burnEnterprise(0)
      expect(await acquisitionRoyale.ownerOf(0)).to.eq(AddressZero)
      expect((await acquisitionRoyale.getEnterprise(0)).revives).to.eq(0)

      await acquisitionRoyale.connect(user).revive(0)

      expect(await acquisitionRoyale.ownerOf(0)).to.eq(user.address)
      expect((await acquisitionRoyale.getEnterprise(0)).revives).to.eq(1)
    })

    it('should set last RP update time of the revived enterprise to current time', async () => {
      await fundReviveTokens(user.address, 1)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).setAuctionCount(1)
      await acquisitionRoyale.connect(treasury).burnEnterprise(0)

      await acquisitionRoyale.connect(user).revive(0)

      expect((await acquisitionRoyale.getEnterprise(0)).revivalImmunityStartTime).to.eq(
        await getLastTimestamp()
      )
    })

    it('should preserve attributes of the enterprise (except RP) before it was burned', async () => {
      await fundReviveTokens(user.address, 1)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).setAuctionCount(1)
      const testEnterpriseRp = parseEther('1000')
      const testAttributes = {
        _enterpriseId: 0,
        _name: 'Test Enterprise',
        _rp: testEnterpriseRp,
        _competes: 5,
        _acquisitions: 4,
        _mergers: 3,
        _fundraiseRpTotal: parseEther('500'),
        _fundraiseWethTotal: parseEther('10'),
        _damageDealt: parseEther('250'),
        _damageTaken: parseEther('100'),
        _rebrands: 2,
        _revives: 1,
      }
      await acquisitionRoyale
        .connect(treasury)
        .setEnterpriseStats(
          testAttributes._enterpriseId,
          testAttributes._name,
          testAttributes._rp,
          testAttributes._competes,
          testAttributes._acquisitions,
          testAttributes._mergers,
          testAttributes._fundraiseRpTotal,
          testAttributes._fundraiseWethTotal,
          testAttributes._damageDealt,
          testAttributes._damageTaken,
          testAttributes._rebrands,
          testAttributes._revives
        )
      const attributesBeforeBurn = await acquisitionRoyale.getEnterprise(0)
      expect(attributesBeforeBurn.rp).to.eq(testEnterpriseRp)
      await acquisitionRoyale.connect(treasury).burnEnterprise(0)

      await acquisitionRoyale.connect(user).revive(0)

      const attributesAfterBurn = await acquisitionRoyale.getEnterprise(0)
      attributesBeforeBurn.forEach(function (key) {
        if (
          /**
           * ethers.js returns the result of a contract query as both an object with the names of
           * each value as the key, and one with their index as the key.
           * We want to ignore the index keys and use the names of each return value.
           */
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Number.isNaN(key as any)
        ) {
          if (key !== 'revivalImmunityStartTime' && key !== 'rp') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect(attributesBeforeBurn[key as any]).to.eq(attributesAfterBurn[key as any])
          } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect(attributesBeforeBurn[key as any]).to.not.eq(attributesAfterBurn[key as any])
          }
        }
      })
      expect(attributesAfterBurn.rp).to.eq(0)
    })

    it('should allow owner to revive an enterprise without needing revive tokens', async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).setAuctionCount(1)
      await acquisitionRoyale.connect(treasury).burnEnterprise(0)
      expect(await acquisitionRoyale.ownerOf(0)).to.eq(AddressZero)
      expect(await reviveTokenBalance(treasury.address)).to.eq(0)

      await acquisitionRoyale.connect(treasury).revive(0)

      expect(await acquisitionRoyale.ownerOf(0)).to.eq(treasury.address)
    })

    it('should emit a Revival event indexed by enterpriseId', async () => {
      await fundReviveTokens(user.address, 1)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await acquisitionRoyale.connect(treasury).setAuctionCount(1)
      await acquisitionRoyale.connect(treasury).burnEnterprise(0)

      await acquisitionRoyale.connect(user).revive(0)

      const revivalEvent = await getRevivalEvent(acquisitionRoyale, 0)
      expect(revivalEvent.enterpriseId).to.eq(0)
    })
  })

  describe('# tokenURI', () => {
    it('should return the fallback brand art if art is blank', async () => {
      await acquisitionRoyale.connect(treasury).setFallbackBranding(mockFallbackBranding.address)
      await acquisitionRoyale
        .connect(treasury)
        .setSupportForBranding(mockBlankBranding.address, true)
      await acquisitionRoyale.connect(treasury).foundReserved(user.address)
      await fundRebrandTokens(user.address, 1)
      await acquisitionRoyale.connect(user).rebrand(RESERVED_STARTING_ID, mockBlankBranding.address)
      expect(await mockBlankBranding.getArt(RESERVED_STARTING_ID)).to.eq('')

      expect(await acquisitionRoyale.tokenURI(RESERVED_STARTING_ID)).to.eq('Fallback Art')
    })

    it('should return the fallback brand art if enterprise branding art reverts', async () => {
      await acquisitionRoyale.connect(treasury).setFallbackBranding(mockFallbackBranding.address)
      await acquisitionRoyale
        .connect(treasury)
        .setSupportForBranding(mockRevertBranding.address, true)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await fundRebrandTokens(user.address, 1)
      await acquisitionRoyale.connect(user).rebrand(0, mockRevertBranding.address)
      await expect(mockRevertBranding.getArt(0)).revertedWith('This should revert!')

      expect(await acquisitionRoyale.tokenURI(0)).to.eq('Fallback Art')
    })

    it('should return the fallback brand art if brand is not supported', async () => {
      await acquisitionRoyale.connect(treasury).setFallbackBranding(mockFallbackBranding.address)
      await acquisitionRoyale.connect(treasury).setSupportForBranding(mockBranding.address, true)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await fundRebrandTokens(user.address, 1)
      await acquisitionRoyale.connect(user).rebrand(0, mockBranding.address)
      await acquisitionRoyale.connect(treasury).setSupportForBranding(mockBranding.address, false)
      expect((await acquisitionRoyale.getEnterprise(0)).branding).to.eq(mockBranding.address)
      expect(await acquisitionRoyale.isBrandingSupported(mockBranding.address)).to.eq(false)

      expect(await acquisitionRoyale.tokenURI(0)).to.eq('Fallback Art')
    })

    it('should return the enterprise brand art if art is non-blank', async () => {
      await acquisitionRoyale.connect(treasury).setFallbackBranding(mockFallbackBranding.address)
      await acquisitionRoyale.connect(treasury).setSupportForBranding(mockBranding.address, true)
      await acquisitionRoyale.connect(treasury).foundReserved(user.address)
      await fundRebrandTokens(user.address, 1)
      await acquisitionRoyale.connect(user).rebrand(RESERVED_STARTING_ID, mockBranding.address)
      expect(await mockBranding.getArt(RESERVED_STARTING_ID)).to.eq('Test Art')

      expect(await acquisitionRoyale.tokenURI(RESERVED_STARTING_ID)).to.eq('Test Art')
    })
  })

  describe('# getArtist', () => {
    it('should return the fallback brand artist if art is blank', async () => {
      await acquisitionRoyale.connect(treasury).setFallbackBranding(mockFallbackBranding.address)
      await acquisitionRoyale
        .connect(treasury)
        .setSupportForBranding(mockBlankBranding.address, true)
      await acquisitionRoyale.connect(treasury).foundReserved(user.address)
      await fundRebrandTokens(user.address, 1)
      await acquisitionRoyale.connect(user).rebrand(RESERVED_STARTING_ID, mockBlankBranding.address)
      expect(await mockBlankBranding.getArt(RESERVED_STARTING_ID)).to.eq('')

      expect(await acquisitionRoyale.getArtist(RESERVED_STARTING_ID)).to.eq('fallback artist')
    })

    it('should return the fallback brand artist if enterprise branding art reverts', async () => {
      await acquisitionRoyale.connect(treasury).setFallbackBranding(mockFallbackBranding.address)
      await acquisitionRoyale
        .connect(treasury)
        .setSupportForBranding(mockRevertBranding.address, true)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await fundRebrandTokens(user.address, 1)
      await acquisitionRoyale.connect(user).rebrand(0, mockRevertBranding.address)
      await expect(mockRevertBranding.getArt(0)).revertedWith('This should revert!')

      expect(await acquisitionRoyale.getArtist(0)).to.eq('fallback artist')
    })

    it('should return the fallback brand artist if brand is not supported', async () => {
      await acquisitionRoyale.connect(treasury).setFallbackBranding(mockFallbackBranding.address)
      await acquisitionRoyale.connect(treasury).setSupportForBranding(mockBranding.address, true)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, 0)
      await fundRebrandTokens(user.address, 1)
      await acquisitionRoyale.connect(user).rebrand(0, mockBranding.address)
      await acquisitionRoyale.connect(treasury).setSupportForBranding(mockBranding.address, false)
      expect((await acquisitionRoyale.getEnterprise(0)).branding).to.eq(mockBranding.address)
      expect(await acquisitionRoyale.isBrandingSupported(mockBranding.address)).to.eq(false)

      expect(await acquisitionRoyale.getArtist(0)).to.eq('fallback artist')
    })

    it('should return the enterprise brand artist if art is non-blank', async () => {
      await acquisitionRoyale.connect(treasury).setFallbackBranding(mockFallbackBranding.address)
      await acquisitionRoyale.connect(treasury).setSupportForBranding(mockBranding.address, true)
      await acquisitionRoyale.connect(treasury).foundReserved(user.address)
      await fundRebrandTokens(user.address, 1)
      await acquisitionRoyale.connect(user).rebrand(RESERVED_STARTING_ID, mockBranding.address)
      expect(await mockBranding.getArt(RESERVED_STARTING_ID)).to.eq('Test Art')

      expect(await acquisitionRoyale.getArtist(RESERVED_STARTING_ID)).to.eq('test artist')
    })
  })

  describe('# isMinted', () => {
    it('should return true for a minted enterprise at the start of the (0-8999) range', async () => {
      // tokenId = 0
      expect(await acquisitionRoyale.isMinted(AUCTION_STARTING_ID)).to.eq(false)
      await setFoundingPriceAndTime(defaultPriceAndTimeParams)
      const expectedAmount = await calculateAuctionPrice(await getLastTimestamp())

      await acquisitionRoyale.connect(user).foundAuctioned(1, { value: expectedAmount })

      expect(await acquisitionRoyale.ownerOf(AUCTION_STARTING_ID)).to.eq(user.address)
      expect(await acquisitionRoyale.isMinted(AUCTION_STARTING_ID)).to.eq(true)
    })

    it('should return true for a minted enterprise within the (0-8999) range', async () => {
      const testTokenId = randomInt(0, AUCTION_SUPPLY)
      expect(await acquisitionRoyale.isMinted(testTokenId)).to.eq(false)
      await setFoundingPriceAndTime(defaultPriceAndTimeParams)
      await acquisitionRoyale.connect(treasury).setAuctionCount(testTokenId)
      const expectedAmount = await calculateAuctionPrice(await getLastTimestamp())

      await acquisitionRoyale.connect(user).foundAuctioned(1, { value: expectedAmount })

      expect(await acquisitionRoyale.ownerOf(testTokenId)).to.eq(user.address)
      expect(await acquisitionRoyale.isMinted(testTokenId)).to.eq(true)
    })

    it('should return false for an enterprise that has not been minted within the (0-8999) range', async () => {
      const testTokenId = randomInt(0, AUCTION_SUPPLY)

      expect(await acquisitionRoyale.isMinted(testTokenId)).to.eq(false)
      expect(await acquisitionRoyale.ownerOf(testTokenId)).to.eq(AddressZero)
    })

    it('should return true for a minted enterprise at the start of the (9000-13999) range', async () => {
      // tokenId = 9000
      expect(await acquisitionRoyale.isMinted(RESERVED_STARTING_ID)).to.eq(false)

      await acquisitionRoyale.connect(treasury).foundReserved(user.address)

      expect(await acquisitionRoyale.ownerOf(RESERVED_STARTING_ID)).to.eq(user.address)
      expect(await acquisitionRoyale.isMinted(RESERVED_STARTING_ID)).to.eq(true)
    })

    it('should return true for a minted enterprise within the (9000-13999) range', async () => {
      const testTokenId = randomInt(RESERVED_STARTING_ID, AUCTION_SUPPLY + FREE_SUPPLY)
      expect(await acquisitionRoyale.isMinted(testTokenId)).to.eq(false)
      await acquisitionRoyale.connect(treasury).setFreeCount(testTokenId - AUCTION_SUPPLY)

      await acquisitionRoyale.connect(treasury).foundReserved(user.address)

      expect(await acquisitionRoyale.ownerOf(testTokenId)).to.eq(user.address)
      expect(await acquisitionRoyale.isMinted(testTokenId)).to.eq(true)
    })

    it('should return false for an enterprise that has not been minted within the (9000-13999) range', async () => {
      const testTokenId = randomInt(RESERVED_STARTING_ID, AUCTION_SUPPLY + FREE_SUPPLY)

      expect(await acquisitionRoyale.isMinted(testTokenId)).to.eq(false)
      expect(await acquisitionRoyale.ownerOf(testTokenId)).to.eq(AddressZero)
    })

    it('should return true for a minted enterprise at the start of the (14000-14999) range', async () => {
      // tokenId = 14000
      expect(await acquisitionRoyale.ownerOf(AUCTION_SUPPLY + FREE_SUPPLY)).to.eq(AddressZero)
      await acquisitionRoyale.connect(treasury).setFreeCount(FREE_SUPPLY)

      await acquisitionRoyale.connect(treasury).foundReserved(user.address)

      expect(await acquisitionRoyale.ownerOf(AUCTION_SUPPLY + FREE_SUPPLY)).to.eq(user.address)
      expect(await acquisitionRoyale.isMinted(AUCTION_SUPPLY + FREE_SUPPLY)).to.eq(true)
    })

    it('should return true for a minted enterprise within the (14000-14999) range', async () => {
      const testTokenId = randomInt(
        AUCTION_SUPPLY + FREE_SUPPLY,
        AUCTION_SUPPLY + FREE_SUPPLY + RESERVED_SUPPLY
      )
      expect(await acquisitionRoyale.isMinted(testTokenId)).to.eq(false)
      await acquisitionRoyale.connect(treasury).setFreeCount(FREE_SUPPLY)
      await acquisitionRoyale
        .connect(treasury)
        .setReservedCount(testTokenId - AUCTION_SUPPLY - FREE_SUPPLY)

      await acquisitionRoyale.connect(treasury).foundReserved(user.address)

      expect(await acquisitionRoyale.ownerOf(testTokenId)).to.eq(user.address)
      expect(await acquisitionRoyale.isMinted(testTokenId)).to.eq(true)
    })

    it('should return false for an enterprise that has not been minted within the (14000-14999) range', async () => {
      const testTokenId = randomInt(
        AUCTION_SUPPLY + FREE_SUPPLY,
        AUCTION_SUPPLY + FREE_SUPPLY + RESERVED_SUPPLY
      )

      expect(await acquisitionRoyale.isMinted(testTokenId)).to.eq(false)
      expect(await acquisitionRoyale.ownerOf(testTokenId)).to.eq(AddressZero)
    })

    it('should return false for a tokenId greater than 14999', async () => {
      // tokenId = 15000
      expect(
        await acquisitionRoyale.isMinted(AUCTION_SUPPLY + FREE_SUPPLY + RESERVED_SUPPLY)
      ).to.eq(false)
    })

    it('should return true for a minted enterprise that was burnt', async () => {
      await acquisitionRoyale.connect(treasury).foundReserved(user.address)
      expect(await acquisitionRoyale.isMinted(RESERVED_STARTING_ID)).to.eq(true)

      await acquisitionRoyale.connect(treasury).burnEnterprise(RESERVED_STARTING_ID)

      expect(await acquisitionRoyale.ownerOf(RESERVED_STARTING_ID)).to.eq(AddressZero)
      expect(await acquisitionRoyale.isMinted(RESERVED_STARTING_ID)).to.eq(true)
    })
  })

  describe('# burnRP', () => {
    let accountsToBurnFrom: SignerWithAddress[]
    beforeEach(async () => {
      accountsToBurnFrom = (await ethers.getSigners()).slice(1, 5)
      // eslint-disable-next-line no-restricted-syntax
      for (const account of accountsToBurnFrom) {
        // eslint-disable-next-line no-await-in-loop
        await runwayPoints.connect(deployer).transfer(account.address, TEST_DEPOSIT_RP)
      }
    })

    it('should only be usable by the owner', async () => {
      // eslint-disable-next-line no-restricted-syntax
      for (const account of accountsToBurnFrom) {
        // eslint-disable-next-line no-await-in-loop
        await expect(
          acquisitionRoyale.connect(user).burnRP(account.address, TEST_DEPOSIT_RP)
        ).revertedWith('Ownable: caller is not the owner')
      }
    })

    it("should be able to burn any account's RP as owner (less than entire balance)", async () => {
      // eslint-disable-next-line no-restricted-syntax
      for (const account of accountsToBurnFrom) {
        // eslint-disable-next-line no-await-in-loop
        expect(await runwayPoints.balanceOf(account.address)).to.eq(TEST_DEPOSIT_RP)
      }

      // eslint-disable-next-line no-restricted-syntax
      for (const account of accountsToBurnFrom) {
        // eslint-disable-next-line no-await-in-loop
        await acquisitionRoyale.connect(treasury).burnRP(account.address, TEST_DEPOSIT_RP.sub(1))
      }

      // eslint-disable-next-line no-restricted-syntax
      for (const account of accountsToBurnFrom) {
        // eslint-disable-next-line no-await-in-loop
        expect(await runwayPoints.balanceOf(account.address)).to.eq(1)
      }
    })

    it("should be able to burn any account's RP as owner (entire balance)", async () => {
      // eslint-disable-next-line no-restricted-syntax
      for (const account of accountsToBurnFrom) {
        // eslint-disable-next-line no-await-in-loop
        expect(await runwayPoints.balanceOf(account.address)).to.eq(TEST_DEPOSIT_RP)
      }

      // eslint-disable-next-line no-restricted-syntax
      for (const account of accountsToBurnFrom) {
        // eslint-disable-next-line no-await-in-loop
        await acquisitionRoyale.connect(treasury).burnRP(account.address, TEST_DEPOSIT_RP)
      }

      // eslint-disable-next-line no-restricted-syntax
      for (const account of accountsToBurnFrom) {
        // eslint-disable-next-line no-await-in-loop
        expect(await runwayPoints.balanceOf(account.address)).to.eq(0)
      }
    })
  })
})
