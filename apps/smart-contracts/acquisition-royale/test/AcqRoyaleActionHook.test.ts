import chai, { expect } from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { BigNumber, Contract } from 'ethers'
import { FakeContract, smock } from '@defi-wonderland/smock'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { parseEther } from 'ethers/lib/utils'
import { acqRoyaleActionHookFixture } from './fixtures/AcqRoyaleActionHookFixture'
import { AddressZero, JunkAddress, revertReason } from './utils'
import { AcqRoyaleActionHook } from '../typechain/AcqRoyaleActionHook'

chai.use(solidity)

describe('=> AcqRoyaleActionHook', () => {
  let deployer: SignerWithAddress
  let owner: SignerWithAddress
  let user1: SignerWithAddress
  let user2: SignerWithAddress
  let acqRoyaleActionHook: AcqRoyaleActionHook
  let acquisitionRoyale: FakeContract<Contract>
  let enterpriseDetails: { [key: string]: string | number | BigNumber } = {}
  const MIN_ENTERPRISE_COUNT = 1
  const MIN_MERGE_COUNT = 1
  const MIN_ACQUIRE_COUNT = 1
  const MIN_COMPETE_COUNT = 1
  const MIN_REVIVE_COUNT = 1
  const ENTERPRISE_ID = 1

  const setupAcqRoyaleActionHook = async (): Promise<void> => {
    ;[deployer, user1, user2] = await ethers.getSigners()
    owner = deployer
    acqRoyaleActionHook = await acqRoyaleActionHookFixture()
  }

  describe('# setMinEnterpriseCount', () => {
    beforeEach(async () => {
      await setupAcqRoyaleActionHook()
    })

    it('reverts if not owner', async () => {
      expect(await acqRoyaleActionHook.owner()).to.not.eq(user1.address)

      expect(
        acqRoyaleActionHook.connect(user1).setMinEnterpriseCount(MIN_ENTERPRISE_COUNT)
      ).revertedWith(revertReason('Ownable: caller is not the owner'))
    })

    it('sets to non-zero value', async () => {
      expect(await acqRoyaleActionHook.getMinEnterpriseCount()).to.not.eq(MIN_ENTERPRISE_COUNT)
      expect(MIN_ENTERPRISE_COUNT).to.not.eq(0)

      await acqRoyaleActionHook.connect(owner).setMinEnterpriseCount(MIN_ENTERPRISE_COUNT)

      expect(await acqRoyaleActionHook.getMinEnterpriseCount()).to.eq(MIN_ENTERPRISE_COUNT)
    })

    it('sets to 0', async () => {
      await acqRoyaleActionHook.connect(owner).setMinEnterpriseCount(MIN_ENTERPRISE_COUNT)
      expect(await acqRoyaleActionHook.getMinEnterpriseCount()).to.not.eq(0)

      await acqRoyaleActionHook.connect(owner).setMinEnterpriseCount(0)

      expect(await acqRoyaleActionHook.getMinEnterpriseCount()).to.eq(0)
    })

    it('is idempotent', async () => {
      expect(await acqRoyaleActionHook.getMinEnterpriseCount()).to.not.eq(MIN_ENTERPRISE_COUNT)

      await acqRoyaleActionHook.connect(owner).setMinEnterpriseCount(MIN_ENTERPRISE_COUNT)

      expect(await acqRoyaleActionHook.getMinEnterpriseCount()).to.eq(MIN_ENTERPRISE_COUNT)

      await acqRoyaleActionHook.connect(owner).setMinEnterpriseCount(MIN_ENTERPRISE_COUNT)

      expect(await acqRoyaleActionHook.getMinEnterpriseCount()).to.eq(MIN_ENTERPRISE_COUNT)
    })
  })

  describe('# setMinMergeCount', () => {
    beforeEach(async () => {
      await setupAcqRoyaleActionHook()
    })

    it('reverts if not owner', async () => {
      expect(await acqRoyaleActionHook.owner()).to.not.eq(user1.address)

      expect(acqRoyaleActionHook.connect(user1).setMinMergeCount(MIN_MERGE_COUNT)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('sets to non-zero value', async () => {
      expect(await acqRoyaleActionHook.getMinMergeCount()).to.not.eq(MIN_MERGE_COUNT)
      expect(MIN_MERGE_COUNT).to.not.eq(0)

      await acqRoyaleActionHook.connect(owner).setMinMergeCount(MIN_MERGE_COUNT)

      expect(await acqRoyaleActionHook.getMinMergeCount()).to.eq(MIN_MERGE_COUNT)
    })

    it('sets to 0', async () => {
      await acqRoyaleActionHook.connect(owner).setMinMergeCount(MIN_MERGE_COUNT)
      expect(await acqRoyaleActionHook.getMinMergeCount()).to.not.eq(0)

      await acqRoyaleActionHook.connect(owner).setMinMergeCount(0)

      expect(await acqRoyaleActionHook.getMinMergeCount()).to.eq(0)
    })

    it('is idempotent', async () => {
      expect(await acqRoyaleActionHook.getMinMergeCount()).to.not.eq(MIN_MERGE_COUNT)

      await acqRoyaleActionHook.connect(owner).setMinMergeCount(MIN_MERGE_COUNT)

      expect(await acqRoyaleActionHook.getMinMergeCount()).to.eq(MIN_MERGE_COUNT)

      await acqRoyaleActionHook.connect(owner).setMinMergeCount(MIN_MERGE_COUNT)

      expect(await acqRoyaleActionHook.getMinMergeCount()).to.eq(MIN_MERGE_COUNT)
    })
  })

  describe('# setMinAcquireCount', () => {
    beforeEach(async () => {
      await setupAcqRoyaleActionHook()
    })

    it('reverts if not owner', async () => {
      expect(await acqRoyaleActionHook.owner()).to.not.eq(user1.address)

      expect(acqRoyaleActionHook.connect(user1).setMinAcquireCount(MIN_ACQUIRE_COUNT)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('sets to non-zero value', async () => {
      expect(await acqRoyaleActionHook.getMinAcquireCount()).to.not.eq(MIN_ACQUIRE_COUNT)
      expect(MIN_ACQUIRE_COUNT).to.not.eq(0)

      await acqRoyaleActionHook.connect(owner).setMinAcquireCount(MIN_ACQUIRE_COUNT)

      expect(await acqRoyaleActionHook.getMinAcquireCount()).to.eq(MIN_ACQUIRE_COUNT)
    })

    it('sets to 0', async () => {
      await acqRoyaleActionHook.connect(owner).setMinAcquireCount(MIN_ACQUIRE_COUNT)
      expect(await acqRoyaleActionHook.getMinAcquireCount()).to.not.eq(0)

      await acqRoyaleActionHook.connect(owner).setMinAcquireCount(0)

      expect(await acqRoyaleActionHook.getMinAcquireCount()).to.eq(0)
    })

    it('is idempotent', async () => {
      expect(await acqRoyaleActionHook.getMinAcquireCount()).to.not.eq(MIN_ACQUIRE_COUNT)

      await acqRoyaleActionHook.connect(owner).setMinAcquireCount(MIN_ACQUIRE_COUNT)

      expect(await acqRoyaleActionHook.getMinAcquireCount()).to.eq(MIN_ACQUIRE_COUNT)

      await acqRoyaleActionHook.connect(owner).setMinAcquireCount(MIN_ACQUIRE_COUNT)

      expect(await acqRoyaleActionHook.getMinAcquireCount()).to.eq(MIN_ACQUIRE_COUNT)
    })
  })

  describe('# setMinCompeteCount', () => {
    beforeEach(async () => {
      await setupAcqRoyaleActionHook()
    })

    it('reverts if not owner', async () => {
      expect(await acqRoyaleActionHook.owner()).to.not.eq(user1.address)

      expect(acqRoyaleActionHook.connect(user1).setMinCompeteCount(MIN_COMPETE_COUNT)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('sets to non-zero value', async () => {
      expect(await acqRoyaleActionHook.getMinCompeteCount()).to.not.eq(MIN_COMPETE_COUNT)
      expect(MIN_COMPETE_COUNT).to.not.eq(0)

      await acqRoyaleActionHook.connect(owner).setMinCompeteCount(MIN_COMPETE_COUNT)

      expect(await acqRoyaleActionHook.getMinCompeteCount()).to.eq(MIN_COMPETE_COUNT)
    })

    it('sets to 0', async () => {
      await acqRoyaleActionHook.connect(owner).setMinCompeteCount(MIN_COMPETE_COUNT)
      expect(await acqRoyaleActionHook.getMinCompeteCount()).to.not.eq(0)

      await acqRoyaleActionHook.connect(owner).setMinCompeteCount(0)

      expect(await acqRoyaleActionHook.getMinCompeteCount()).to.eq(0)
    })

    it('is idempotent', async () => {
      expect(await acqRoyaleActionHook.getMinCompeteCount()).to.not.eq(MIN_COMPETE_COUNT)

      await acqRoyaleActionHook.connect(owner).setMinCompeteCount(MIN_COMPETE_COUNT)

      expect(await acqRoyaleActionHook.getMinCompeteCount()).to.eq(MIN_COMPETE_COUNT)

      await acqRoyaleActionHook.connect(owner).setMinCompeteCount(MIN_COMPETE_COUNT)

      expect(await acqRoyaleActionHook.getMinCompeteCount()).to.eq(MIN_COMPETE_COUNT)
    })
  })

  describe('# setMinReviveCount', () => {
    beforeEach(async () => {
      await setupAcqRoyaleActionHook()
    })

    it('reverts if not owner', async () => {
      expect(await acqRoyaleActionHook.owner()).to.not.eq(user1.address)

      expect(acqRoyaleActionHook.connect(user1).setMinReviveCount(MIN_REVIVE_COUNT)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('sets to non-zero value', async () => {
      expect(await acqRoyaleActionHook.getMinReviveCount()).to.not.eq(MIN_REVIVE_COUNT)
      expect(MIN_REVIVE_COUNT).to.not.eq(0)

      await acqRoyaleActionHook.connect(owner).setMinReviveCount(MIN_REVIVE_COUNT)

      expect(await acqRoyaleActionHook.getMinReviveCount()).to.eq(MIN_REVIVE_COUNT)
    })

    it('sets to 0', async () => {
      await acqRoyaleActionHook.connect(owner).setMinReviveCount(MIN_REVIVE_COUNT)
      expect(await acqRoyaleActionHook.getMinReviveCount()).to.not.eq(0)

      await acqRoyaleActionHook.connect(owner).setMinReviveCount(0)

      expect(await acqRoyaleActionHook.getMinReviveCount()).to.eq(0)
    })

    it('is idempotent', async () => {
      expect(await acqRoyaleActionHook.getMinReviveCount()).to.not.eq(MIN_REVIVE_COUNT)

      await acqRoyaleActionHook.connect(owner).setMinReviveCount(MIN_REVIVE_COUNT)

      expect(await acqRoyaleActionHook.getMinReviveCount()).to.eq(MIN_REVIVE_COUNT)

      await acqRoyaleActionHook.connect(owner).setMinReviveCount(MIN_REVIVE_COUNT)

      expect(await acqRoyaleActionHook.getMinReviveCount()).to.eq(MIN_REVIVE_COUNT)
    })
  })

  describe('# setMustBeRenamed', () => {
    beforeEach(async () => {
      await setupAcqRoyaleActionHook()
    })

    it('reverts if not owner', async () => {
      expect(await acqRoyaleActionHook.owner()).to.not.eq(user1.address)

      expect(acqRoyaleActionHook.connect(user1).setMustBeRenamed(true)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('sets to true', async () => {
      expect(await acqRoyaleActionHook.getMustBeRenamed()).to.not.eq(true)

      await acqRoyaleActionHook.connect(owner).setMustBeRenamed(true)

      expect(await acqRoyaleActionHook.getMustBeRenamed()).to.eq(true)
    })

    it('sets to false', async () => {
      await acqRoyaleActionHook.connect(owner).setMustBeRenamed(true)
      expect(await acqRoyaleActionHook.getMustBeRenamed()).to.not.eq(false)

      await acqRoyaleActionHook.connect(owner).setMustBeRenamed(false)

      expect(await acqRoyaleActionHook.getMustBeRenamed()).to.eq(false)
    })

    it('is idempotent', async () => {
      expect(await acqRoyaleActionHook.getMustBeRenamed()).to.not.eq(true)

      await acqRoyaleActionHook.connect(owner).setMustBeRenamed(true)

      expect(await acqRoyaleActionHook.getMustBeRenamed()).to.eq(true)

      await acqRoyaleActionHook.connect(owner).setMustBeRenamed(true)

      expect(await acqRoyaleActionHook.getMustBeRenamed()).to.eq(true)
    })
  })

  describe('# setMustBeRebranded', () => {
    beforeEach(async () => {
      await setupAcqRoyaleActionHook()
    })

    it('reverts if not owner', async () => {
      expect(await acqRoyaleActionHook.owner()).to.not.eq(user1.address)

      expect(acqRoyaleActionHook.connect(user1).setMustBeRebranded(true)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('sets to true', async () => {
      expect(await acqRoyaleActionHook.getMustBeRebranded()).to.not.eq(true)

      await acqRoyaleActionHook.connect(owner).setMustBeRebranded(true)

      expect(await acqRoyaleActionHook.getMustBeRebranded()).to.eq(true)
    })

    it('sets to false', async () => {
      await acqRoyaleActionHook.connect(owner).setMustBeRebranded(true)
      expect(await acqRoyaleActionHook.getMustBeRebranded()).to.not.eq(false)

      await acqRoyaleActionHook.connect(owner).setMustBeRebranded(false)

      expect(await acqRoyaleActionHook.getMustBeRebranded()).to.eq(false)
    })

    it('is idempotent', async () => {
      expect(await acqRoyaleActionHook.getMustBeRebranded()).to.not.eq(true)

      await acqRoyaleActionHook.connect(owner).setMustBeRebranded(true)

      expect(await acqRoyaleActionHook.getMustBeRebranded()).to.eq(true)

      await acqRoyaleActionHook.connect(owner).setMustBeRebranded(true)

      expect(await acqRoyaleActionHook.getMustBeRebranded()).to.eq(true)
    })
  })

  describe('# setAcqRoyale', () => {
    beforeEach(async () => {
      await setupAcqRoyaleActionHook()
    })

    it('reverts if not owner', async () => {
      expect(await acqRoyaleActionHook.owner()).to.not.eq(user1.address)

      expect(acqRoyaleActionHook.connect(user1).setAcqRoyale(JunkAddress)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('sets to non-zero address', async () => {
      expect(await acqRoyaleActionHook.getAcqRoyale()).to.eq(AddressZero)
      expect(JunkAddress).to.not.eq(AddressZero)

      await acqRoyaleActionHook.connect(owner).setAcqRoyale(JunkAddress)

      expect(await acqRoyaleActionHook.getAcqRoyale()).to.eq(JunkAddress)
    })

    it('sets to zero address', async () => {
      await acqRoyaleActionHook.connect(owner).setAcqRoyale(JunkAddress)
      expect(await acqRoyaleActionHook.getAcqRoyale()).to.not.eq(AddressZero)

      await acqRoyaleActionHook.connect(owner).setAcqRoyale(AddressZero)

      expect(await acqRoyaleActionHook.getAcqRoyale()).to.eq(AddressZero)
    })

    it('is idempotent', async () => {
      expect(await acqRoyaleActionHook.getAcqRoyale()).to.not.eq(JunkAddress)

      await acqRoyaleActionHook.connect(owner).setAcqRoyale(JunkAddress)

      expect(await acqRoyaleActionHook.getAcqRoyale()).to.eq(JunkAddress)

      await acqRoyaleActionHook.connect(owner).setAcqRoyale(JunkAddress)

      expect(await acqRoyaleActionHook.getAcqRoyale()).to.eq(JunkAddress)
    })
  })

  describe('# hook', () => {
    beforeEach(async () => {
      await setupAcqRoyaleActionHook()
      enterpriseDetails = {
        name: 'SMALL',
        rp: parseEther('10'),
        lastRpUpdateTime: 0,
        acquisitionImmunityStartTime: 0,
        mergerImmunityStartTime: 0,
        revivalImmunityStartTime: 0,
        competes: parseEther('10'),
        acquisitions: 10,
        mergers: 10,
        branding: JunkAddress,
        fundraiseRpTotal: 0,
        fundraiseWethTotal: 0,
        damageDealt: 0,
        damageTaken: 0,
        renames: 2,
        rebrands: 2,
        revives: 10,
      }
      acquisitionRoyale = await smock.fake('IAcquisitionRoyale')
      await acqRoyaleActionHook.connect(owner).setAcqRoyale(acquisitionRoyale.address)
      await acqRoyaleActionHook.connect(owner).setMinEnterpriseCount(MIN_ENTERPRISE_COUNT)
      await acqRoyaleActionHook.connect(owner).setMinMergeCount(MIN_MERGE_COUNT)
      await acqRoyaleActionHook.connect(owner).setMinAcquireCount(MIN_ACQUIRE_COUNT)
      await acqRoyaleActionHook.connect(owner).setMinCompeteCount(MIN_COMPETE_COUNT)
      await acqRoyaleActionHook.connect(owner).setMinReviveCount(MIN_REVIVE_COUNT)
      await acqRoyaleActionHook.connect(owner).setMustBeRebranded(true)
      await acqRoyaleActionHook.connect(owner).setMustBeRenamed(true)
      acquisitionRoyale.balanceOf
        .whenCalledWith(user1.address)
        .returns(await acqRoyaleActionHook.getMinEnterpriseCount())
      acquisitionRoyale.ownerOf.whenCalledWith(ENTERPRISE_ID).returns(user1.address)
      acquisitionRoyale.tokenOfOwnerByIndex.whenCalledWith(user1.address, 0).returns(ENTERPRISE_ID)
      acquisitionRoyale.getEnterprise.whenCalledWith(ENTERPRISE_ID).returns(enterpriseDetails)
    })

    it('reverts if user enterprise count < minEnterpriseCount', async () => {
      acquisitionRoyale.balanceOf
        .whenCalledWith(user2.address)
        .returns((await acqRoyaleActionHook.getMinEnterpriseCount()).sub(1))

      await expect(acqRoyaleActionHook.hook(user2.address)).revertedWith(
        revertReason('Enterprise count insufficient')
      )
    })

    it("reverts if all of user's enterprise merge count < minMergeCount", async () => {
      expect(await acquisitionRoyale.ownerOf(ENTERPRISE_ID)).to.eq(user1.address)
      await expect(acqRoyaleActionHook.hook(user1.address)).to.not.be.reverted
      await acqRoyaleActionHook.setMinMergeCount(
        (await acquisitionRoyale.getEnterprise(ENTERPRISE_ID)).mergers.add(1)
      )
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE_ID)).mergers).to.be.lt(
        await acqRoyaleActionHook.getMinMergeCount()
      )

      await expect(acqRoyaleActionHook.hook(user1.address)).revertedWith(
        revertReason('User not eligible')
      )
    })

    it("reverts if all of user's enterprise acquire count < minAcquireCount", async () => {
      expect(await acquisitionRoyale.ownerOf(ENTERPRISE_ID)).to.eq(user1.address)
      await expect(acqRoyaleActionHook.hook(user1.address)).to.not.be.reverted
      await acqRoyaleActionHook.setMinAcquireCount(
        (await acquisitionRoyale.getEnterprise(ENTERPRISE_ID)).acquisitions.add(1)
      )
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE_ID)).acquisitions).to.be.lt(
        await acqRoyaleActionHook.getMinAcquireCount()
      )

      await expect(acqRoyaleActionHook.hook(user1.address)).revertedWith(
        revertReason('User not eligible')
      )
    })

    it("reverts if all of user's enterprise compete count < minCompeteCount", async () => {
      expect(await acquisitionRoyale.ownerOf(ENTERPRISE_ID)).to.eq(user1.address)
      await expect(acqRoyaleActionHook.hook(user1.address)).to.not.be.reverted
      await acqRoyaleActionHook.setMinCompeteCount(
        (await acquisitionRoyale.getEnterprise(ENTERPRISE_ID)).competes.add(1)
      )
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE_ID)).competes).to.be.lt(
        await acqRoyaleActionHook.getMinCompeteCount()
      )

      await expect(acqRoyaleActionHook.hook(user1.address)).revertedWith(
        revertReason('User not eligible')
      )
    })

    it("reverts if all of user's enterprise revive count < minReviveCount", async () => {
      expect(await acquisitionRoyale.ownerOf(ENTERPRISE_ID)).to.eq(user1.address)
      await expect(acqRoyaleActionHook.hook(user1.address)).to.not.be.reverted
      await acqRoyaleActionHook.setMinReviveCount(
        (await acquisitionRoyale.getEnterprise(ENTERPRISE_ID)).revives.add(1)
      )
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE_ID)).revives).to.be.lt(
        await acqRoyaleActionHook.getMinReviveCount()
      )

      await expect(acqRoyaleActionHook.hook(user1.address)).revertedWith(
        revertReason('User not eligible')
      )
    })

    it('reverts if mustBeRebranded = true and user has no rebranded enterprises', async () => {
      expect(await acquisitionRoyale.ownerOf(ENTERPRISE_ID)).to.eq(user1.address)
      await expect(acqRoyaleActionHook.hook(user1.address)).to.not.be.reverted
      await acqRoyaleActionHook.setMustBeRebranded(true)
      enterpriseDetails.rebrands = 0
      acquisitionRoyale.getEnterprise.whenCalledWith(ENTERPRISE_ID).returns(enterpriseDetails)
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE_ID)).rebrands).to.eq(0)

      await expect(acqRoyaleActionHook.hook(user1.address)).revertedWith(
        revertReason('User not eligible')
      )
    })

    it('reverts if mustBeRenamed = true and user has no renamed enterprises', async () => {
      expect(await acquisitionRoyale.ownerOf(ENTERPRISE_ID)).to.eq(user1.address)
      await expect(acqRoyaleActionHook.hook(user1.address)).to.not.be.reverted
      await acqRoyaleActionHook.setMustBeRenamed(true)
      enterpriseDetails.renames = 0
      acquisitionRoyale.getEnterprise.whenCalledWith(ENTERPRISE_ID).returns(enterpriseDetails)
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE_ID)).renames).to.eq(0)

      await expect(acqRoyaleActionHook.hook(user1.address)).revertedWith(
        revertReason('User not eligible')
      )
    })

    it("succeeds if one of user's enterprise exceeds all criteria", async () => {
      expect(await acquisitionRoyale.balanceOf(user1.address)).to.be.eq(
        await acqRoyaleActionHook.getMinEnterpriseCount()
      )
      expect(await acquisitionRoyale.ownerOf(ENTERPRISE_ID)).to.eq(user1.address)
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE_ID)).mergers).to.be.gt(
        await acqRoyaleActionHook.getMinMergeCount()
      )
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE_ID)).acquisitions).to.be.gt(
        await acqRoyaleActionHook.getMinAcquireCount()
      )
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE_ID)).competes).to.be.gt(
        await acqRoyaleActionHook.getMinCompeteCount()
      )
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE_ID)).revives).to.be.gt(
        await acqRoyaleActionHook.getMinReviveCount()
      )
      await acqRoyaleActionHook.setMustBeRenamed(true)
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE_ID)).renames).to.be.gt(1)
      await acqRoyaleActionHook.setMustBeRebranded(true)
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE_ID)).rebrands).to.be.gt(1)

      await expect(acqRoyaleActionHook.hook(user1.address)).to.not.reverted
    })

    it("succeeds if one of user's enterprise exactly matches all criteria", async () => {
      enterpriseDetails.mergers = MIN_MERGE_COUNT
      enterpriseDetails.acquisitions = MIN_ACQUIRE_COUNT
      enterpriseDetails.competes = MIN_COMPETE_COUNT
      enterpriseDetails.revives = MIN_REVIVE_COUNT
      enterpriseDetails.rebrands = 1
      enterpriseDetails.renames = 1
      acquisitionRoyale.getEnterprise.whenCalledWith(ENTERPRISE_ID).returns(enterpriseDetails)
      expect(await acquisitionRoyale.balanceOf(user1.address)).to.be.eq(
        await acqRoyaleActionHook.getMinEnterpriseCount()
      )
      expect(await acquisitionRoyale.ownerOf(ENTERPRISE_ID)).to.eq(user1.address)
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE_ID)).mergers).to.be.eq(
        await acqRoyaleActionHook.getMinMergeCount()
      )
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE_ID)).acquisitions).to.be.eq(
        await acqRoyaleActionHook.getMinAcquireCount()
      )
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE_ID)).competes).to.be.eq(
        await acqRoyaleActionHook.getMinCompeteCount()
      )
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE_ID)).revives).to.be.eq(
        await acqRoyaleActionHook.getMinReviveCount()
      )
      await acqRoyaleActionHook.setMustBeRenamed(true)
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE_ID)).renames).to.be.eq(1)
      await acqRoyaleActionHook.setMustBeRebranded(true)
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE_ID)).rebrands).to.be.eq(1)

      await expect(acqRoyaleActionHook.hook(user1.address)).to.not.reverted
    })

    it("succeeds if user's first enterprise matches all criteria but rest doesn't", async () => {
      const ENTERPRISE1 = ENTERPRISE_ID
      const ENTERPRISE2 = ENTERPRISE1 + 1
      const ENTERPRISE3 = ENTERPRISE2 + 1
      acquisitionRoyale.balanceOf.whenCalledWith(user1.address).returns(ENTERPRISE3)
      acquisitionRoyale.ownerOf.whenCalledWith(ENTERPRISE1).returns(user1.address)
      acquisitionRoyale.ownerOf.whenCalledWith(ENTERPRISE2).returns(user1.address)
      acquisitionRoyale.ownerOf.whenCalledWith(ENTERPRISE3).returns(user1.address)
      acquisitionRoyale.tokenOfOwnerByIndex.whenCalledWith(user1.address, 0).returns(ENTERPRISE1)
      acquisitionRoyale.tokenOfOwnerByIndex.whenCalledWith(user1.address, 1).returns(ENTERPRISE2)
      acquisitionRoyale.tokenOfOwnerByIndex.whenCalledWith(user1.address, 2).returns(ENTERPRISE3)
      acquisitionRoyale.getEnterprise.whenCalledWith(ENTERPRISE1).returns(enterpriseDetails)
      const enterpriseDetails2 = Object.create(enterpriseDetails)
      enterpriseDetails2.mergers = MIN_MERGE_COUNT - 1
      acquisitionRoyale.getEnterprise.whenCalledWith(ENTERPRISE2).returns(enterpriseDetails2)
      acquisitionRoyale.getEnterprise.whenCalledWith(ENTERPRISE3).returns(enterpriseDetails2)
      expect(await acquisitionRoyale.balanceOf(user1.address)).to.be.gt(
        await acqRoyaleActionHook.getMinEnterpriseCount()
      )
      expect(await acquisitionRoyale.ownerOf(ENTERPRISE1)).to.eq(user1.address)
      expect(await acquisitionRoyale.ownerOf(ENTERPRISE2)).to.eq(user1.address)
      expect(await acquisitionRoyale.ownerOf(ENTERPRISE3)).to.eq(user1.address)
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE1)).mergers).to.be.gt(
        await acqRoyaleActionHook.getMinMergeCount()
      )
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE1)).acquisitions).to.be.gt(
        await acqRoyaleActionHook.getMinAcquireCount()
      )
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE1)).competes).to.be.gt(
        await acqRoyaleActionHook.getMinCompeteCount()
      )
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE1)).revives).to.be.gt(
        await acqRoyaleActionHook.getMinReviveCount()
      )
      await acqRoyaleActionHook.setMustBeRenamed(true)
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE1)).renames).to.be.gt(1)
      await acqRoyaleActionHook.setMustBeRebranded(true)
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE1)).rebrands).to.be.gt(1)
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE2)).mergers).to.be.lt(
        await acqRoyaleActionHook.getMinMergeCount()
      )
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE3)).mergers).to.be.lt(
        await acqRoyaleActionHook.getMinMergeCount()
      )

      await expect(acqRoyaleActionHook.hook(user1.address)).to.not.reverted
    })
    it("succeeds if user's last enterprise matches all criteria but rest doesn't", async () => {
      const ENTERPRISE1 = ENTERPRISE_ID
      const ENTERPRISE2 = ENTERPRISE1 + 1
      const ENTERPRISE3 = ENTERPRISE2 + 1
      acquisitionRoyale.balanceOf.whenCalledWith(user1.address).returns(ENTERPRISE3)
      acquisitionRoyale.ownerOf.whenCalledWith(ENTERPRISE1).returns(user1.address)
      acquisitionRoyale.ownerOf.whenCalledWith(ENTERPRISE2).returns(user1.address)
      acquisitionRoyale.ownerOf.whenCalledWith(ENTERPRISE3).returns(user1.address)
      acquisitionRoyale.tokenOfOwnerByIndex.whenCalledWith(user1.address, 0).returns(ENTERPRISE1)
      acquisitionRoyale.tokenOfOwnerByIndex.whenCalledWith(user1.address, 1).returns(ENTERPRISE2)
      acquisitionRoyale.tokenOfOwnerByIndex.whenCalledWith(user1.address, 2).returns(ENTERPRISE3)
      acquisitionRoyale.getEnterprise.whenCalledWith(ENTERPRISE3).returns(enterpriseDetails)
      const enterpriseDetails2 = Object.create(enterpriseDetails)
      enterpriseDetails2.mergers = MIN_MERGE_COUNT - 1
      acquisitionRoyale.getEnterprise.whenCalledWith(ENTERPRISE1).returns(enterpriseDetails2)
      acquisitionRoyale.getEnterprise.whenCalledWith(ENTERPRISE2).returns(enterpriseDetails2)
      expect(await acquisitionRoyale.balanceOf(user1.address)).to.be.gt(
        await acqRoyaleActionHook.getMinEnterpriseCount()
      )
      expect(await acquisitionRoyale.ownerOf(ENTERPRISE1)).to.eq(user1.address)
      expect(await acquisitionRoyale.ownerOf(ENTERPRISE2)).to.eq(user1.address)
      expect(await acquisitionRoyale.ownerOf(ENTERPRISE3)).to.eq(user1.address)
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE3)).mergers).to.be.gt(
        await acqRoyaleActionHook.getMinMergeCount()
      )
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE3)).acquisitions).to.be.gt(
        await acqRoyaleActionHook.getMinAcquireCount()
      )
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE3)).competes).to.be.gt(
        await acqRoyaleActionHook.getMinCompeteCount()
      )
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE3)).revives).to.be.gt(
        await acqRoyaleActionHook.getMinReviveCount()
      )
      await acqRoyaleActionHook.setMustBeRenamed(true)
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE3)).renames).to.be.gt(1)
      await acqRoyaleActionHook.setMustBeRebranded(true)
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE3)).rebrands).to.be.gt(1)
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE1)).mergers).to.be.lt(
        await acqRoyaleActionHook.getMinMergeCount()
      )
      expect((await acquisitionRoyale.getEnterprise(ENTERPRISE2)).mergers).to.be.lt(
        await acqRoyaleActionHook.getMinMergeCount()
      )

      await expect(acqRoyaleActionHook.hook(user1.address)).to.not.reverted
    })
  })
})
