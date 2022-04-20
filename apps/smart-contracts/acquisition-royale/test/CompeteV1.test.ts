import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { MerkleTree } from 'merkletreejs'
import { BigNumber } from 'ethers'
import { merkleProofVerifierFixture } from './fixtures/MerkleProofVerifierFixture'
import { mockERC20Fixture } from './fixtures/MockERC20Fixture'
import { runwayPointsFixture } from './fixtures/RunwayPointsFixture'
import { competeV1Fixture } from './fixtures/CompeteFixture'
import { acquisitionRoyaleConsumablesFixture } from './fixtures/AcquisitionRoyaleConsumablesFixture'
import { mockAcquisitionRoyaleFixture } from './fixtures/AcquisitionRoyaleFixture'
import { generateMerkleTree } from './utils'
import { MerkleProofVerifier } from '../typechain/MerkleProofVerifier'
import { MockERC20 } from '../typechain/MockERC20'
import { RunwayPoints } from '../typechain/RunwayPoints'
import { CompeteV1 } from '../typechain/CompeteV1'
import { AcquisitionRoyaleConsumables } from '../typechain/AcquisitionRoyaleConsumables'
import { MockAcquisitionRoyale } from '../typechain/MockAcquisitionRoyale'

describe('=> CompeteV1', () => {
  let merkleProofVerifier: MerkleProofVerifier
  let eligibleAddresses: string[]
  let merkleTree: MerkleTree
  let mockWeth: MockERC20
  let runwayPoints: RunwayPoints
  let acquisitionRoyale: MockAcquisitionRoyale
  let royaleConsumables: AcquisitionRoyaleConsumables
  let competeV1: CompeteV1
  let deployer: SignerWithAddress
  let user: SignerWithAddress
  let user2: SignerWithAddress
  let calculateDifficulty: (supply: number) => number
  let calculateDamage: (supply: number, rpToSpend: BigNumber) => BigNumber
  let calculateRp: (supply: number, damage: BigNumber) => BigNumber
  const TEST_RP_TO_SPEND = ethers.utils.parseEther('3.5')
  const DAMAGE_TO_DEAL = ethers.utils.parseEther('2.33')
  const tiers = [15000, 11250, 7500, 3750, 1500, 1125, 750, 375, 150, 112, 75, 37, 15]
  const AUCTION_SUPPLY = 9000
  const FREE_SUPPLY = 5000
  const RESERVED_SUPPLY = 1000
  const MAX_SUPPLY = AUCTION_SUPPLY + FREE_SUPPLY + RESERVED_SUPPLY

  before(() => {
    calculateDifficulty = (supply: number): number => {
      if (supply > 11250) {
        return 100 // 1x
      }
      if (supply > 7500) {
        return 150 // 1.5x
      }
      if (supply > 3750) {
        return 200 // 2x
      }
      if (supply > 1500) {
        return 300 // 3x
      }
      if (supply > 1125) {
        return 500 // 5x
      }
      if (supply > 750) {
        return 900 // 9x
      }
      if (supply > 375) {
        return 1700 // 17x
      }
      if (supply > 150) {
        return 3300 // 33x
      }
      if (supply > 112) {
        return 6500 // 65x
      }
      if (supply > 75) {
        return 12900 // 129x
      }
      if (supply > 37) {
        return 25700 // 257x
      }
      if (supply > 15) {
        return 51300 // 513x
      }
      return 102500 // 1025x
    }
    calculateDamage = (supply: number, rpToSpend: BigNumber): BigNumber =>
      rpToSpend.mul(100).div(calculateDifficulty(supply))
    calculateRp = (supply: number, damage: BigNumber): BigNumber =>
      damage.mul(calculateDifficulty(supply)).div(100)
  })

  beforeEach(async () => {
    ;[deployer, user, user2] = await ethers.getSigners()
    eligibleAddresses = [deployer.address, user.address]
    merkleTree = generateMerkleTree(eligibleAddresses)
    merkleProofVerifier = await merkleProofVerifierFixture(merkleTree.getHexRoot())
    mockWeth = await mockERC20Fixture('WETH9', 'WETH9')
    acquisitionRoyale = await mockAcquisitionRoyaleFixture()
    runwayPoints = await runwayPointsFixture(acquisitionRoyale.address)
    royaleConsumables = await acquisitionRoyaleConsumablesFixture(
      'Acquisition Royale Consumables',
      'ACQRC',
      'rename.json',
      'rebrand.json',
      'revive.json',
      acquisitionRoyale.address
    )
    await acquisitionRoyale.initialize(
      'Acquisition Royale',
      'ACQR',
      merkleProofVerifier.address,
      mockWeth.address,
      runwayPoints.address,
      royaleConsumables.address
    )
    competeV1 = await competeV1Fixture(acquisitionRoyale.address)
  })

  describe('# initialize', () => {
    it('should be initialized with correct values', async () => {
      expect(await competeV1.getAcquisitionRoyale()).to.eq(acquisitionRoyale.address)
      expect(await competeV1.getDifficultyDenominator()).to.eq(100)
    })
  })

  describe('# getDamage', () => {
    tiers.forEach((tierSupply) => {
      it(`should return the correct damage for remaining supply tier (after all have been minted) starting at ${tierSupply}`, async () => {
        await acquisitionRoyale.setAuctionCount(AUCTION_SUPPLY)
        await acquisitionRoyale.setFreeCount(FREE_SUPPLY)
        await acquisitionRoyale.setReservedCount(RESERVED_SUPPLY)
        await acquisitionRoyale.connect(deployer).setOverrideSupply(tierSupply)

        expect(await competeV1.getDamage(0, 0, TEST_RP_TO_SPEND)).to.eq(
          calculateDamage(tierSupply, TEST_RP_TO_SPEND)
        )
      })
    })

    tiers.forEach((tierSupply) => {
      // set current supply to the last tier and decrease the amount of unminted enterprises until total reaches zero to emulate going down the tier ladder.
      it(`should include unminted enterprises when calculating difficulty with current supply of 15 (last tier) and ${
        tierSupply - 15
      } unminted`, async () => {
        let minted
        await acquisitionRoyale.connect(deployer).setOverrideSupply(15)
        // need to mint enough to ensure tierSupply - 15 is unminted
        minted = MAX_SUPPLY - (tierSupply - 15)
        // first exhaust auction supply
        if (minted <= AUCTION_SUPPLY) {
          await acquisitionRoyale.setAuctionCount(minted)
        } else {
          await acquisitionRoyale.setAuctionCount(AUCTION_SUPPLY)
          minted -= AUCTION_SUPPLY
          // then exhaust reserved supply (free + reserved)
          if (minted <= FREE_SUPPLY) {
            await acquisitionRoyale.setFreeCount(minted)
          } else {
            await acquisitionRoyale.setFreeCount(FREE_SUPPLY)
            minted -= FREE_SUPPLY
            await acquisitionRoyale.setReservedCount(minted)
          }
        }

        expect(await competeV1.getDamage(0, 0, TEST_RP_TO_SPEND)).to.eq(
          calculateDamage(tierSupply, TEST_RP_TO_SPEND)
        )
      })
    })
  })

  describe('# getRpRequiredForDamage', () => {
    tiers.forEach((tierSupply) => {
      it(`should return the correct RP amount for a given damage for remaining supply tier (after all have been minted) starting at ${tierSupply}`, async () => {
        await acquisitionRoyale.setAuctionCount(AUCTION_SUPPLY)
        await acquisitionRoyale.setFreeCount(FREE_SUPPLY)
        await acquisitionRoyale.setReservedCount(RESERVED_SUPPLY)
        await acquisitionRoyale.connect(deployer).setOverrideSupply(tierSupply)

        expect(await competeV1.getRpRequiredForDamage(0, 0, DAMAGE_TO_DEAL)).to.eq(
          calculateRp(tierSupply, DAMAGE_TO_DEAL)
        )
      })
    })

    tiers.forEach((tierSupply) => {
      // set current supply to the last tier and decrease the amount of unminted enterprises until total reaches zero to emulate going down the tier ladder.
      it(`should include unminted enterprises when calculating difficulty with current supply of 15 (last tier) and ${
        tierSupply - 15
      } unminted`, async () => {
        let minted
        await acquisitionRoyale.connect(deployer).setOverrideSupply(15)
        // need to mint enough to ensure tierSupply - 15 is unminted
        minted = MAX_SUPPLY - (tierSupply - 15)
        // first exhaust auction supply
        if (minted <= AUCTION_SUPPLY) {
          await acquisitionRoyale.setAuctionCount(minted)
        } else {
          await acquisitionRoyale.setAuctionCount(AUCTION_SUPPLY)
          minted -= AUCTION_SUPPLY
          // then exhaust reserved supply (free + reserved)
          if (minted <= FREE_SUPPLY) {
            await acquisitionRoyale.setFreeCount(minted)
          } else {
            await acquisitionRoyale.setFreeCount(FREE_SUPPLY)
            minted -= FREE_SUPPLY
            await acquisitionRoyale.setReservedCount(minted)
          }
        }

        expect(await competeV1.getRpRequiredForDamage(0, 0, DAMAGE_TO_DEAL)).to.eq(
          calculateRp(tierSupply, DAMAGE_TO_DEAL)
        )
      })
    })
  })
})
