/* eslint-disable no-await-in-loop */
import chai, { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { MockContract, smock } from '@defi-wonderland/smock'
import { Contract } from '@defi-wonderland/smock/node_modules/ethers'
import { revertReason, ZERO } from './utils'
import { purchaseHookFixture } from './fixtures/PurchaseHookFixtures'
import { PurchaseHook } from '../types/generated'

chai.use(smock.matchers)

describe('PurchaseHook', () => {
  let deployer: SignerWithAddress
  let owner: SignerWithAddress
  let user1: SignerWithAddress
  let purchaseHook: PurchaseHook
  let tokenContracts: string[]
  let firstERC721: MockContract<Contract>
  let secondERC721: MockContract<Contract>
  let firstERC1155: MockContract<Contract>
  let secondERC1155: MockContract<Contract>

  const setupPurchaseHook = async (): Promise<void> => {
    ;[deployer, user1] = await ethers.getSigners()
    owner = deployer
    purchaseHook = await purchaseHookFixture()
  }

  const setupMockERC721Contracts = async (): Promise<void> => {
    const mockERC721Factory = await smock.mock('ERC721Mintable')
    firstERC721 = await mockERC721Factory.deploy('first mock ERC721', 'fmERC721')
    secondERC721 = await mockERC721Factory.deploy('second mock ERC721', 'smERC721')
  }

  const setupMockERC1155Contracts = async (): Promise<void> => {
    const mockERC1155Factory = await smock.mock('ERC1155Mintable')
    firstERC1155 = await mockERC1155Factory.deploy('mockURI1')
    secondERC1155 = await mockERC1155Factory.deploy('mockURI2')
  }

  describe('initial state', () => {
    before(async () => {
      await setupPurchaseHook()
    })

    it('sets deployer as owner', async () => {
      expect(await purchaseHook.owner()).to.eq(owner.address)
    })
  })

  describe('# setMaxERC721PurchasesPerUser', () => {
    const maxAmounts = [1, 2]

    beforeEach(async () => {
      await setupPurchaseHook()
      await setupMockERC721Contracts()
      tokenContracts = [secondERC721.address, firstERC721.address]
    })

    it('reverts if not owner', async () => {
      expect(await purchaseHook.owner()).to.not.eq(user1.address)

      await expect(
        purchaseHook.connect(user1).setMaxERC721PurchasesPerUser(tokenContracts, maxAmounts)
      ).revertedWith(revertReason('Ownable: caller is not the owner'))
    })

    it('reverts if array length mismatch', async () => {
      const mismatchedContractArray = tokenContracts.slice(0, 1)
      expect(mismatchedContractArray.length).to.not.eq(maxAmounts.length)

      await expect(
        purchaseHook
          .connect(owner)
          .setMaxERC721PurchasesPerUser(mismatchedContractArray, maxAmounts)
      ).revertedWith(revertReason('Array length mismatch'))
    })

    it('sets amount to non-zero for single item', async () => {
      const contract = tokenContracts[0]
      const maxAmount = maxAmounts[0]
      expect(maxAmount).to.not.eq(ZERO)
      expect(await purchaseHook.getMaxERC721PurchasesPerUser(contract)).to.not.eq(maxAmount)

      await purchaseHook.connect(owner).setMaxERC721PurchasesPerUser([contract], [maxAmount])

      expect(await purchaseHook.getMaxERC721PurchasesPerUser(contract)).to.eq(maxAmount)
    })

    it('sets amount to non-zero for multiple items', async () => {
      for (let i = 0; i < tokenContracts.length; i++) {
        expect(maxAmounts[i]).to.not.eq(ZERO)
        expect(await purchaseHook.getMaxERC721PurchasesPerUser(tokenContracts[i])).to.not.eq(
          maxAmounts[i]
        )
      }

      await purchaseHook.connect(owner).setMaxERC721PurchasesPerUser(tokenContracts, maxAmounts)

      for (let i = 0; i < tokenContracts.length; i++) {
        expect(await purchaseHook.getMaxERC721PurchasesPerUser(tokenContracts[i])).to.eq(
          maxAmounts[i]
        )
      }
    })

    it('sets amount to zero for single item', async () => {
      const contract = tokenContracts[0]
      const maxAmount = maxAmounts[0]
      await purchaseHook.connect(owner).setMaxERC721PurchasesPerUser([contract], [maxAmount])
      expect(await purchaseHook.getMaxERC721PurchasesPerUser(contract)).to.not.eq(ZERO)

      await purchaseHook.connect(owner).setMaxERC721PurchasesPerUser([contract], [ZERO])

      expect(await purchaseHook.getMaxERC721PurchasesPerUser(contract)).to.eq(ZERO)
    })

    it('sets amount to zero for multiple items', async () => {
      await purchaseHook.connect(owner).setMaxERC721PurchasesPerUser(tokenContracts, maxAmounts)
      for (let i = 0; i < tokenContracts.length; i++) {
        expect(await purchaseHook.getMaxERC721PurchasesPerUser(tokenContracts[i])).to.not.eq(ZERO)
      }
      const arrayOfZeroes = new Array(maxAmounts.length).fill(ZERO)

      await purchaseHook.connect(owner).setMaxERC721PurchasesPerUser(tokenContracts, arrayOfZeroes)

      for (let i = 0; i < tokenContracts.length; i++) {
        expect(await purchaseHook.getMaxERC721PurchasesPerUser(tokenContracts[i])).to.eq(ZERO)
      }
    })

    it('is idempotent', async () => {
      for (let i = 0; i < tokenContracts.length; i++) {
        expect(await purchaseHook.getMaxERC721PurchasesPerUser(tokenContracts[i])).to.not.eq(
          maxAmounts[i]
        )
      }

      await purchaseHook.connect(owner).setMaxERC721PurchasesPerUser(tokenContracts, maxAmounts)

      for (let i = 0; i < tokenContracts.length; i++) {
        expect(await purchaseHook.getMaxERC721PurchasesPerUser(tokenContracts[i])).to.eq(
          maxAmounts[i]
        )
      }

      await purchaseHook.connect(owner).setMaxERC721PurchasesPerUser(tokenContracts, maxAmounts)

      for (let i = 0; i < tokenContracts.length; i++) {
        expect(await purchaseHook.getMaxERC721PurchasesPerUser(tokenContracts[i])).to.eq(
          maxAmounts[i]
        )
      }
    })
  })

  describe('# setMaxERC1155PurchasesPerUser', () => {
    const maxAmounts = [1, 2]
    const tokenIds = [0, 1]

    beforeEach(async () => {
      await setupPurchaseHook()
      await setupMockERC1155Contracts()
      tokenContracts = [firstERC1155.address, secondERC1155.address]
    })

    it('reverts if not owner', async () => {
      expect(await purchaseHook.owner()).to.not.eq(user1.address)

      await expect(
        purchaseHook
          .connect(user1)
          .setMaxERC1155PurchasesPerUser(tokenContracts, tokenIds, maxAmounts)
      ).revertedWith(revertReason('Ownable: caller is not the owner'))
    })

    it('reverts if token contract array length mismatch', async () => {
      const mismatchedContractArray = tokenContracts.slice(0, 1)
      expect(tokenIds.length).to.eq(maxAmounts.length)
      expect(mismatchedContractArray.length).to.not.eq(tokenIds.length)

      await expect(
        purchaseHook
          .connect(owner)
          .setMaxERC1155PurchasesPerUser(mismatchedContractArray, tokenIds, maxAmounts)
      ).revertedWith(revertReason('Array length mismatch'))
    })

    it('reverts if amount array length mismatch', async () => {
      const mismatchedAmountArray = maxAmounts.slice(0, 1)
      expect(tokenContracts.length).to.eq(tokenIds.length)
      expect(mismatchedAmountArray.length).to.not.eq(tokenIds.length)

      await expect(
        purchaseHook
          .connect(owner)
          .setMaxERC1155PurchasesPerUser(tokenContracts, tokenIds, mismatchedAmountArray)
      ).revertedWith(revertReason('Array length mismatch'))
    })

    it('reverts if token id array length mismatch', async () => {
      const mismatchedIdArray = tokenIds.slice(0, 1)
      expect(tokenContracts.length).to.eq(maxAmounts.length)
      expect(mismatchedIdArray.length).to.not.eq(tokenContracts.length)

      await expect(
        purchaseHook
          .connect(owner)
          .setMaxERC1155PurchasesPerUser(tokenContracts, mismatchedIdArray, maxAmounts)
      ).revertedWith(revertReason('Array length mismatch'))
    })

    it('sets amount to non-zero for single item', async () => {
      const contract = tokenContracts[0]
      const tokenId = tokenIds[0]
      const maxAmount = maxAmounts[0]
      expect(maxAmount).to.not.eq(ZERO)
      expect(await purchaseHook.getMaxERC1155PurchasesPerUser(contract, tokenId)).to.not.eq(
        maxAmount
      )

      await purchaseHook
        .connect(owner)
        .setMaxERC1155PurchasesPerUser([contract], [tokenId], [maxAmount])

      expect(await purchaseHook.getMaxERC1155PurchasesPerUser(contract, tokenId)).to.eq(maxAmount)
    })

    it('sets amount to non-zero for multiple items', async () => {
      for (let i = 0; i < tokenContracts.length; i++) {
        expect(maxAmounts[i]).to.not.eq(ZERO)
        expect(
          await purchaseHook.getMaxERC1155PurchasesPerUser(tokenContracts[i], tokenIds)
        ).to.not.eq(maxAmounts[i])
      }

      await purchaseHook
        .connect(owner)
        .setMaxERC1155PurchasesPerUser(tokenContracts, tokenIds, maxAmounts)

      for (let i = 0; i < tokenContracts.length; i++) {
        expect(
          await purchaseHook.getMaxERC1155PurchasesPerUser(tokenContracts[i], tokenIds[i])
        ).to.eq(maxAmounts[i])
      }
    })

    it('sets amount to zero for single item', async () => {
      const contract = tokenContracts[0]
      const maxAmount = maxAmounts[0]
      const tokenId = tokenIds[0]
      await purchaseHook
        .connect(owner)
        .setMaxERC1155PurchasesPerUser([contract], [tokenId], [maxAmount])
      expect(await purchaseHook.getMaxERC1155PurchasesPerUser(contract, tokenId)).to.not.eq(ZERO)

      await purchaseHook.connect(owner).setMaxERC1155PurchasesPerUser([contract], [tokenId], [ZERO])

      expect(await purchaseHook.getMaxERC1155PurchasesPerUser(contract, tokenId)).to.eq(ZERO)
    })

    it('sets amount to zero for multiple items', async () => {
      await purchaseHook
        .connect(owner)
        .setMaxERC1155PurchasesPerUser(tokenContracts, tokenIds, maxAmounts)
      for (let i = 0; i < tokenContracts.length; i++) {
        expect(
          await purchaseHook.getMaxERC1155PurchasesPerUser(tokenContracts[i], tokenIds[i])
        ).to.not.eq(ZERO)
      }
      const arrayOfZeroes = new Array(maxAmounts.length).fill(ZERO)

      await purchaseHook
        .connect(owner)
        .setMaxERC1155PurchasesPerUser(tokenContracts, tokenIds, arrayOfZeroes)

      for (let i = 0; i < tokenContracts.length; i++) {
        expect(
          await purchaseHook.getMaxERC1155PurchasesPerUser(tokenContracts[i], tokenIds[i])
        ).to.eq(ZERO)
      }
    })

    it('is idempotent', async () => {
      for (let i = 0; i < tokenContracts.length; i++) {
        expect(
          await purchaseHook.getMaxERC1155PurchasesPerUser(tokenContracts[i], tokenIds[i])
        ).to.not.eq(maxAmounts[i])
      }

      await purchaseHook
        .connect(owner)
        .setMaxERC1155PurchasesPerUser(tokenContracts, tokenIds, maxAmounts)

      for (let i = 0; i < tokenContracts.length; i++) {
        expect(
          await purchaseHook.getMaxERC1155PurchasesPerUser(tokenContracts[i], tokenIds[i])
        ).to.eq(maxAmounts[i])
      }

      await purchaseHook
        .connect(owner)
        .setMaxERC1155PurchasesPerUser(tokenContracts, tokenIds, maxAmounts)

      for (let i = 0; i < tokenContracts.length; i++) {
        expect(
          await purchaseHook.getMaxERC1155PurchasesPerUser(tokenContracts[i], tokenIds[i])
        ).to.eq(maxAmounts[i])
      }
    })
  })
})
