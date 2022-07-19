import { expect } from 'chai'
import { ethers } from 'hardhat'
import { Contract } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { MockContract } from '@defi-wonderland/smock'
import { ZERO_ADDRESS, JUNK_ADDRESS } from 'prepo-constants'
import { unrestrictedTransferHookFixture } from './fixtures/TransferHookFixtures'
import { smockAccountListFixture } from './fixtures/AccountListFixtures'
import { UnrestrictedTransferHook } from '../types/generated'

describe('UnrestrictedTransferHook', () => {
  let deployer: SignerWithAddress
  let owner: SignerWithAddress
  let user1: SignerWithAddress
  let user2: SignerWithAddress
  let ppoToken: SignerWithAddress
  let unrestrictedTransferHook: UnrestrictedTransferHook
  let blockedAccounts: MockContract<Contract>

  const deployHook = async (): Promise<void> => {
    ;[deployer, owner, user1, user2, ppoToken] = await ethers.getSigners()
    unrestrictedTransferHook = await unrestrictedTransferHookFixture(owner.address)
  }

  const setupHook = async (): Promise<void> => {
    await deployHook()
    await unrestrictedTransferHook.connect(owner).acceptOwnership()
  }

  const setupLists = async (): Promise<void> => {
    blockedAccounts = await smockAccountListFixture(owner.address)
    await unrestrictedTransferHook.connect(owner).setBlockedAccounts(blockedAccounts.address)
  }

  describe('initial state', () => {
    beforeEach(async () => {
      await deployHook()
    })

    it('sets nominee from initialize', async () => {
      expect(await unrestrictedTransferHook.getNominee()).to.not.eq(deployer.address)
      expect(await unrestrictedTransferHook.getNominee()).to.eq(owner.address)
    })

    it('sets owner to deployer', async () => {
      expect(await unrestrictedTransferHook.owner()).to.eq(deployer.address)
    })

    it('sets ppo to zero address', async () => {
      expect(await unrestrictedTransferHook.getPPO()).to.eq(ZERO_ADDRESS)
    })

    it('sets blocked accounts list to zero address', async () => {
      expect(await unrestrictedTransferHook.getBlockedAccounts()).to.eq(ZERO_ADDRESS)
    })
  })

  describe('setPPO', () => {
    beforeEach(async () => {
      await setupHook()
    })

    it('reverts if not owner', async () => {
      expect(await unrestrictedTransferHook.owner()).to.not.eq(user1.address)

      await expect(unrestrictedTransferHook.connect(user1).setPPO(JUNK_ADDRESS)).revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('sets to non-zero address', async () => {
      expect(await unrestrictedTransferHook.getPPO()).to.not.eq(JUNK_ADDRESS)

      await unrestrictedTransferHook.connect(owner).setPPO(JUNK_ADDRESS)

      expect(await unrestrictedTransferHook.getPPO()).to.eq(JUNK_ADDRESS)
      expect(await unrestrictedTransferHook.getPPO()).to.not.eq(ZERO_ADDRESS)
    })

    it('sets to zero address', async () => {
      await unrestrictedTransferHook.connect(owner).setPPO(JUNK_ADDRESS)
      expect(await unrestrictedTransferHook.getPPO()).to.not.eq(ZERO_ADDRESS)

      await unrestrictedTransferHook.connect(owner).setPPO(ZERO_ADDRESS)

      expect(await unrestrictedTransferHook.getPPO()).to.eq(ZERO_ADDRESS)
    })

    it('is idempotent', async () => {
      expect(await unrestrictedTransferHook.getPPO()).to.not.eq(JUNK_ADDRESS)

      await unrestrictedTransferHook.connect(owner).setPPO(JUNK_ADDRESS)

      expect(await unrestrictedTransferHook.getPPO()).to.eq(JUNK_ADDRESS)

      await unrestrictedTransferHook.connect(owner).setPPO(JUNK_ADDRESS)

      expect(await unrestrictedTransferHook.getPPO()).to.eq(JUNK_ADDRESS)
    })
  })

  describe('setBlockedAccounts', () => {
    beforeEach(async () => {
      await setupHook()
    })

    it('reverts if not owner', async () => {
      expect(await unrestrictedTransferHook.owner()).to.not.eq(user1.address)

      await expect(
        unrestrictedTransferHook.connect(user1).setBlockedAccounts(JUNK_ADDRESS)
      ).revertedWith('Ownable: caller is not the owner')
    })

    it('sets to non-zero address', async () => {
      expect(await unrestrictedTransferHook.getBlockedAccounts()).to.not.eq(JUNK_ADDRESS)

      await unrestrictedTransferHook.connect(owner).setBlockedAccounts(JUNK_ADDRESS)

      expect(await unrestrictedTransferHook.getBlockedAccounts()).to.eq(JUNK_ADDRESS)
      expect(await unrestrictedTransferHook.getBlockedAccounts()).to.not.eq(ZERO_ADDRESS)
    })

    it('sets to zero address', async () => {
      await unrestrictedTransferHook.connect(owner).setBlockedAccounts(JUNK_ADDRESS)
      expect(await unrestrictedTransferHook.getBlockedAccounts()).to.not.eq(ZERO_ADDRESS)

      await unrestrictedTransferHook.connect(owner).setBlockedAccounts(ZERO_ADDRESS)

      expect(await unrestrictedTransferHook.getBlockedAccounts()).to.eq(ZERO_ADDRESS)
    })

    it('is idempotent', async () => {
      expect(await unrestrictedTransferHook.getBlockedAccounts()).to.not.eq(JUNK_ADDRESS)

      await unrestrictedTransferHook.connect(owner).setBlockedAccounts(JUNK_ADDRESS)

      expect(await unrestrictedTransferHook.getBlockedAccounts()).to.eq(JUNK_ADDRESS)

      await unrestrictedTransferHook.connect(owner).setBlockedAccounts(JUNK_ADDRESS)

      expect(await unrestrictedTransferHook.getBlockedAccounts()).to.eq(JUNK_ADDRESS)
    })
  })
})
