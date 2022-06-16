import { expect } from 'chai'
import { ethers } from 'hardhat'
import { PregenesisPoints } from '../types/generated'
import { pregenesisPointsFixture } from './fixtures/PregenesisPointsFixtures'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { MerkleTree } from 'merkletreejs'
import {
  revertReason,
  AddressZero,
  JunkAddress,
  ONE,
  generateAccountAmountMerkleTree,
  AccountAmountLeafNode,
  hashAccountAmountLeafNode,
} from './utils'
import { parseEther } from '@ethersproject/units'

describe('PregenesisPoints', () => {
  let deployer: SignerWithAddress
  let owner: SignerWithAddress
  let user1: SignerWithAddress
  let user2: SignerWithAddress
  let shop: SignerWithAddress
  let merkleTree: MerkleTree
  let eligibleNode1: AccountAmountLeafNode
  let eligibleNode2: AccountAmountLeafNode
  const zeroHash = ethers.utils.formatBytes32String('')
  let points: PregenesisPoints
  const TOKEN_NAME = `Pregenesis Points`
  const TOKEN_SYMBOL = 'PP'

  const setupPregenesisPoints = async (): Promise<void> => {
    ;[deployer, owner, user1, user2, shop] = await ethers.getSigners()
    points = await pregenesisPointsFixture(owner.address, TOKEN_NAME, TOKEN_SYMBOL)
    eligibleNode1 = {
      account: user1.address,
      amount: parseEther('0.1'),
    }
    eligibleNode2 = {
      account: user2.address,
      amount: parseEther('1'),
    }
    const eligibleNodes = [eligibleNode1, eligibleNode2]
    merkleTree = generateAccountAmountMerkleTree(eligibleNodes)
  }

  describe('initial state', async () => {
    before(async () => {
      await setupPregenesisPoints()
    })

    it('sets owner from constructor', async () => {
      expect(await points.owner()).to.not.eq(deployer.address)
      expect(await points.owner()).to.eq(owner.address)
    })

    it('sets name from constructor', async () => {
      expect(await points.name()).to.eq(TOKEN_NAME)
    })

    it('sets symbol from constructor', async () => {
      expect(await points.symbol()).to.eq(TOKEN_SYMBOL)
    })

    it('sets shop as zero address', async () => {
      expect(await points.getShop()).to.eq(AddressZero)
    })
  })

  describe('# setShop', async () => {
    beforeEach(async () => {
      await setupPregenesisPoints()
    })

    it('reverts if not owner', async () => {
      expect(await points.owner()).to.not.eq(user1.address)
      await expect(points.connect(user1).setShop(JunkAddress)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('sets to non-zero address', async () => {
      expect(await points.connect(owner).getShop()).to.not.eq(JunkAddress)

      await points.connect(owner).setShop(JunkAddress)

      expect(await points.connect(owner).getShop()).to.eq(JunkAddress)
      expect(await points.connect(owner).getShop()).to.not.eq(AddressZero)
    })

    it('sets to zero address', async () => {
      await points.connect(owner).setShop(JunkAddress)
      expect(await points.connect(owner).getShop()).to.not.eq(AddressZero)

      await points.connect(owner).setShop(AddressZero)

      expect(await points.connect(owner).getShop()).to.eq(AddressZero)
    })

    it('is idempotent', async () => {
      expect(await points.connect(owner).getShop()).to.not.eq(JunkAddress)

      await points.connect(owner).setShop(JunkAddress)

      expect(await points.connect(owner).getShop()).to.eq(JunkAddress)

      await points.connect(owner).setShop(JunkAddress)

      expect(await points.connect(owner).getShop()).to.eq(JunkAddress)
    })
  })

  describe('# setMerkleTreeRoot', async () => {
    beforeEach(async () => {
      await setupPregenesisPoints()
    })

    it('reverts if not owner', async () => {
      expect(await points.owner()).to.not.eq(user1.address)

      await expect(points.connect(user1).setMerkleTreeRoot(merkleTree.getHexRoot())).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('sets root to non-zero hash', async () => {
      expect(await points.getMerkleTreeRoot()).to.not.eq(merkleTree.getHexRoot())
      expect(merkleTree.getHexRoot()).to.not.eq(zeroHash)

      await points.connect(owner).setMerkleTreeRoot(merkleTree.getHexRoot())

      expect(await points.getMerkleTreeRoot()).to.eq(merkleTree.getHexRoot())
    })

    it('sets root to zero hash', async () => {
      await points.connect(owner).setMerkleTreeRoot(merkleTree.getHexRoot())
      expect(await points.getMerkleTreeRoot()).to.not.eq(zeroHash)

      await points.connect(owner).setMerkleTreeRoot(zeroHash)

      expect(await points.getMerkleTreeRoot()).to.eq(zeroHash)
    })

    it('is idempotent', async () => {
      expect(await points.getMerkleTreeRoot()).to.not.eq(merkleTree.getHexRoot())

      await points.connect(owner).setMerkleTreeRoot(merkleTree.getHexRoot())

      expect(await points.getMerkleTreeRoot()).to.eq(merkleTree.getHexRoot())

      await points.connect(owner).setMerkleTreeRoot(merkleTree.getHexRoot())

      expect(await points.getMerkleTreeRoot()).to.eq(merkleTree.getHexRoot())
    })
  })

  describe('# mint', async () => {
    beforeEach(async () => {
      await setupPregenesisPoints()
      await points.connect(owner).setShop(shop.address)
    })

    it('reverts if not owner', async () => {
      expect(await points.owner()).to.not.eq(user1.address)

      await expect(points.connect(user1).mint(user1.address, ONE)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('reverts if shop tries to mint', async () => {
      expect(await points.owner()).to.not.eq(shop.address)

      await expect(points.connect(shop).mint(user1.address, ONE)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('reverts if minting to zero address', async () => {
      await expect(points.connect(owner).mint(AddressZero, ONE)).revertedWith(
        revertReason('ERC20: mint to the zero address')
      )
    })

    it('increases non-caller balance', async () => {
      const nonCallerPPBalanceBefore = await points.balanceOf(user1.address)
      expect(owner).to.not.eq(user1)

      await points.connect(owner).mint(user1.address, ONE)

      expect(await points.balanceOf(user1.address)).to.eq(nonCallerPPBalanceBefore.add(ONE))
    })

    it('increases caller balance', async () => {
      const callerPPBalanceBefore = await points.balanceOf(owner.address)

      await points.connect(owner).mint(owner.address, ONE)

      expect(await points.balanceOf(owner.address)).to.eq(callerPPBalanceBefore.add(ONE))
    })
  })
  /**
   * TODO: Add tests for transfer, transferFrom using smock to test for intended behavior
   * of `_beforeTokenTransfer()`
   */
  describe('# burn', async () => {
    beforeEach(async () => {
      await setupPregenesisPoints()
      await points.connect(owner).setShop(shop.address)
    })

    it('reverts if not owner', async () => {
      expect(await points.owner()).to.not.eq(user1.address)
      await points.connect(owner).mint(user1.address, ONE)
      expect(await points.balanceOf(user1.address)).to.be.gte(ONE)

      await expect(points.connect(user1).burn(user1.address, ONE)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('reverts if shop tries to burn', async () => {
      await points.connect(owner).mint(shop.address, ONE)
      expect(await points.balanceOf(shop.address)).to.be.gte(ONE)
      expect(await points.owner()).to.not.eq(shop.address)

      await expect(points.connect(shop).burn(user1.address, ONE)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('reverts if burn from zero address', async () => {
      await expect(points.connect(owner).burn(AddressZero, ONE)).revertedWith(
        revertReason('ERC20: burn from the zero address')
      )
    })

    it('reverts if amount > balance', async () => {
      await points.connect(owner).mint(user1.address, ONE)
      const userPPBalance = await points.balanceOf(user1.address)

      await expect(points.connect(owner).burn(user1.address, userPPBalance.add(ONE))).revertedWith(
        revertReason('ERC20: burn amount exceeds balance')
      )
    })

    it('decreases non-caller balance', async () => {
      await points.connect(owner).mint(user1.address, ONE)
      const nonCallerPPBalanceBefore = await points.balanceOf(user1.address)

      await points.connect(owner).burn(user1.address, ONE)

      expect(await points.balanceOf(user1.address)).to.eq(nonCallerPPBalanceBefore.sub(ONE))
    })

    it('decreases caller balance', async () => {
      await points.connect(owner).mint(owner.address, ONE)
      const callerPPBalanceBefore = await points.balanceOf(owner.address)

      await points.connect(owner).burn(owner.address, ONE)

      expect(await points.balanceOf(owner.address)).to.eq(callerPPBalanceBefore.sub(ONE))
    })
  })

  describe('# claim', async () => {
    beforeEach(async () => {
      await setupPregenesisPoints()
      await points.connect(owner).setMerkleTreeRoot(merkleTree.getHexRoot())
    })

    it('reverts if already claimed', async () => {
      const proof = merkleTree.getHexProof(hashAccountAmountLeafNode(eligibleNode1))
      await points.connect(user1).claim(eligibleNode1.amount, proof)
      expect(await points.hasClaimed(eligibleNode1.account)).to.be.eq(true)

      await expect(points.connect(user1).claim(eligibleNode1.amount, proof)).revertedWith(
        revertReason('Already claimed')
      )
    })

    it('reverts if wrong account', async () => {
      const invalidAccount = shop.address
      const ineligibleNode = {
        ...eligibleNode1,
        account: invalidAccount,
      }
      const proof = merkleTree.getHexProof(hashAccountAmountLeafNode(ineligibleNode))

      await expect(points.connect(user1).claim(ineligibleNode.amount, proof)).revertedWith(
        revertReason('Invalid claim')
      )
    })

    it('reverts if wrong amount', async () => {
      const wrongAmount = eligibleNode1.amount.add(parseEther('0.1'))
      const ineligibleNode = {
        ...eligibleNode1,
        amount: wrongAmount,
      }
      const proof = merkleTree.getHexProof(hashAccountAmountLeafNode(ineligibleNode))

      await expect(points.connect(user1).claim(ineligibleNode.amount, proof)).revertedWith(
        revertReason('Invalid claim')
      )
    })

    it('increases user PP balance', async () => {
      const proof = merkleTree.getHexProof(hashAccountAmountLeafNode(eligibleNode1))
      const eligibleNodeBalanceBefore = await points.balanceOf(eligibleNode1.account)

      await points.connect(user1).claim(eligibleNode1.amount, proof)

      expect(await points.balanceOf(eligibleNode1.account)).to.be.equal(
        eligibleNodeBalanceBefore.add(eligibleNode1.amount)
      )
    })

    it('sets userToClaimed', async () => {
      const proof = merkleTree.getHexProof(hashAccountAmountLeafNode(eligibleNode1))
      expect(await points.hasClaimed(eligibleNode1.account)).to.be.equal(false)

      await points.connect(user1).claim(eligibleNode1.amount, proof)

      expect(await points.hasClaimed(eligibleNode1.account)).to.be.equal(true)
    })
  })
})
