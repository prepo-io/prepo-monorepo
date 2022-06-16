import chai, { expect } from 'chai'
import { ethers } from 'hardhat'
import { FakeContract, smock } from '@defi-wonderland/smock'
import { Contract } from '@defi-wonderland/smock/node_modules/ethers'
import { StakingRewardsDistribution } from '../types/generated'
import { stakingRewardsDistributionFixture } from './fixtures/StakingRewardsDistributionFixtures'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { MerkleTree } from 'merkletreejs'
import {
  revertReason,
  generateAccountAmountMerkleTree,
  JunkAddress,
  AddressZero,
  AccountAmountLeafNode,
  hashAccountAmountLeafNode,
  ZERO_HASH,
  ONE,
  ZERO,
} from './utils'
import { parseEther } from 'ethers/lib/utils'

chai.use(smock.matchers)
//TODO: rename AccountAmountLeafNode to AllocationLeafNode and similarly for hash and generateMerkleTree

describe('StakingRewardsDistribution', async () => {
  let deployer: SignerWithAddress
  let owner: SignerWithAddress
  let user1: SignerWithAddress
  let user2: SignerWithAddress
  let merkleTree: MerkleTree
  let stakingRewardsDistribution: StakingRewardsDistribution
  let ppoStaking: FakeContract<Contract>
  let eligibleNode1: AccountAmountLeafNode
  let eligibleNode2: AccountAmountLeafNode
  let eligibleNodes: Array<AccountAmountLeafNode>

  const setupStakingRewardsDistribution = async (): Promise<void> => {
    ;[deployer, user1, user2] = await ethers.getSigners()
    owner = deployer
    stakingRewardsDistribution = await stakingRewardsDistributionFixture()
    eligibleNode1 = {
      account: user1.address,
      amount: parseEther('0.1'),
    }
    eligibleNode2 = {
      account: user2.address,
      amount: parseEther('1'),
    }
    eligibleNodes = [eligibleNode1, eligibleNode2]
    merkleTree = generateAccountAmountMerkleTree(eligibleNodes)
  }

  describe('# initial state', async () => {
    beforeEach(async () => {
      await setupStakingRewardsDistribution()
    })

    it('sets deployer as owner', async () => {
      expect(await stakingRewardsDistribution.owner()).to.eq(deployer.address)
    })

    it('sets ppo staking to zero address', async () => {
      expect(await stakingRewardsDistribution.getPPOStaking()).to.eq(AddressZero)
    })

    it('sets root to zero hash', async () => {
      expect(await stakingRewardsDistribution.getMerkleTreeRoot()).to.eq(ZERO_HASH)
    })

    it('sets initial period number to zero', async () => {
      expect(await stakingRewardsDistribution.getPeriodNumber()).to.eq(ZERO)
    })
  })

  describe('# setPPOStaking', async () => {
    beforeEach(async () => {
      await setupStakingRewardsDistribution()
    })

    it('reverts if not owner', async () => {
      expect(await stakingRewardsDistribution.owner()).to.not.eq(user1.address)

      await expect(
        stakingRewardsDistribution.connect(user1).setPPOStaking(JunkAddress)
      ).revertedWith(revertReason('Ownable: caller is not the owner'))
    })

    it('sets to non-zero address', async () => {
      expect(await stakingRewardsDistribution.getPPOStaking()).to.not.eq(JunkAddress)
      expect(JunkAddress).to.not.eq(AddressZero)

      await stakingRewardsDistribution.connect(owner).setPPOStaking(JunkAddress)

      expect(await stakingRewardsDistribution.getPPOStaking()).to.eq(JunkAddress)
    })

    it('sets to zero address', async () => {
      await stakingRewardsDistribution.connect(owner).setPPOStaking(JunkAddress)
      expect(await stakingRewardsDistribution.getPPOStaking()).to.not.eq(AddressZero)

      await stakingRewardsDistribution.connect(owner).setPPOStaking(AddressZero)

      expect(await stakingRewardsDistribution.getPPOStaking()).to.eq(AddressZero)
    })

    it('is idempotent', async () => {
      expect(await stakingRewardsDistribution.getPPOStaking()).to.not.eq(JunkAddress)

      await stakingRewardsDistribution.connect(owner).setPPOStaking(JunkAddress)

      expect(await stakingRewardsDistribution.getPPOStaking()).to.eq(JunkAddress)

      await stakingRewardsDistribution.connect(owner).setPPOStaking(JunkAddress)

      expect(await stakingRewardsDistribution.getPPOStaking()).to.eq(JunkAddress)
    })
  })

  describe('# setMerkleTreeRoot', async () => {
    beforeEach(async () => {
      await setupStakingRewardsDistribution()
    })

    it('reverts if not owner', async () => {
      expect(await stakingRewardsDistribution.owner()).to.not.eq(user1.address)

      await expect(
        stakingRewardsDistribution.connect(user1).setMerkleTreeRoot(merkleTree.getHexRoot())
      ).revertedWith(revertReason('Ownable: caller is not the owner'))
    })

    it('sets root to non-zero hash', async () => {
      expect(await stakingRewardsDistribution.getMerkleTreeRoot()).to.not.eq(
        merkleTree.getHexRoot()
      )
      expect(merkleTree.getHexRoot()).to.not.eq(ZERO_HASH)

      await stakingRewardsDistribution.connect(owner).setMerkleTreeRoot(merkleTree.getHexRoot())

      expect(await stakingRewardsDistribution.getMerkleTreeRoot()).to.eq(merkleTree.getHexRoot())
    })

    it('sets root to zero hash', async () => {
      await stakingRewardsDistribution.connect(owner).setMerkleTreeRoot(merkleTree.getHexRoot())
      expect(await stakingRewardsDistribution.getMerkleTreeRoot()).to.not.eq(ZERO_HASH)

      await stakingRewardsDistribution.connect(owner).setMerkleTreeRoot(ZERO_HASH)

      expect(await stakingRewardsDistribution.getMerkleTreeRoot()).to.eq(ZERO_HASH)
    })

    it('is idempotent', async () => {
      expect(await stakingRewardsDistribution.getMerkleTreeRoot()).to.not.eq(
        merkleTree.getHexRoot()
      )

      await stakingRewardsDistribution.connect(owner).setMerkleTreeRoot(merkleTree.getHexRoot())

      expect(await stakingRewardsDistribution.getMerkleTreeRoot()).to.eq(merkleTree.getHexRoot())

      await stakingRewardsDistribution.connect(owner).setMerkleTreeRoot(merkleTree.getHexRoot())

      expect(await stakingRewardsDistribution.getMerkleTreeRoot()).to.eq(merkleTree.getHexRoot())
    })

    it('increments periodNumber by 1', async () => {
      const periodNumberBefore = await stakingRewardsDistribution.getPeriodNumber()

      await stakingRewardsDistribution.connect(owner).setMerkleTreeRoot(merkleTree.getHexRoot())

      expect(await stakingRewardsDistribution.getPeriodNumber()).to.eq(periodNumberBefore.add(1))
    })

    it('emits RootUpdate', async () => {
      const periodNumberBefore = await stakingRewardsDistribution.getPeriodNumber()

      const tx = await stakingRewardsDistribution
        .connect(owner)
        .setMerkleTreeRoot(merkleTree.getHexRoot())

      await expect(tx)
        .to.emit(stakingRewardsDistribution, 'RootUpdate')
        .withArgs(merkleTree.getHexRoot(), periodNumberBefore.add(1))
    })
    //TODO: Write a test to verify that setting a new merkle tree root will result in a previously true hasClaimed becoming false
  })

  describe('# claim', async () => {
    beforeEach(async () => {
      await setupStakingRewardsDistribution()
      await stakingRewardsDistribution.connect(owner).setMerkleTreeRoot(merkleTree.getHexRoot())
      ppoStaking = await smock.fake('PPOStaking')
      await stakingRewardsDistribution.connect(owner).setPPOStaking(ppoStaking.address)
    })

    it('reverts if already claimed', async () => {
      const proof = merkleTree.getHexProof(hashAccountAmountLeafNode(eligibleNode1))
      await stakingRewardsDistribution
        .connect(user1)
        .claim(eligibleNode1.account, eligibleNode1.amount, proof)
      expect(await stakingRewardsDistribution.hasClaimed(eligibleNode1.account)).to.be.eq(true)

      await expect(
        stakingRewardsDistribution
          .connect(user1)
          .claim(eligibleNode1.account, eligibleNode1.amount, proof)
      ).revertedWith(revertReason('Already claimed'))
    })

    it("reverts if node doesn't exist (amount exists, but incorrect account)", async () => {
      const incorrectAccount = JunkAddress
      const ineligibleNode = {
        ...eligibleNode1,
        account: incorrectAccount,
      }
      expect(eligibleNodes).to.not.contain(ineligibleNode)
      const proof = merkleTree.getHexProof(hashAccountAmountLeafNode(ineligibleNode))

      await expect(
        stakingRewardsDistribution
          .connect(user1)
          .claim(ineligibleNode.account, ineligibleNode.amount, proof)
      ).revertedWith(revertReason('Invalid claim'))
    })

    it("reverts if node doesn't exist (account exists, but incorrect amount)", async () => {
      const incorrectAmount = eligibleNode1.amount.add(ONE)
      const ineligibleNode = {
        ...eligibleNode1,
        amount: incorrectAmount,
      }
      expect(eligibleNodes).to.not.contain(ineligibleNode)
      const proof = merkleTree.getHexProof(hashAccountAmountLeafNode(ineligibleNode))

      await expect(
        stakingRewardsDistribution
          .connect(user1)
          .claim(ineligibleNode.account, ineligibleNode.amount, proof)
      ).revertedWith(revertReason('Invalid claim'))
    })

    it("reverts if node doesn't exist (account and amount both incorrect)", async () => {
      const incorrectAccount = JunkAddress
      const incorrectAmount = eligibleNode1.amount.add(ONE)
      const ineligibleNode = {
        account: incorrectAccount,
        amount: incorrectAmount,
      }
      expect(eligibleNodes).to.not.contain(ineligibleNode)
      const proof = merkleTree.getHexProof(hashAccountAmountLeafNode(ineligibleNode))

      await expect(
        stakingRewardsDistribution
          .connect(user1)
          .claim(ineligibleNode.account, ineligibleNode.amount, proof)
      ).revertedWith(revertReason('Invalid claim'))
    })

    it('calls stake from ppoStaking', async () => {
      const proof = merkleTree.getHexProof(hashAccountAmountLeafNode(eligibleNode1))

      await stakingRewardsDistribution
        .connect(user1)
        .claim(eligibleNode1.account, eligibleNode1.amount, proof)

      expect(ppoStaking.stake).to.have.been.calledWith(eligibleNode1.account, eligibleNode1.amount)
    })

    it('records that account has claimed', async () => {
      const proof = merkleTree.getHexProof(hashAccountAmountLeafNode(eligibleNode1))
      expect(await stakingRewardsDistribution.hasClaimed(eligibleNode1.account)).to.be.eq(false)

      await stakingRewardsDistribution
        .connect(user1)
        .claim(eligibleNode1.account, eligibleNode1.amount, proof)

      expect(await stakingRewardsDistribution.hasClaimed(eligibleNode1.account)).to.be.eq(true)
    })

    it('emits RewardClaim', async () => {
      const proof = merkleTree.getHexProof(hashAccountAmountLeafNode(eligibleNode1))
      expect(await stakingRewardsDistribution.hasClaimed(eligibleNode1.account)).to.be.eq(false)
      const periodNumber = await stakingRewardsDistribution.getPeriodNumber()

      const tx = await stakingRewardsDistribution
        .connect(user1)
        .claim(eligibleNode1.account, eligibleNode1.amount, proof)

      await expect(tx)
        .to.emit(stakingRewardsDistribution, 'RewardClaim')
        .withArgs(eligibleNode1.account, eligibleNode1.amount, periodNumber)
    })

    it('allows caller to claim on behalf of another account', async () => {
      const proof = merkleTree.getHexProof(hashAccountAmountLeafNode(eligibleNode2))
      expect(await stakingRewardsDistribution.hasClaimed(eligibleNode2.account)).to.be.eq(false)
      const periodNumber = await stakingRewardsDistribution.getPeriodNumber()
      expect(user1.address).to.not.eq(eligibleNode2.account)

      const tx = await stakingRewardsDistribution
        .connect(user1)
        .claim(eligibleNode2.account, eligibleNode2.amount, proof)

      expect(ppoStaking.stake).to.have.been.calledWith(eligibleNode2.account, eligibleNode2.amount)
      expect(await stakingRewardsDistribution.hasClaimed(eligibleNode2.account)).to.be.eq(true)
      await expect(tx)
        .to.emit(stakingRewardsDistribution, 'RewardClaim')
        .withArgs(eligibleNode2.account, eligibleNode2.amount, periodNumber)
    })
    //TODO: Write an 'integration test' (where we test the full flow with no mocks)
  })
})
