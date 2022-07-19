import { expect } from 'chai'
import { ethers } from 'hardhat'
import { Contract } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { MockContract } from '@defi-wonderland/smock'
import { ZERO_ADDRESS, JUNK_ADDRESS } from 'prepo-constants'
import { restrictedTransferHookFixture } from './fixtures/TransferHookFixtures'
import { smockAccountListFixture } from './fixtures/AccountListFixtures'
import { RestrictedTransferHook } from '../types/generated'

describe('RestrictedTransferHook', () => {
  let deployer: SignerWithAddress
  let owner: SignerWithAddress
  let user1: SignerWithAddress
  let user2: SignerWithAddress
  let ppoToken: SignerWithAddress
  let restrictedTransferHook: RestrictedTransferHook
  let allowedSources: MockContract<Contract>
  let allowedDestinations: MockContract<Contract>
  let blockedAccounts: MockContract<Contract>

  const deployHook = async (): Promise<void> => {
    ;[deployer, owner, user1, user2, ppoToken] = await ethers.getSigners()
    restrictedTransferHook = await restrictedTransferHookFixture(owner.address)
  }

  const setupHookAndLists = async (): Promise<void> => {
    await deployHook()
    await restrictedTransferHook.connect(owner).acceptOwnership()
    await restrictedTransferHook.connect(owner).setPPO(ppoToken.address)
    allowedSources = await smockAccountListFixture(owner.address)
    await restrictedTransferHook.connect(owner).setAllowedSources(allowedSources.address)
    allowedDestinations = await smockAccountListFixture(owner.address)
    await restrictedTransferHook.connect(owner).setAllowedDestinations(allowedDestinations.address)
    blockedAccounts = await smockAccountListFixture(owner.address)
    await restrictedTransferHook.connect(owner).setBlockedAccounts(blockedAccounts.address)
  }

  describe('initial state', () => {
    beforeEach(async () => {
      await deployHook()
    })

    it('sets nominee from initialize', async () => {
      expect(await restrictedTransferHook.getNominee()).to.not.eq(deployer.address)
      expect(await restrictedTransferHook.getNominee()).to.eq(owner.address)
    })

    it('sets owner to deployer', async () => {
      expect(await restrictedTransferHook.owner()).to.eq(deployer.address)
    })
  })

  describe('setPPO', () => {
    beforeEach(async () => {
      await setupHookAndLists()
    })

    it('reverts if not owner', async () => {
      expect(await restrictedTransferHook.owner()).to.not.eq(user1.address)

      await expect(restrictedTransferHook.connect(user1).setPPO(JUNK_ADDRESS)).revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('sets to non-zero address', async () => {
      expect(await restrictedTransferHook.getPPO()).to.not.eq(JUNK_ADDRESS)

      await restrictedTransferHook.connect(owner).setPPO(JUNK_ADDRESS)

      expect(await restrictedTransferHook.getPPO()).to.eq(JUNK_ADDRESS)
      expect(await restrictedTransferHook.getPPO()).to.not.eq(ZERO_ADDRESS)
    })

    it('sets to zero address', async () => {
      expect(await restrictedTransferHook.getPPO()).to.not.eq(ZERO_ADDRESS)

      await restrictedTransferHook.connect(owner).setPPO(ZERO_ADDRESS)

      expect(await restrictedTransferHook.getPPO()).to.eq(ZERO_ADDRESS)
    })

    it('is idempotent', async () => {
      expect(await restrictedTransferHook.getPPO()).to.not.eq(JUNK_ADDRESS)

      await restrictedTransferHook.connect(owner).setPPO(JUNK_ADDRESS)

      expect(await restrictedTransferHook.getPPO()).to.eq(JUNK_ADDRESS)

      await restrictedTransferHook.connect(owner).setPPO(JUNK_ADDRESS)

      expect(await restrictedTransferHook.getPPO()).to.eq(JUNK_ADDRESS)
    })
  })

  describe('setAllowedSources', () => {
    beforeEach(async () => {
      await setupHookAndLists()
    })

    it('reverts if not owner', async () => {
      expect(await restrictedTransferHook.owner()).to.not.eq(user1.address)

      await expect(
        restrictedTransferHook.connect(user1).setAllowedSources(JUNK_ADDRESS)
      ).revertedWith('Ownable: caller is not the owner')
    })

    it('sets to non-zero address', async () => {
      expect(await restrictedTransferHook.getAllowedSources()).to.not.eq(JUNK_ADDRESS)

      await restrictedTransferHook.connect(owner).setAllowedSources(JUNK_ADDRESS)

      expect(await restrictedTransferHook.getAllowedSources()).to.eq(JUNK_ADDRESS)
      expect(await restrictedTransferHook.getAllowedSources()).to.not.eq(ZERO_ADDRESS)
    })

    it('sets to zero address', async () => {
      expect(await restrictedTransferHook.getAllowedSources()).to.not.eq(ZERO_ADDRESS)

      await restrictedTransferHook.connect(owner).setAllowedSources(ZERO_ADDRESS)

      expect(await restrictedTransferHook.getAllowedSources()).to.eq(ZERO_ADDRESS)
    })

    it('is idempotent', async () => {
      expect(await restrictedTransferHook.getAllowedSources()).to.not.eq(JUNK_ADDRESS)

      await restrictedTransferHook.connect(owner).setAllowedSources(JUNK_ADDRESS)

      expect(await restrictedTransferHook.getAllowedSources()).to.eq(JUNK_ADDRESS)

      await restrictedTransferHook.connect(owner).setAllowedSources(JUNK_ADDRESS)

      expect(await restrictedTransferHook.getAllowedSources()).to.eq(JUNK_ADDRESS)
    })
  })

  describe('setAllowedDestinations', () => {
    beforeEach(async () => {
      await setupHookAndLists()
    })

    it('reverts if not owner', async () => {
      expect(await restrictedTransferHook.owner()).to.not.eq(user1.address)

      await expect(
        restrictedTransferHook.connect(user1).setAllowedDestinations(JUNK_ADDRESS)
      ).revertedWith('Ownable: caller is not the owner')
    })

    it('sets to non-zero address', async () => {
      expect(await restrictedTransferHook.getAllowedDestinations()).to.not.eq(JUNK_ADDRESS)

      await restrictedTransferHook.connect(owner).setAllowedDestinations(JUNK_ADDRESS)

      expect(await restrictedTransferHook.getAllowedDestinations()).to.eq(JUNK_ADDRESS)
      expect(await restrictedTransferHook.getAllowedDestinations()).to.not.eq(ZERO_ADDRESS)
    })

    it('sets to zero address', async () => {
      expect(await restrictedTransferHook.getAllowedDestinations()).to.not.eq(ZERO_ADDRESS)

      await restrictedTransferHook.connect(owner).setAllowedDestinations(ZERO_ADDRESS)

      expect(await restrictedTransferHook.getAllowedDestinations()).to.eq(ZERO_ADDRESS)
    })

    it('is idempotent', async () => {
      expect(await restrictedTransferHook.getAllowedDestinations()).to.not.eq(JUNK_ADDRESS)

      await restrictedTransferHook.connect(owner).setAllowedDestinations(JUNK_ADDRESS)

      expect(await restrictedTransferHook.getAllowedDestinations()).to.eq(JUNK_ADDRESS)

      await restrictedTransferHook.connect(owner).setAllowedDestinations(JUNK_ADDRESS)

      expect(await restrictedTransferHook.getAllowedDestinations()).to.eq(JUNK_ADDRESS)
    })
  })

  describe('setBlockedAccounts', () => {
    beforeEach(async () => {
      await setupHookAndLists()
    })

    it('reverts if not owner', async () => {
      expect(await restrictedTransferHook.owner()).to.not.eq(user1.address)

      await expect(
        restrictedTransferHook.connect(user1).setBlockedAccounts(JUNK_ADDRESS)
      ).revertedWith('Ownable: caller is not the owner')
    })

    it('sets to non-zero address', async () => {
      expect(await restrictedTransferHook.getBlockedAccounts()).to.not.eq(JUNK_ADDRESS)

      await restrictedTransferHook.connect(owner).setBlockedAccounts(JUNK_ADDRESS)

      expect(await restrictedTransferHook.getBlockedAccounts()).to.eq(JUNK_ADDRESS)
      expect(await restrictedTransferHook.getBlockedAccounts()).to.not.eq(ZERO_ADDRESS)
    })

    it('sets to zero address', async () => {
      expect(await restrictedTransferHook.getBlockedAccounts()).to.not.eq(ZERO_ADDRESS)

      await restrictedTransferHook.connect(owner).setBlockedAccounts(ZERO_ADDRESS)

      expect(await restrictedTransferHook.getBlockedAccounts()).to.eq(ZERO_ADDRESS)
    })

    it('is idempotent', async () => {
      expect(await restrictedTransferHook.getBlockedAccounts()).to.not.eq(JUNK_ADDRESS)

      await restrictedTransferHook.connect(owner).setBlockedAccounts(JUNK_ADDRESS)

      expect(await restrictedTransferHook.getBlockedAccounts()).to.eq(JUNK_ADDRESS)

      await restrictedTransferHook.connect(owner).setBlockedAccounts(JUNK_ADDRESS)

      expect(await restrictedTransferHook.getBlockedAccounts()).to.eq(JUNK_ADDRESS)
    })
  })
})