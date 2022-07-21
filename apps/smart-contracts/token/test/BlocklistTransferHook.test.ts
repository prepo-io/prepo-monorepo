import { expect } from 'chai'
import { ethers } from 'hardhat'
import { Contract } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { MockContract } from '@defi-wonderland/smock'
import { ZERO_ADDRESS, JUNK_ADDRESS } from 'prepo-constants'
import { blocklistTransferHookFixture } from './fixtures/TransferHookFixtures'
import { smockAccountListFixture } from './fixtures/AccountListFixtures'
import { BlocklistTransferHook } from '../types/generated'

describe('BlocklistTransferHook', () => {
  let deployer: SignerWithAddress
  let owner: SignerWithAddress
  let user1: SignerWithAddress
  let user2: SignerWithAddress
  let ppoToken: SignerWithAddress
  let blocklistTransferHook: BlocklistTransferHook
  let blockedAccounts: MockContract<Contract>

  const deployHook = async (): Promise<void> => {
    ;[deployer, owner, user1, user2, ppoToken] = await ethers.getSigners()
    blocklistTransferHook = await blocklistTransferHookFixture(owner.address)
  }

  const setupHook = async (): Promise<void> => {
    await deployHook()
    await blocklistTransferHook.connect(owner).acceptOwnership()
  }

  const setupHookAndList = async (): Promise<void> => {
    await setupHook()
    blockedAccounts = await smockAccountListFixture(owner.address)
    await blocklistTransferHook.connect(owner).setBlocklist(blockedAccounts.address)
  }

  describe('initial state', () => {
    beforeEach(async () => {
      await deployHook()
    })

    it('sets nominee from initialize', async () => {
      expect(await blocklistTransferHook.getNominee()).to.not.eq(deployer.address)
      expect(await blocklistTransferHook.getNominee()).to.eq(owner.address)
    })

    it('sets owner to deployer', async () => {
      expect(await blocklistTransferHook.owner()).to.eq(deployer.address)
    })

    it('sets token to zero address', async () => {
      expect(await blocklistTransferHook.getToken()).to.eq(ZERO_ADDRESS)
    })

    it('sets blocklist to zero address', async () => {
      expect(await blocklistTransferHook.getBlocklist()).to.eq(ZERO_ADDRESS)
    })
  })

  describe('# setToken', () => {
    beforeEach(async () => {
      await setupHook()
    })

    it('reverts if not owner', async () => {
      expect(await blocklistTransferHook.owner()).to.not.eq(user1.address)

      await expect(blocklistTransferHook.connect(user1).setToken(JUNK_ADDRESS)).revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('sets to non-zero address', async () => {
      expect(await blocklistTransferHook.getToken()).to.not.eq(JUNK_ADDRESS)

      await blocklistTransferHook.connect(owner).setToken(JUNK_ADDRESS)

      expect(await blocklistTransferHook.getToken()).to.eq(JUNK_ADDRESS)
      expect(await blocklistTransferHook.getToken()).to.not.eq(ZERO_ADDRESS)
    })

    it('sets to zero address', async () => {
      await blocklistTransferHook.connect(owner).setToken(JUNK_ADDRESS)
      expect(await blocklistTransferHook.getToken()).to.not.eq(ZERO_ADDRESS)

      await blocklistTransferHook.connect(owner).setToken(ZERO_ADDRESS)

      expect(await blocklistTransferHook.getToken()).to.eq(ZERO_ADDRESS)
    })

    it('is idempotent', async () => {
      expect(await blocklistTransferHook.getToken()).to.not.eq(JUNK_ADDRESS)

      await blocklistTransferHook.connect(owner).setToken(JUNK_ADDRESS)

      expect(await blocklistTransferHook.getToken()).to.eq(JUNK_ADDRESS)

      await blocklistTransferHook.connect(owner).setToken(JUNK_ADDRESS)

      expect(await blocklistTransferHook.getToken()).to.eq(JUNK_ADDRESS)
    })
  })

  describe('# setBlocklist', () => {
    beforeEach(async () => {
      await setupHook()
    })

    it('reverts if not owner', async () => {
      expect(await blocklistTransferHook.owner()).to.not.eq(user1.address)

      await expect(blocklistTransferHook.connect(user1).setBlocklist(JUNK_ADDRESS)).revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('sets to non-zero address', async () => {
      expect(await blocklistTransferHook.getBlocklist()).to.not.eq(JUNK_ADDRESS)

      await blocklistTransferHook.connect(owner).setBlocklist(JUNK_ADDRESS)

      expect(await blocklistTransferHook.getBlocklist()).to.eq(JUNK_ADDRESS)
      expect(await blocklistTransferHook.getBlocklist()).to.not.eq(ZERO_ADDRESS)
    })

    it('sets to zero address', async () => {
      await blocklistTransferHook.connect(owner).setBlocklist(JUNK_ADDRESS)
      expect(await blocklistTransferHook.getBlocklist()).to.not.eq(ZERO_ADDRESS)

      await blocklistTransferHook.connect(owner).setBlocklist(ZERO_ADDRESS)

      expect(await blocklistTransferHook.getBlocklist()).to.eq(ZERO_ADDRESS)
    })

    it('is idempotent', async () => {
      expect(await blocklistTransferHook.getBlocklist()).to.not.eq(JUNK_ADDRESS)

      await blocklistTransferHook.connect(owner).setBlocklist(JUNK_ADDRESS)

      expect(await blocklistTransferHook.getBlocklist()).to.eq(JUNK_ADDRESS)

      await blocklistTransferHook.connect(owner).setBlocklist(JUNK_ADDRESS)

      expect(await blocklistTransferHook.getBlocklist()).to.eq(JUNK_ADDRESS)
    })
  })
})
