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

  const setupHook = async (): Promise<void> => {
    await deployHook()
    await restrictedTransferHook.connect(owner).acceptOwnership()
  }

  const setupHookAndLists = async (): Promise<void> => {
    await setupHook()
    allowedSources = await smockAccountListFixture(owner.address)
    await restrictedTransferHook.connect(owner).setSourceAllowlist(allowedSources.address)
    allowedDestinations = await smockAccountListFixture(owner.address)
    await restrictedTransferHook.connect(owner).setDestinationAllowlist(allowedDestinations.address)
    blockedAccounts = await smockAccountListFixture(owner.address)
    await restrictedTransferHook.connect(owner).setBlocklist(blockedAccounts.address)
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

    it('sets token to zero address', async () => {
      expect(await restrictedTransferHook.getToken()).to.eq(ZERO_ADDRESS)
    })

    it('sets blocked list to zero address', async () => {
      expect(await restrictedTransferHook.getBlocklist()).to.eq(ZERO_ADDRESS)
    })

    it('sets source allow list to zero address', async () => {
      expect(await restrictedTransferHook.getSourceAllowlist()).to.eq(ZERO_ADDRESS)
    })

    it('sets destination allow list to zero address', async () => {
      expect(await restrictedTransferHook.getDestinationAllowlist()).to.eq(ZERO_ADDRESS)
    })
  })

  describe('# setToken', () => {
    beforeEach(async () => {
      await setupHook()
    })

    it('reverts if not owner', async () => {
      expect(await restrictedTransferHook.owner()).to.not.eq(user1.address)

      await expect(restrictedTransferHook.connect(user1).setToken(JUNK_ADDRESS)).revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('sets to non-zero address', async () => {
      expect(await restrictedTransferHook.getToken()).to.not.eq(JUNK_ADDRESS)

      await restrictedTransferHook.connect(owner).setToken(JUNK_ADDRESS)

      expect(await restrictedTransferHook.getToken()).to.eq(JUNK_ADDRESS)
      expect(await restrictedTransferHook.getToken()).to.not.eq(ZERO_ADDRESS)
    })

    it('sets to zero address', async () => {
      await restrictedTransferHook.connect(owner).setToken(JUNK_ADDRESS)
      expect(await restrictedTransferHook.getToken()).to.not.eq(ZERO_ADDRESS)

      await restrictedTransferHook.connect(owner).setToken(ZERO_ADDRESS)

      expect(await restrictedTransferHook.getToken()).to.eq(ZERO_ADDRESS)
    })

    it('is idempotent', async () => {
      expect(await restrictedTransferHook.getToken()).to.not.eq(JUNK_ADDRESS)

      await restrictedTransferHook.connect(owner).setToken(JUNK_ADDRESS)

      expect(await restrictedTransferHook.getToken()).to.eq(JUNK_ADDRESS)

      await restrictedTransferHook.connect(owner).setToken(JUNK_ADDRESS)

      expect(await restrictedTransferHook.getToken()).to.eq(JUNK_ADDRESS)
    })
  })

  describe('# setSourceAllowlist', () => {
    beforeEach(async () => {
      await setupHook()
    })

    it('reverts if not owner', async () => {
      expect(await restrictedTransferHook.owner()).to.not.eq(user1.address)

      await expect(
        restrictedTransferHook.connect(user1).setSourceAllowlist(JUNK_ADDRESS)
      ).revertedWith('Ownable: caller is not the owner')
    })

    it('sets to non-zero address', async () => {
      expect(await restrictedTransferHook.getSourceAllowlist()).to.not.eq(JUNK_ADDRESS)

      await restrictedTransferHook.connect(owner).setSourceAllowlist(JUNK_ADDRESS)

      expect(await restrictedTransferHook.getSourceAllowlist()).to.eq(JUNK_ADDRESS)
      expect(await restrictedTransferHook.getSourceAllowlist()).to.not.eq(ZERO_ADDRESS)
    })

    it('sets to zero address', async () => {
      await restrictedTransferHook.connect(owner).setSourceAllowlist(JUNK_ADDRESS)
      expect(await restrictedTransferHook.getSourceAllowlist()).to.not.eq(ZERO_ADDRESS)

      await restrictedTransferHook.connect(owner).setSourceAllowlist(ZERO_ADDRESS)

      expect(await restrictedTransferHook.getSourceAllowlist()).to.eq(ZERO_ADDRESS)
    })

    it('is idempotent', async () => {
      expect(await restrictedTransferHook.getSourceAllowlist()).to.not.eq(JUNK_ADDRESS)

      await restrictedTransferHook.connect(owner).setSourceAllowlist(JUNK_ADDRESS)

      expect(await restrictedTransferHook.getSourceAllowlist()).to.eq(JUNK_ADDRESS)

      await restrictedTransferHook.connect(owner).setSourceAllowlist(JUNK_ADDRESS)

      expect(await restrictedTransferHook.getSourceAllowlist()).to.eq(JUNK_ADDRESS)
    })
  })

  describe('# setDestinationAllowlist', () => {
    beforeEach(async () => {
      await setupHook()
    })

    it('reverts if not owner', async () => {
      expect(await restrictedTransferHook.owner()).to.not.eq(user1.address)

      await expect(
        restrictedTransferHook.connect(user1).setDestinationAllowlist(JUNK_ADDRESS)
      ).revertedWith('Ownable: caller is not the owner')
    })

    it('sets to non-zero address', async () => {
      expect(await restrictedTransferHook.getDestinationAllowlist()).to.not.eq(JUNK_ADDRESS)

      await restrictedTransferHook.connect(owner).setDestinationAllowlist(JUNK_ADDRESS)

      expect(await restrictedTransferHook.getDestinationAllowlist()).to.eq(JUNK_ADDRESS)
      expect(await restrictedTransferHook.getDestinationAllowlist()).to.not.eq(ZERO_ADDRESS)
    })

    it('sets to zero address', async () => {
      await restrictedTransferHook.connect(owner).setDestinationAllowlist(JUNK_ADDRESS)
      expect(await restrictedTransferHook.getDestinationAllowlist()).to.not.eq(ZERO_ADDRESS)

      await restrictedTransferHook.connect(owner).setDestinationAllowlist(ZERO_ADDRESS)

      expect(await restrictedTransferHook.getDestinationAllowlist()).to.eq(ZERO_ADDRESS)
    })

    it('is idempotent', async () => {
      expect(await restrictedTransferHook.getDestinationAllowlist()).to.not.eq(JUNK_ADDRESS)

      await restrictedTransferHook.connect(owner).setDestinationAllowlist(JUNK_ADDRESS)

      expect(await restrictedTransferHook.getDestinationAllowlist()).to.eq(JUNK_ADDRESS)

      await restrictedTransferHook.connect(owner).setDestinationAllowlist(JUNK_ADDRESS)

      expect(await restrictedTransferHook.getDestinationAllowlist()).to.eq(JUNK_ADDRESS)
    })
  })

  describe('# setBlocklist', () => {
    beforeEach(async () => {
      await setupHook()
    })

    it('reverts if not owner', async () => {
      expect(await restrictedTransferHook.owner()).to.not.eq(user1.address)

      await expect(restrictedTransferHook.connect(user1).setBlocklist(JUNK_ADDRESS)).revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('sets to non-zero address', async () => {
      expect(await restrictedTransferHook.getBlocklist()).to.not.eq(JUNK_ADDRESS)

      await restrictedTransferHook.connect(owner).setBlocklist(JUNK_ADDRESS)

      expect(await restrictedTransferHook.getBlocklist()).to.eq(JUNK_ADDRESS)
      expect(await restrictedTransferHook.getBlocklist()).to.not.eq(ZERO_ADDRESS)
    })

    it('sets to zero address', async () => {
      await restrictedTransferHook.connect(owner).setBlocklist(JUNK_ADDRESS)
      expect(await restrictedTransferHook.getBlocklist()).to.not.eq(ZERO_ADDRESS)

      await restrictedTransferHook.connect(owner).setBlocklist(ZERO_ADDRESS)

      expect(await restrictedTransferHook.getBlocklist()).to.eq(ZERO_ADDRESS)
    })

    it('is idempotent', async () => {
      expect(await restrictedTransferHook.getBlocklist()).to.not.eq(JUNK_ADDRESS)

      await restrictedTransferHook.connect(owner).setBlocklist(JUNK_ADDRESS)

      expect(await restrictedTransferHook.getBlocklist()).to.eq(JUNK_ADDRESS)

      await restrictedTransferHook.connect(owner).setBlocklist(JUNK_ADDRESS)

      expect(await restrictedTransferHook.getBlocklist()).to.eq(JUNK_ADDRESS)
    })
  })
  describe('hook', () => {
    let sender: SignerWithAddress
    let recipient: SignerWithAddress
    beforeEach(async () => {
      await setupHookAndLists()
      await restrictedTransferHook.connect(owner).setToken(ppoToken.address)
      sender = user1
      recipient = user2
    })

    it('reverts if caller is not PPO', async () => {
      expect(await restrictedTransferHook.getToken()).to.not.eq(user1.address)

      await expect(
        restrictedTransferHook.connect(user1).hook(sender.address, recipient.address, 1)
      ).to.be.revertedWith('msg.sender != token')
    })

    describe('if sender blocked', () => {
      beforeEach(() => {
        blockedAccounts.isIncluded.whenCalledWith(sender.address).returns(true)
      })

      it('reverts if recipient blocked', async () => {
        blockedAccounts.isIncluded.whenCalledWith(recipient.address).returns(true)

        await expect(
          restrictedTransferHook.connect(ppoToken).hook(sender.address, recipient.address, 1)
        ).to.be.revertedWith('Sender blocked')
      })

      it('reverts if recipient not blocked', async () => {
        blockedAccounts.isIncluded.whenCalledWith(recipient.address).returns(false)

        await expect(
          restrictedTransferHook.connect(ppoToken).hook(sender.address, recipient.address, 1)
        ).to.be.revertedWith('Sender blocked')
      })

      it('reverts if sender is allowed source', async () => {
        allowedSources.isIncluded.whenCalledWith(sender.address).returns(true)

        await expect(
          restrictedTransferHook.connect(ppoToken).hook(sender.address, recipient.address, 1)
        ).to.be.revertedWith('Sender blocked')
      })

      it('reverts if recipient is allowed destination', async () => {
        allowedDestinations.isIncluded.whenCalledWith(recipient.address).returns(true)

        await expect(
          restrictedTransferHook.connect(ppoToken).hook(sender.address, recipient.address, 1)
        ).to.be.revertedWith('Sender blocked')
      })
    })

    describe('if recipient blocked', () => {
      beforeEach(() => {
        blockedAccounts.isIncluded.whenCalledWith(recipient.address).returns(true)
      })

      it('reverts if sender blocked', async () => {
        blockedAccounts.isIncluded.whenCalledWith(sender.address).returns(true)

        await expect(
          restrictedTransferHook.connect(ppoToken).hook(sender.address, recipient.address, 1)
        ).to.be.revertedWith('Sender blocked')
      })

      it('reverts if sender not blocked', async () => {
        blockedAccounts.isIncluded.whenCalledWith(sender.address).returns(false)

        await expect(
          restrictedTransferHook.connect(ppoToken).hook(sender.address, recipient.address, 1)
        ).to.be.revertedWith('Recipient blocked')
      })

      it('reverts if sender is allowed source', async () => {
        allowedSources.isIncluded.whenCalledWith(sender.address).returns(true)

        await expect(
          restrictedTransferHook.connect(ppoToken).hook(sender.address, recipient.address, 1)
        ).to.be.revertedWith('Recipient blocked')
      })

      it('reverts if recipient is allowed destination', async () => {
        allowedDestinations.isIncluded.whenCalledWith(recipient.address).returns(true)

        await expect(
          restrictedTransferHook.connect(ppoToken).hook(sender.address, recipient.address, 1)
        ).to.be.revertedWith('Recipient blocked')
      })
    })

    describe('if sender is allowed source', () => {
      beforeEach(() => {
        allowedSources.isIncluded.whenCalledWith(sender.address).returns(true)
      })

      it('reverts if sender blocked', async () => {
        blockedAccounts.isIncluded.whenCalledWith(sender.address).returns(true)

        await expect(
          restrictedTransferHook.connect(ppoToken).hook(sender.address, recipient.address, 1)
        ).to.be.revertedWith('Sender blocked')
      })

      it('reverts if recipient blocked', async () => {
        blockedAccounts.isIncluded.whenCalledWith(recipient.address).returns(true)

        await expect(
          restrictedTransferHook.connect(ppoToken).hook(sender.address, recipient.address, 1)
        ).to.be.revertedWith('Recipient blocked')
      })

      describe('if both sender and recipient not blocked', () => {
        beforeEach(() => {
          blockedAccounts.isIncluded.whenCalledWith(sender.address).returns(false)
          blockedAccounts.isIncluded.whenCalledWith(recipient.address).returns(false)
        })

        it("doesn't revert if recipient is not allowed destination", async () => {
          allowedDestinations.isIncluded.whenCalledWith(recipient.address).returns(false)
          await expect(
            restrictedTransferHook.connect(ppoToken).hook(sender.address, recipient.address, 1)
          ).to.not.reverted
        })

        it("doesn't revert if recipient is allowed destination", async () => {
          allowedDestinations.isIncluded.whenCalledWith(recipient.address).returns(true)
          await expect(
            restrictedTransferHook.connect(ppoToken).hook(sender.address, recipient.address, 1)
          ).to.not.reverted
        })
      })
    })

    describe('if recipient is allowed destination', () => {
      beforeEach(() => {
        allowedDestinations.isIncluded.whenCalledWith(recipient.address).returns(true)
      })

      it('reverts if sender blocked', async () => {
        blockedAccounts.isIncluded.whenCalledWith(sender.address).returns(true)

        await expect(
          restrictedTransferHook.connect(ppoToken).hook(sender.address, recipient.address, 1)
        ).to.be.revertedWith('Sender blocked')
      })

      it('reverts if recipient blocked', async () => {
        blockedAccounts.isIncluded.whenCalledWith(recipient.address).returns(true)

        await expect(
          restrictedTransferHook.connect(ppoToken).hook(sender.address, recipient.address, 1)
        ).to.be.revertedWith('Recipient blocked')
      })

      describe('if both sender and recipient not blocked', () => {
        beforeEach(() => {
          blockedAccounts.isIncluded.whenCalledWith(sender.address).returns(false)
          blockedAccounts.isIncluded.whenCalledWith(recipient.address).returns(false)
        })

        it("doesn't revert if sender is not allowed source", async () => {
          allowedSources.isIncluded.whenCalledWith(sender.address).returns(false)
          await expect(
            restrictedTransferHook.connect(ppoToken).hook(sender.address, recipient.address, 1)
          ).to.not.reverted
        })

        it("doesn't revert if sender is allowed source", async () => {
          allowedSources.isIncluded.whenCalledWith(sender.address).returns(true)
          await expect(
            restrictedTransferHook.connect(ppoToken).hook(sender.address, recipient.address, 1)
          ).to.not.reverted
        })
      })
    })

    describe('if sender not in allowed source and recipient not in allowed destination', () => {
      beforeEach(() => {
        allowedSources.isIncluded.whenCalledWith(sender.address).returns(false)
        allowedDestinations.isIncluded.whenCalledWith(recipient.address).returns(false)
      })

      it('reverts if sender blocked', async () => {
        blockedAccounts.isIncluded.whenCalledWith(sender.address).returns(true)

        await expect(
          restrictedTransferHook.connect(ppoToken).hook(sender.address, recipient.address, 1)
        ).to.be.revertedWith('Sender blocked')
      })

      it('reverts if recipient blocked', async () => {
        blockedAccounts.isIncluded.whenCalledWith(recipient.address).returns(true)

        await expect(
          restrictedTransferHook.connect(ppoToken).hook(sender.address, recipient.address, 1)
        ).to.be.revertedWith('Recipient blocked')
      })

      it('reverts if both sender and recipient not blocked', async () => {
        blockedAccounts.isIncluded.whenCalledWith(sender.address).returns(false)
        blockedAccounts.isIncluded.whenCalledWith(recipient.address).returns(false)

        await expect(
          restrictedTransferHook.connect(ppoToken).hook(sender.address, recipient.address, 1)
        ).to.be.revertedWith('Destination not allowed')
      })
    })
  })
})
