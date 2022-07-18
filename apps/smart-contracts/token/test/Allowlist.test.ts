/* eslint-disable no-await-in-loop */
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { allowlistFixture } from './fixtures/AllowlistFixtures'
import { Allowlist } from '../types/generated'

describe('=> Allowlist', () => {
  let deployer: SignerWithAddress
  let owner: SignerWithAddress
  let allowedUser1: SignerWithAddress
  let allowedUser2: SignerWithAddress
  let disallowedUser1: SignerWithAddress
  let disallowedUser2: SignerWithAddress
  let newAllowedUser1: SignerWithAddress
  let newAllowedUser2: SignerWithAddress
  let allowlist: Allowlist
  let allowedUsersArray: string[]
  let disallowedUsersArray: string[]
  let newAllowedUsersArray: string[]
  const allowedArray = [true, true]
  const disallowedArray = [false, false]

  const deployAllowlist = async (): Promise<void> => {
    ;[
      deployer,
      owner,
      allowedUser1,
      allowedUser2,
      disallowedUser1,
      disallowedUser2,
      newAllowedUser1,
      newAllowedUser2,
    ] = await ethers.getSigners()
    allowlist = await allowlistFixture(owner.address)
  }

  const setupAllowlist = async (): Promise<void> => {
    await deployAllowlist()
    allowedUsersArray = [allowedUser1.address, allowedUser2.address]
    disallowedUsersArray = [disallowedUser1.address, disallowedUser2.address]
    newAllowedUsersArray = [newAllowedUser1.address, newAllowedUser2.address]
    await allowlist.connect(owner).acceptOwnership()
  }

  describe('initial state', () => {
    beforeEach(async () => {
      await deployAllowlist()
    })

    it('setDestinationss nominee from initialize', async () => {
      expect(await allowlist.getNominee()).to.not.eq(deployer.address)
      expect(await allowlist.getNominee()).to.eq(owner.address)
    })

    it('setDestinationss owner to deployer', async () => {
      expect(await allowlist.owner()).to.eq(deployer.address)
    })
  })

  describe('# setDestinations', () => {
    beforeEach(async () => {
      await setupAllowlist()
    })

    it('reverts if not owner', async () => {
      expect(await allowlist.owner()).to.not.eq(allowedUser1.address)

      await expect(
        allowlist.connect(allowedUser1).setDestinations(allowedUsersArray, allowedArray)
      ).revertedWith('Ownable: caller is not the owner')
    })

    it('reverts if array length mismatch', async () => {
      expect([allowedUser1.address].length).to.not.be.eq(allowedArray.length)

      await expect(
        allowlist.connect(owner).setDestinations([allowedUser1.address], allowedArray)
      ).revertedWith('Array length mismatch')
    })

    it('allows single account', async () => {
      expect(await allowlist.isDestinationAllowed(allowedUser1.address)).to.eq(false)

      await allowlist.connect(owner).setDestinations([allowedUser1.address], [true])

      expect(await allowlist.isDestinationAllowed(allowedUser1.address)).to.eq(true)
    })

    it('allows multiple accounts', async () => {
      for (let i = 0; i < allowedUsersArray.length; i++) {
        expect(await allowlist.isDestinationAllowed(allowedUsersArray[i])).to.eq(false)
      }

      await allowlist.connect(owner).setDestinations(allowedUsersArray, allowedArray)

      for (let i = 0; i < allowedUsersArray.length; i++) {
        expect(await allowlist.isDestinationAllowed(allowedUsersArray[i])).to.eq(true)
      }
    })

    it('disallows single account', async () => {
      await allowlist.connect(owner).setDestinations([disallowedUser1.address], [true])
      expect(await allowlist.isDestinationAllowed(disallowedUser1.address)).to.eq(true)

      await allowlist.connect(owner).setDestinations([disallowedUser1.address], [false])

      expect(await allowlist.isDestinationAllowed(disallowedUser1.address)).to.eq(false)
    })

    it('disallows multiple accounts', async () => {
      for (let i = 0; i < disallowedUsersArray.length; i++) {
        await allowlist.connect(owner).setDestinations([disallowedUsersArray[i]], [true])
        expect(await allowlist.isDestinationAllowed(disallowedUsersArray[i])).to.eq(true)
      }

      await allowlist.connect(owner).setDestinations(disallowedUsersArray, disallowedArray)

      for (let i = 0; i < disallowedUsersArray.length; i++) {
        expect(await allowlist.isDestinationAllowed(disallowedUsersArray[i])).to.eq(false)
      }
    })

    it('allows and disallows accounts', async () => {
      await allowlist.connect(owner).setDestinations([disallowedUser1.address], [true])
      expect(await allowlist.isDestinationAllowed(disallowedUser1.address)).to.eq(true)
      expect(await allowlist.isDestinationAllowed(allowedUser1.address)).to.eq(false)

      await allowlist
        .connect(owner)
        .setDestinations([disallowedUser1.address, allowedUser1.address], [false, true])

      expect(await allowlist.isDestinationAllowed(disallowedUser1.address)).to.eq(false)
      expect(await allowlist.isDestinationAllowed(allowedUser1.address)).to.eq(true)
    })

    it('setDestinationss lattermost bool value if account passed multiple times', async () => {
      expect(await allowlist.isDestinationAllowed(allowedUser1.address)).to.eq(false)

      await allowlist
        .connect(owner)
        .setDestinations([allowedUser1.address, allowedUser1.address], [true, false])

      expect(await allowlist.isDestinationAllowed(allowedUser1.address)).to.eq(false)
    })

    it('is idempotent', async () => {
      for (let i = 0; i < allowedUsersArray.length; i++) {
        expect(await allowlist.isDestinationAllowed(allowedUsersArray[i])).to.eq(false)
      }

      await allowlist.connect(owner).setDestinations(allowedUsersArray, allowedArray)

      for (let i = 0; i < allowedUsersArray.length; i++) {
        expect(await allowlist.isDestinationAllowed(allowedUsersArray[i])).to.eq(true)
      }

      await allowlist.connect(owner).setDestinations(allowedUsersArray, allowedArray)

      for (let i = 0; i < allowedUsersArray.length; i++) {
        expect(await allowlist.isDestinationAllowed(allowedUsersArray[i])).to.eq(true)
      }
    })
  })

  describe('# resetDestinations', () => {
    beforeEach(async () => {
      await setupAllowlist()
      await allowlist.connect(owner).setDestinations(allowedUsersArray, allowedArray)
    })

    it('reverts if not owner', async () => {
      expect(await allowlist.owner()).to.not.eq(allowedUser1.address)

      await expect(
        allowlist.connect(allowedUser1).resetDestinations(allowedUsersArray)
      ).revertedWith('Ownable: caller is not the owner')
    })

    it('clears list if not setting new list', async () => {
      for (let i = 0; i < allowedUsersArray.length; i++) {
        expect(await allowlist.isDestinationAllowed(allowedUsersArray[i])).to.eq(true)
      }

      await allowlist.connect(owner).resetDestinations([])

      for (let i = 0; i < allowedUsersArray.length; i++) {
        expect(await allowlist.isDestinationAllowed(allowedUsersArray[i])).to.eq(false)
      }
    })

    it('replaces old list with one account', async () => {
      for (let i = 0; i < allowedUsersArray.length; i++) {
        expect(await allowlist.isDestinationAllowed(allowedUsersArray[i])).to.eq(true)
      }
      expect(await allowlist.isDestinationAllowed(newAllowedUser1.address)).to.eq(false)

      await allowlist.connect(owner).resetDestinations([newAllowedUser1.address])

      for (let i = 0; i < allowedUsersArray.length; i++) {
        expect(await allowlist.isDestinationAllowed(allowedUsersArray[i])).to.eq(false)
      }
      expect(await allowlist.isDestinationAllowed(newAllowedUser1.address)).to.eq(true)
    })

    it('replaces old list with multiple accounts', async () => {
      for (let i = 0; i < allowedUsersArray.length; i++) {
        expect(await allowlist.isDestinationAllowed(allowedUsersArray[i])).to.eq(true)
        expect(await allowlist.isDestinationAllowed(newAllowedUsersArray[i])).to.eq(false)
      }

      await allowlist.connect(owner).resetDestinations(newAllowedUsersArray)

      for (let i = 0; i < allowedUsersArray.length; i++) {
        expect(await allowlist.isDestinationAllowed(allowedUsersArray[i])).to.eq(false)
        expect(await allowlist.isDestinationAllowed(newAllowedUsersArray[i])).to.eq(true)
      }
    })
  })
})
