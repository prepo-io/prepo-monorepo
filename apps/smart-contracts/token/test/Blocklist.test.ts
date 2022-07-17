/* eslint-disable no-await-in-loop */
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { blocklistFixture } from './fixtures/BlocklistFixtures'
import { Blocklist } from '../types/generated'

describe('=> Blocklist', () => {
  let deployer: SignerWithAddress
  let owner: SignerWithAddress
  let blockedUser1: SignerWithAddress
  let blockedUser2: SignerWithAddress
  let unblockedUser1: SignerWithAddress
  let unblockedUser2: SignerWithAddress
  let blocklist: Blocklist
  let blockedUsersArray: string[]
  let unblockedUsersArray: string[]
  const blockedArray = [true, true]
  const unblockedArray = [false, false]

  const deployBlocklist = async (): Promise<void> => {
    ;[deployer, owner, blockedUser1, blockedUser2, unblockedUser1, unblockedUser2] =
      await ethers.getSigners()
    blocklist = await blocklistFixture(owner.address)
  }

  const setupBlocklist = async (): Promise<void> => {
    await deployBlocklist()
    blockedUsersArray = [blockedUser1.address, blockedUser2.address]
    unblockedUsersArray = [unblockedUser1.address, unblockedUser2.address]
    await blocklist.connect(owner).acceptOwnership()
  }

  describe('initial state', () => {
    beforeEach(async () => {
      await deployBlocklist()
    })

    it('sets nominee from initialize', async () => {
      expect(await blocklist.getNominee()).to.not.eq(deployer.address)
      expect(await blocklist.getNominee()).to.eq(owner.address)
    })

    it('sets owner to deployer', async () => {
      expect(await blocklist.owner()).to.eq(deployer.address)
    })

    it('sets blocked accounts index to zero', async () => {
      expect(await blocklist.getBlockedAllountsIndex()).to.eq(0)
    })
  })

  describe('# set', () => {
    beforeEach(async () => {
      await setupBlocklist()
    })

    it('reverts if not owner', async () => {
      expect(await blocklist.owner()).to.not.eq(blockedUser1.address)

      await expect(
        blocklist.connect(blockedUser1).set(blockedUsersArray, blockedArray)
      ).revertedWith('Ownable: caller is not the owner')
    })

    it('reverts if array length mismatch', async () => {
      expect([blockedUser1.address].length).to.not.be.eq(blockedArray.length)

      await expect(blocklist.connect(owner).set([blockedUser1.address], blockedArray)).revertedWith(
        'Array length mismatch'
      )
    })

    it('blocks single account', async () => {
      expect(await blocklist.isAccountBlocked(blockedUser1.address)).to.eq(false)

      await blocklist.connect(owner).set([blockedUser1.address], [true])

      expect(await blocklist.isAccountBlocked(blockedUser1.address)).to.eq(true)
    })

    it('blocks multiple accounts', async () => {
      for (let i = 0; i < blockedUsersArray.length; i++) {
        expect(await blocklist.isAccountBlocked(blockedUsersArray[i])).to.eq(false)
      }

      await blocklist.connect(owner).set(blockedUsersArray, blockedArray)

      for (let i = 0; i < blockedUsersArray.length; i++) {
        expect(await blocklist.isAccountBlocked(blockedUsersArray[i])).to.eq(true)
      }
    })

    it('unblocks single account', async () => {
      await blocklist.connect(owner).set([unblockedUser1.address], [true])
      expect(await blocklist.isAccountBlocked(unblockedUser1.address)).to.eq(true)

      await blocklist.connect(owner).set([unblockedUser1.address], [false])

      expect(await blocklist.isAccountBlocked(unblockedUser1.address)).to.eq(false)
    })

    it('unblocks multiple accounts', async () => {
      for (let i = 0; i < unblockedUsersArray.length; i++) {
        await blocklist.connect(owner).set([unblockedUsersArray[i]], [true])
        expect(await blocklist.isAccountBlocked(unblockedUsersArray[i])).to.eq(true)
      }

      await blocklist.connect(owner).set(unblockedUsersArray, unblockedArray)

      for (let i = 0; i < unblockedUsersArray.length; i++) {
        expect(await blocklist.isAccountBlocked(unblockedUsersArray[i])).to.eq(false)
      }
    })

    it('blocks and unblocks accounts', async () => {
      await blocklist.connect(owner).set([unblockedUser1.address], [true])
      expect(await blocklist.isAccountBlocked(unblockedUser1.address)).to.eq(true)
      expect(await blocklist.isAccountBlocked(blockedUser1.address)).to.eq(false)

      await blocklist
        .connect(owner)
        .set([blockedUser1.address, unblockedUser1.address], [true, false])

      expect(await blocklist.isAccountBlocked(unblockedUser1.address)).to.eq(false)
      expect(await blocklist.isAccountBlocked(blockedUser1.address)).to.eq(true)
    })

    it('is idempotent', async () => {
      for (let i = 0; i < blockedUsersArray.length; i++) {
        expect(await blocklist.isAccountBlocked(blockedUsersArray[i])).to.eq(false)
      }

      await blocklist.connect(owner).set(blockedUsersArray, blockedArray)

      for (let i = 0; i < blockedUsersArray.length; i++) {
        expect(await blocklist.isAccountBlocked(blockedUsersArray[i])).to.eq(true)
      }

      for (let i = 0; i < blockedUsersArray.length; i++) {
        expect(await blocklist.isAccountBlocked(blockedUsersArray[i])).to.eq(true)
      }

      await blocklist.connect(owner).set(blockedUsersArray, blockedArray)

      for (let i = 0; i < blockedUsersArray.length; i++) {
        expect(await blocklist.isAccountBlocked(blockedUsersArray[i])).to.eq(true)
      }
    })
  })
})
