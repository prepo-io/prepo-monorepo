import chai from 'chai'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { TokenShop, MockERC20 } from '../types/generated'
import { mockERC20Fixture } from './fixtures/MockERC20Fixtures'
import { tokenShopFixture } from './fixtures/TokenShopFixtures'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { FakeContract, MockContract, smock } from '@defi-wonderland/smock'
import { Contract } from '@defi-wonderland/smock/node_modules/ethers'
import { revertReason, AddressZero, JunkAddress, ZERO } from './utils'
import { parseEther } from 'ethers/lib/utils'

//TODO: change AddressZero and JunkAddress to all caps

chai.use(smock.matchers)

describe('TokenShop', () => {
  let deployer: SignerWithAddress
  let owner: SignerWithAddress
  let user1: SignerWithAddress
  let paymentToken: MockERC20
  let tokenShop: TokenShop
  let mockERC721: MockContract<Contract>
  let mockERC1155: MockContract<Contract>
  let tokenContracts: string[]

  const setupTokenShop = async (): Promise<void> => {
    ;[deployer, owner, user1] = await ethers.getSigners()
    let mockERC20Recipient = owner.address
    let mockERC20Decimals = 18
    let mockERC20InitialSupply = parseEther('100')
    paymentToken = await mockERC20Fixture(
      'Payment Token',
      'PT',
      mockERC20Decimals,
      mockERC20Recipient,
      mockERC20InitialSupply
    )
    tokenShop = await tokenShopFixture(owner.address, paymentToken.address)
  }

  const setupMockContracts = async (): Promise<void> => {
    const mockERC115Factory = await smock.mock('ERC1155Mintable')
    const mockERC721Factory = await smock.mock('ERC721Mintable')
    mockERC1155 = await mockERC115Factory.deploy('mockURI')
    mockERC721 = await mockERC721Factory.deploy('mock ERC721', 'mERC721')
  }

  describe('initial state', async () => {
    before(async () => {
      await setupTokenShop()
    })

    it('sets owner from constructor', async () => {
      expect(await tokenShop.owner()).to.not.eq(deployer.address)
      expect(await tokenShop.owner()).to.eq(owner.address)
    })

    it('sets payment token from constructor', async () => {
      expect(await tokenShop.getPaymentToken()).to.eq(paymentToken.address)
    })
  })

  describe('# setContractToIdToPrice', async () => {
    const tokenIds = [1, 1]
    const itemPrices = [parseEther('1'), parseEther('2')]

    beforeEach(async () => {
      await setupTokenShop()
      await setupMockContracts()
      tokenContracts = [mockERC1155.address, mockERC721.address]
    })

    it('reverts if not owner', async () => {
      expect(await tokenShop.owner()).to.not.eq(user1.address)

      await expect(
        tokenShop.connect(user1).setContractToIdToPrice(tokenContracts, tokenIds, itemPrices)
      ).revertedWith(revertReason('Ownable: caller is not the owner'))
    })

    it('reverts if token contract array length mismatch', async () => {
      const contractArray = tokenContracts.slice(0, 1)
      const idArray = tokenIds
      const priceArray = itemPrices
      expect(idArray.length).to.eq(priceArray.length)
      expect(contractArray.length).to.not.eq(idArray.length)
      expect(contractArray.length).to.not.eq(priceArray.length)

      await expect(
        tokenShop.connect(owner).setContractToIdToPrice(contractArray, idArray, priceArray)
      ).revertedWith(revertReason('Array length mismatch'))
    })

    it('reverts if item price array length mismatch', async () => {
      const contractArray = tokenContracts
      const idArray = tokenIds
      const priceArray = itemPrices.slice(0, 1)
      expect(contractArray.length).to.eq(idArray.length)
      expect(priceArray.length).to.not.eq(idArray.length)
      expect(priceArray.length).to.not.eq(contractArray.length)

      await expect(
        tokenShop.connect(owner).setContractToIdToPrice(contractArray, idArray, priceArray)
      ).revertedWith(revertReason('Array length mismatch'))
    })

    it('reverts if token id array length mismatch', async () => {
      const contractArray = tokenContracts
      const idArray = tokenIds.slice(0, 1)
      const priceArray = itemPrices
      expect(contractArray.length).to.eq(priceArray.length)
      expect(idArray.length).to.not.eq(contractArray.length)
      expect(idArray.length).to.not.eq(priceArray.length)

      await expect(
        tokenShop.connect(owner).setContractToIdToPrice(contractArray, idArray, priceArray)
      ).revertedWith(revertReason('Array length mismatch'))
    })

    it('sets price to non-zero for single item', async () => {
      const contract = tokenContracts[0]
      const tokenId = tokenIds[0]
      const itemPrice = itemPrices[0]
      expect(itemPrice).to.not.eq(ZERO)
      expect(await tokenShop.getPrice(contract, tokenId)).to.not.eq(itemPrice)

      await tokenShop.connect(owner).setContractToIdToPrice([contract], [tokenId], [itemPrice])

      expect(await tokenShop.getPrice(contract, tokenId)).to.eq(itemPrice)
    })

    it('sets price to non-zero for multiple items', async () => {
      for (let i = 0; i < tokenContracts.length; i++) {
        expect(itemPrices[i]).to.not.eq(ZERO)
        expect(await tokenShop.getPrice(tokenContracts[i], tokenIds[i])).to.not.eq(itemPrices[i])
      }

      await tokenShop.connect(owner).setContractToIdToPrice(tokenContracts, tokenIds, itemPrices)

      for (let i = 0; i < tokenContracts.length; i++) {
        expect(await tokenShop.getPrice(tokenContracts[i], tokenIds[i])).to.eq(itemPrices[i])
      }
    })

    it('sets price to zero for single item', async () => {
      const contract = tokenContracts[0]
      const tokenId = tokenIds[0]
      const itemPrice = itemPrices[0]
      await tokenShop.connect(owner).setContractToIdToPrice([contract], [tokenId], [itemPrice])
      expect(await tokenShop.getPrice(contract, tokenId)).to.not.eq(ZERO)

      await tokenShop.connect(owner).setContractToIdToPrice([contract], [tokenId], [ZERO])

      expect(await tokenShop.getPrice(contract, tokenId)).to.eq(ZERO)
    })

    it('sets price to zero for multiple items', async () => {
      await tokenShop.connect(owner).setContractToIdToPrice(tokenContracts, tokenIds, itemPrices)
      for (let i = 0; i < tokenContracts.length; i++) {
        expect(await tokenShop.getPrice(tokenContracts[i], tokenIds[i])).to.not.eq(ZERO)
      }
      const arrayOfZeroes = new Array(itemPrices.length).fill(ZERO)

      await tokenShop.connect(owner).setContractToIdToPrice(tokenContracts, tokenIds, arrayOfZeroes)

      for (let i = 0; i < tokenContracts.length; i++) {
        expect(await tokenShop.getPrice(tokenContracts[i], tokenIds[i])).to.eq(ZERO)
      }
    })

    it('is idempotent', async () => {
      for (let i = 0; i < tokenContracts.length; i++) {
        expect(await tokenShop.getPrice(tokenContracts[i], tokenIds[i])).to.not.eq(itemPrices[i])
      }

      await tokenShop.connect(owner).setContractToIdToPrice(tokenContracts, tokenIds, itemPrices)

      for (let i = 0; i < tokenContracts.length; i++) {
        expect(await tokenShop.getPrice(tokenContracts[i], tokenIds[i])).to.eq(itemPrices[i])
      }

      await tokenShop.connect(owner).setContractToIdToPrice(tokenContracts, tokenIds, itemPrices)

      for (let i = 0; i < tokenContracts.length; i++) {
        expect(await tokenShop.getPrice(tokenContracts[i], tokenIds[i])).to.eq(itemPrices[i])
      }
    })
  })

  describe('# setPaused', async () => {
    beforeEach(async () => {
      await setupTokenShop()
    })

    it('reverts if not owner', async () => {
      expect(await tokenShop.owner()).to.not.eq(user1.address)

      await expect(tokenShop.connect(user1).setPaused(true)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('pauses', async () => {
      expect(await tokenShop.isPaused()).to.eq(false)

      await tokenShop.connect(owner).setPaused(true)

      expect(await tokenShop.isPaused()).to.eq(true)
    })

    it('unpauses', async () => {
      await tokenShop.connect(owner).setPaused(true)
      expect(await tokenShop.isPaused()).to.eq(true)

      await tokenShop.connect(owner).setPaused(false)

      expect(await tokenShop.isPaused()).to.eq(false)
    })

    it('is idempotent', async () => {
      expect(await tokenShop.isPaused()).to.eq(false)

      await tokenShop.connect(owner).setPaused(true)

      expect(await tokenShop.isPaused()).to.eq(true)

      await tokenShop.connect(owner).setPaused(true)

      expect(await tokenShop.isPaused()).to.eq(true)
    })
  })

  describe('# setPurchaseHook', async () => {
    beforeEach(async () => {
      await setupTokenShop()
    })

    it('reverts if not owner', async () => {
      expect(await tokenShop.owner()).to.not.eq(user1.address)

      await expect(tokenShop.connect(user1).setPurchaseHook(JunkAddress)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('sets to non-zero address', async () => {
      expect(await tokenShop.getPurchaseHook()).to.not.eq(JunkAddress)
      expect(JunkAddress).to.not.equal(AddressZero)

      await tokenShop.connect(owner).setPurchaseHook(JunkAddress)

      expect(await tokenShop.getPurchaseHook()).to.eq(JunkAddress)
    })

    it('sets to zero address', async () => {
      await tokenShop.connect(owner).setPurchaseHook(JunkAddress)
      expect(await tokenShop.getPurchaseHook()).to.not.eq(AddressZero)

      await tokenShop.connect(owner).setPurchaseHook(AddressZero)

      expect(await tokenShop.getPurchaseHook()).to.eq(AddressZero)
    })

    it('is idempotent', async () => {
      expect(await tokenShop.getPurchaseHook()).to.not.eq(JunkAddress)

      await tokenShop.connect(owner).setPurchaseHook(JunkAddress)

      expect(await tokenShop.getPurchaseHook()).to.eq(JunkAddress)

      await tokenShop.connect(owner).setPurchaseHook(JunkAddress)

      expect(await tokenShop.getPurchaseHook()).to.eq(JunkAddress)
    })
  })

  describe('# purchase', async () => {
    let mockPurchaseHook: FakeContract<Contract>
    const tokenIds = [1, 1]
    const amounts = [2, 1]
    const erc1155Id = 1
    const erc1155Amount = 2
    const erc721Id = 1
    const erc721Amount = 1

    beforeEach(async () => {
      await setupTokenShop()
      await setupMockContracts()
      mockPurchaseHook = await smock.fake('PurchaseHook')
      tokenContracts = [mockERC1155.address, mockERC721.address]
      await mockERC1155.mint(tokenShop.address, tokenIds[0], amounts[0])
      await mockERC721.mint(tokenShop.address, tokenIds[1])
      await tokenShop.connect(owner).setPurchaseHook(mockPurchaseHook.address)
    })

    it('reverts if paused', async () => {
      await tokenShop.connect(owner).setPaused(true)
      expect(await tokenShop.isPaused()).to.be.eq(true)

      await expect(
        tokenShop.connect(user1).purchase(tokenContracts, tokenIds, amounts)
      ).revertedWith(revertReason('Token Shop: paused'))
    })

    it('reverts if token contract array length mismatch', async () => {
      const mismatchedContractArray = tokenContracts.slice(0, 1)
      expect(tokenIds.length).to.eq(amounts.length)
      expect(mismatchedContractArray.length).to.not.eq(tokenIds.length)
      expect(mismatchedContractArray.length).to.not.eq(amounts.length)

      await expect(
        tokenShop.connect(user1).purchase(mismatchedContractArray, tokenIds, amounts)
      ).revertedWith(revertReason('Array length mismatch'))
    })

    it('reverts if amount array length mismatch', async () => {
      const mismatchedAmountArray = amounts.slice(0, 1)
      expect(tokenIds.length).to.eq(tokenContracts.length)
      expect(mismatchedAmountArray.length).to.not.eq(tokenIds.length)
      expect(mismatchedAmountArray.length).to.not.eq(tokenContracts.length)

      await expect(
        tokenShop.connect(user1).purchase(tokenContracts, tokenIds, mismatchedAmountArray)
      ).revertedWith(revertReason('Array length mismatch'))
    })

    it('reverts if token id array length mismatch', async () => {
      const mismatchedTokenIdArray = amounts.slice(0, 1)
      expect(amounts.length).to.eq(tokenContracts.length)
      expect(mismatchedTokenIdArray.length).to.not.eq(amounts.length)
      expect(mismatchedTokenIdArray.length).to.not.eq(tokenContracts.length)

      await expect(
        tokenShop.connect(user1).purchase(tokenContracts, mismatchedTokenIdArray, amounts)
      ).revertedWith(revertReason('Array length mismatch'))
    })

    it('reverts if purchase hook is zero address', async () => {
      await tokenShop.connect(owner).setPurchaseHook(AddressZero)
      expect(await tokenShop.getPurchaseHook()).to.be.eq(AddressZero)

      await expect(
        tokenShop.connect(user1).purchase(tokenContracts, tokenIds, amounts)
      ).revertedWith(revertReason('Purchase hook not set'))
    })

    it('reverts if called contract neither ERC1155 nor ERC721', async () => {
      await expect(
        tokenShop.connect(user1).purchase([paymentToken.address], [tokenIds[0]], [amounts[0]])
      ).to.be.reverted
    })

    it('reverts if ERC1155 hook reverts', async () => {
      mockPurchaseHook.hookERC1155.reverts()

      await expect(tokenShop.connect(user1).purchase(tokenContracts, tokenIds, amounts)).to.be
        .reverted
    })

    it('reverts if ERC721 hook reverts', async () => {
      mockPurchaseHook.hookERC721.reverts()

      await expect(tokenShop.connect(user1).purchase(tokenContracts, tokenIds, amounts)).to.be
        .reverted
    })

    it("doesn't call ERC721 hook if only ERC1155 item", async () => {
      await tokenShop.connect(user1).purchase([mockERC1155.address], [erc1155Id], [erc1155Amount])

      expect(mockPurchaseHook.hookERC1155).to.have.been.called
      expect(mockPurchaseHook.hookERC721).to.not.have.been.called
    })

    it("doesn't call ERC1155 hook if only ERC721 item", async () => {
      await tokenShop.connect(user1).purchase([mockERC721.address], [erc721Id], [erc721Amount])

      expect(mockPurchaseHook.hookERC721).to.have.been.called
      expect(mockPurchaseHook.hookERC1155).to.not.have.been.called
    })

    it('transfers to user if single ERC1155 item', async () => {
      const tokenShopERC1155BalanceBefore = await mockERC1155.balanceOf(
        tokenShop.address,
        erc1155Id
      )
      const userERC1155BalanceBefore = await mockERC1155.balanceOf(user1.address, erc1155Id)

      await tokenShop.connect(user1).purchase([mockERC1155.address], [erc1155Id], [erc1155Amount])

      expect(await mockERC1155.balanceOf(tokenShop.address, erc1155Id)).to.be.eq(
        tokenShopERC1155BalanceBefore.sub(erc1155Amount)
      )
      expect(await mockERC1155.balanceOf(user1.address, erc1155Id)).to.be.eq(
        userERC1155BalanceBefore.add(erc1155Amount)
      )
    })

    it('transfers to user if multiple ERC1155 items', async () => {
      const erc1155Contracts = [mockERC1155.address, mockERC1155.address]
      const erc1155Ids = [1, 2]
      const erc1155Amounts = [1, 1]
      for (let i = 0; i < erc1155Contracts.length; i++) {
        await mockERC1155.mint(tokenShop.address, erc1155Ids[i], erc1155Amounts[i])
      }
      const tokenShopERC1155Id1BalanceBefore = await mockERC1155.balanceOf(
        tokenShop.address,
        erc1155Ids[0]
      )
      const tokenShopERC1155Id2BalanceBefore = await mockERC1155.balanceOf(
        tokenShop.address,
        erc1155Ids[1]
      )
      const userERC1155Id1BalanceBefore = await mockERC1155.balanceOf(user1.address, erc1155Ids[0])
      const userERC1155Id2BalanceBefore = await mockERC1155.balanceOf(user1.address, erc1155Ids[1])

      await tokenShop.connect(user1).purchase(erc1155Contracts, erc1155Ids, erc1155Amounts)

      expect(await mockERC1155.balanceOf(tokenShop.address, erc1155Ids[0])).to.be.eq(
        tokenShopERC1155Id1BalanceBefore.sub(erc1155Amounts[0])
      )
      expect(await mockERC1155.balanceOf(user1.address, erc1155Ids[0])).to.be.eq(
        userERC1155Id1BalanceBefore.add(erc1155Amounts[0])
      )
      expect(await mockERC1155.balanceOf(tokenShop.address, erc1155Ids[1])).to.be.eq(
        tokenShopERC1155Id2BalanceBefore.sub(erc1155Amounts[1])
      )
      expect(await mockERC1155.balanceOf(user1.address, erc1155Ids[1])).to.be.eq(
        userERC1155Id2BalanceBefore.add(erc1155Amounts[1])
      )
    })

    it('transfers to user if single ERC721 item', async () => {
      const tokenShopERC721BalanceBefore = await mockERC721.balanceOf(tokenShop.address)
      const userERC721BalanceBefore = await mockERC721.balanceOf(user1.address)

      await tokenShop.connect(user1).purchase([mockERC721.address], [erc721Id], [erc721Amount])

      expect(await mockERC721.balanceOf(tokenShop.address)).to.be.eq(
        tokenShopERC721BalanceBefore.sub(erc721Amount)
      )
      expect(await mockERC721.balanceOf(user1.address)).to.be.eq(
        userERC721BalanceBefore.add(erc721Amount)
      )
    })

    it('transfers to user if multiple ERC721 items', async () => {
      const erc721Contracts = [mockERC721.address, mockERC721.address]
      const erc721Amounts = [1, 1]
      const erc721Ids = [1, 2]
      // As id 1 is already minted in beforeEach
      await mockERC721.mint(tokenShop.address, 2)
      const tokenShopERC721BalanceBefore = await mockERC721.balanceOf(tokenShop.address)
      const userERC721BalanceBefore = await mockERC721.balanceOf(user1.address)

      await tokenShop.connect(user1).purchase(erc721Contracts, erc721Ids, erc721Amounts)

      expect(await mockERC721.balanceOf(tokenShop.address)).to.be.eq(
        tokenShopERC721BalanceBefore.sub(2)
      )
      expect(await mockERC721.balanceOf(user1.address)).to.be.eq(userERC721BalanceBefore.add(2))
    })

    it('transfers to user if both ERC721 and ERC1155 items', async () => {
      const tokenShopERC1155BalanceBefore = await mockERC1155.balanceOf(
        tokenShop.address,
        tokenIds[0]
      )
      const userERC1155BalanceBefore = await mockERC1155.balanceOf(user1.address, tokenIds[1])
      const tokenShopERC721BalanceBefore = await mockERC721.balanceOf(tokenShop.address)
      const userERC721BalanceBefore = await mockERC721.balanceOf(user1.address)

      await tokenShop.connect(user1).purchase(tokenContracts, tokenIds, amounts)

      expect(await mockERC1155.balanceOf(tokenShop.address, tokenIds[0])).to.be.eq(
        tokenShopERC1155BalanceBefore.sub(amounts[0])
      )
      expect(await mockERC1155.balanceOf(user1.address, tokenIds[0])).to.be.eq(
        userERC1155BalanceBefore.add(amounts[0])
      )
      expect(await mockERC721.balanceOf(tokenShop.address)).to.be.eq(
        tokenShopERC721BalanceBefore.sub(amounts[1])
      )
      expect(await mockERC721.balanceOf(user1.address)).to.be.eq(
        userERC721BalanceBefore.add(amounts[1])
      )
    })
  })
  //TODO : add tests for onERC1155Received, onERC1155BatchReceived, and onERC721Received
  //TODO : add tests for tx.origin vs msg.sender
})
