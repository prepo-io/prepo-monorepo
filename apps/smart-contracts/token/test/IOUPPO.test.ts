import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { MerkleTree } from 'merkletreejs'
import { ZERO_ADDRESS } from 'prepo-constants'
import { iouPPOFixture } from './fixtures/IOUPPOFixtures'
import { ppoDeployFixture } from './fixtures/PPOFixture'
import { mockERC20Fixture } from './fixtures/MockERC20Fixtures'
import {
  IOUPPOLeafNode,
  hashIOUPPOLeafNode,
  generateMerkleTreeIOUPPO,
  revertReason,
} from '../utils'
import { IOUPPO, PPO, MockERC20 } from '../types/generated'

const { parseEther } = ethers.utils

describe('IOUPPO', () => {
  let deployer: SignerWithAddress
  let owner: SignerWithAddress
  let userNotStaked: SignerWithAddress
  let userStaked: SignerWithAddress
  let ppoStaking: SignerWithAddress
  let iouPPO: IOUPPO
  let ppo: PPO
  let mockERC20: MockERC20
  let merkleTree: MerkleTree
  let eligibleNodeStaked: IOUPPOLeafNode
  let eligibleNodeNotStaked: IOUPPOLeafNode
  let shouldStake: boolean
  const ppoAmountForIOUPPO = parseEther('1000')

  const setupIOUPPO = async (): Promise<void> => {
    ;[deployer, owner, userNotStaked, userStaked, ppoStaking] = await ethers.getSigners()
    iouPPO = await iouPPOFixture(owner.address)
    eligibleNodeStaked = {
      account: userStaked.address,
      amount: parseEther('0.1'),
      staked: true,
    }
    eligibleNodeNotStaked = {
      account: userNotStaked.address,
      amount: parseEther('1'),
      staked: false,
    }
    const eligibleNodes = [eligibleNodeStaked, eligibleNodeNotStaked]
    merkleTree = generateMerkleTreeIOUPPO(eligibleNodes)
    ppo = await ppoDeployFixture()
  }

  describe('# initialize', () => {
    before(async () => {
      await setupIOUPPO()
    })

    it('sets owner from initialize', async () => {
      expect(await iouPPO.owner()).to.not.eq(deployer.address)

      expect(await iouPPO.owner()).to.eq(owner.address)
    })

    it('sets name from initialize', async () => {
      expect(await iouPPO.name()).to.eq('IOU PPO Token')
    })

    it('sets symbol from initialize', async () => {
      expect(await iouPPO.symbol()).to.eq('IOUPPO')
    })
  })

  describe('# setPPOToken', () => {
    beforeEach(async () => {
      await setupIOUPPO()
    })

    it('reverts if not owner', () => {
      expect(iouPPO.setPPOToken(ppo.address)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('sets PPO address to zero address', async () => {
      await iouPPO.connect(owner).setPPOToken(ppo.address)
      expect(await iouPPO.connect(owner).getPPOToken()).to.not.eq(ZERO_ADDRESS)

      await iouPPO.connect(owner).setPPOToken(ZERO_ADDRESS)

      expect(await iouPPO.connect(owner).getPPOToken()).to.eq(ZERO_ADDRESS)
    })

    it('sets PPO address to non-zero address', async () => {
      expect(await iouPPO.connect(owner).getPPOToken()).to.not.eq(ppo.address)

      await iouPPO.connect(owner).setPPOToken(ppo.address)

      expect(await iouPPO.connect(owner).getPPOToken()).to.eq(ppo.address)
      expect(await iouPPO.connect(owner).getPPOToken()).to.not.eq(ZERO_ADDRESS)
    })

    it('is idempotent', async () => {
      expect(await iouPPO.connect(owner).getPPOToken()).to.not.eq(ppo.address)

      await iouPPO.connect(owner).setPPOToken(ppo.address)

      expect(await iouPPO.connect(owner).getPPOToken()).to.eq(ppo.address)

      await iouPPO.connect(owner).setPPOToken(ppo.address)

      expect(await iouPPO.connect(owner).getPPOToken()).to.eq(ppo.address)
    })
  })

  describe('# setPPOStaking', () => {
    beforeEach(async () => {
      await setupIOUPPO()
    })

    it('reverts if not owner', () => {
      expect(iouPPO.setPPOStaking(ppoStaking.address)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('sets PPO Staking address to zero address', async () => {
      await iouPPO.connect(owner).setPPOStaking(ppoStaking.address)
      expect(await iouPPO.connect(owner).getPPOStaking()).to.not.eq(ZERO_ADDRESS)

      await iouPPO.connect(owner).setPPOStaking(ZERO_ADDRESS)

      expect(await iouPPO.connect(owner).getPPOStaking()).to.eq(ZERO_ADDRESS)
    })

    it('sets PPO Staking address to non-zero address', async () => {
      expect(await iouPPO.connect(owner).getPPOStaking()).to.not.eq(ppoStaking.address)

      await iouPPO.connect(owner).setPPOStaking(ppoStaking.address)

      expect(await iouPPO.connect(owner).getPPOStaking()).to.eq(ppoStaking.address)
      expect(await iouPPO.connect(owner).getPPOStaking()).to.not.eq(ZERO_ADDRESS)
    })

    it('is idempotent', async () => {
      expect(await iouPPO.connect(owner).getPPOStaking()).to.not.eq(ppoStaking.address)

      await iouPPO.connect(owner).setPPOStaking(ppoStaking.address)

      expect(await iouPPO.connect(owner).getPPOStaking()).to.eq(ppoStaking.address)

      await iouPPO.connect(owner).setPPOStaking(ppoStaking.address)

      expect(await iouPPO.connect(owner).getPPOStaking()).to.eq(ppoStaking.address)
    })
  })

  describe('# setPaused', () => {
    beforeEach(async () => {
      await setupIOUPPO()
    })

    it('reverts if not owner', () => {
      expect(iouPPO.setPaused(true)).revertedWith(revertReason('Ownable: caller is not the owner'))
    })

    it('pauses', async () => {
      expect(await iouPPO.connect(owner).getPaused()).to.eq(false)

      await iouPPO.connect(owner).setPaused(true)

      expect(await iouPPO.connect(owner).getPaused()).to.eq(true)
    })

    it('unpauses', async () => {
      await iouPPO.connect(owner).setPaused(true)
      expect(await iouPPO.connect(owner).getPaused()).to.eq(true)

      await iouPPO.connect(owner).setPaused(false)

      expect(await iouPPO.connect(owner).getPaused()).to.eq(false)
    })

    it('is idempotent', async () => {
      expect(await iouPPO.connect(owner).getPaused()).to.eq(false)

      await iouPPO.connect(owner).setPaused(true)

      expect(await iouPPO.connect(owner).getPaused()).to.eq(true)

      await iouPPO.connect(owner).setPaused(true)

      expect(await iouPPO.connect(owner).getPaused()).to.eq(true)
    })

    it('emits PausedChanged event', async () => {
      const tx = await iouPPO.connect(owner).setPaused(true)

      await expect(tx).to.emit(iouPPO, 'PausedChanged(bool)').withArgs(true)
    })
  })

  describe('# setMerkleTreeRoot', () => {
    beforeEach(async () => {
      await setupIOUPPO()
    })

    it('reverts if not owner', () => {
      expect(iouPPO.setMerkleTreeRoot(merkleTree.getHexRoot())).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('sets root to non-zero hash', async () => {
      expect(await iouPPO.getMerkleTreeRoot()).to.not.equal(merkleTree.getHexRoot())

      await iouPPO.connect(owner).setMerkleTreeRoot(merkleTree.getHexRoot())

      expect(await iouPPO.getMerkleTreeRoot()).to.equal(merkleTree.getHexRoot())
    })

    it('sets root to zero hash', async () => {
      const zeroHash = ethers.utils.formatBytes32String('')
      await iouPPO.connect(owner).setMerkleTreeRoot(merkleTree.getHexRoot())
      expect(await iouPPO.getMerkleTreeRoot()).to.not.equal(zeroHash)

      await iouPPO.connect(owner).setMerkleTreeRoot(zeroHash)

      expect(await iouPPO.getMerkleTreeRoot()).to.equal(zeroHash)
    })

    it('is idempotent', async () => {
      expect(await iouPPO.getMerkleTreeRoot()).to.not.equal(merkleTree.getHexRoot())

      await iouPPO.connect(owner).setMerkleTreeRoot(merkleTree.getHexRoot())

      expect(await iouPPO.getMerkleTreeRoot()).to.equal(merkleTree.getHexRoot())

      await iouPPO.connect(owner).setMerkleTreeRoot(merkleTree.getHexRoot())

      expect(await iouPPO.getMerkleTreeRoot()).to.equal(merkleTree.getHexRoot())
    })
  })

  describe('# claim', () => {
    beforeEach(async () => {
      await setupIOUPPO()
      await iouPPO.connect(owner).setMerkleTreeRoot(merkleTree.getHexRoot())
    })

    it('reverts if paused', async () => {
      await iouPPO.connect(owner).setPaused(true)
      const proof = merkleTree.getHexProof(hashIOUPPOLeafNode(eligibleNodeStaked))

      expect(
        iouPPO
          .connect(userStaked)
          .claim(eligibleNodeStaked.amount, eligibleNodeStaked.staked, proof)
      ).revertedWith(revertReason('paused'))
    })

    it('reverts if already claimed', async () => {
      const proof = merkleTree.getHexProof(hashIOUPPOLeafNode(eligibleNodeStaked))
      await iouPPO
        .connect(userStaked)
        .claim(eligibleNodeStaked.amount, eligibleNodeStaked.staked, proof)

      await expect(
        iouPPO
          .connect(userStaked)
          .claim(eligibleNodeStaked.amount, eligibleNodeStaked.staked, proof)
      ).revertedWith(revertReason('Already claimed'))
    })

    it('reverts if wrong account', () => {
      const invalidAccount = owner.address
      const ineligibleNode = {
        ...eligibleNodeStaked,
        account: invalidAccount,
      }
      const proof = merkleTree.getHexProof(hashIOUPPOLeafNode(ineligibleNode))

      expect(
        iouPPO.connect(userStaked).claim(ineligibleNode.amount, ineligibleNode.staked, proof)
      ).revertedWith(revertReason('Invalid claim'))
    })

    it('reverts if staker and hasStaked is false', () => {
      const falseStakingInfo = !eligibleNodeStaked.staked
      const ineligibleNode = {
        ...eligibleNodeStaked,
        staked: falseStakingInfo,
      }
      const proof = merkleTree.getHexProof(hashIOUPPOLeafNode(ineligibleNode))

      expect(
        iouPPO.connect(userStaked).claim(ineligibleNode.amount, ineligibleNode.staked, proof)
      ).revertedWith(revertReason('Invalid claim'))
    })

    it('reverts if non-staker and hasStaked is true', () => {
      const falseStakingInfo = !eligibleNodeNotStaked.staked
      const ineligibleNode = {
        ...eligibleNodeNotStaked,
        staked: falseStakingInfo,
      }
      const proof = merkleTree.getHexProof(hashIOUPPOLeafNode(ineligibleNode))

      expect(
        iouPPO.connect(userNotStaked).claim(ineligibleNode.amount, ineligibleNode.staked, proof)
      ).revertedWith(revertReason('Invalid claim'))
    })

    it('reverts if wrong amount', () => {
      const falseAmount = eligibleNodeStaked.amount.add(parseEther('0.1'))
      const ineligibleNode = {
        ...eligibleNodeStaked,
        amount: falseAmount,
      }
      const proof = merkleTree.getHexProof(hashIOUPPOLeafNode(ineligibleNode))

      expect(
        iouPPO.connect(userStaked).claim(ineligibleNode.amount, ineligibleNode.staked, proof)
      ).revertedWith(revertReason('Invalid claim'))
    })

    it('increases IOUPPO balance', async () => {
      const proof = merkleTree.getHexProof(hashIOUPPOLeafNode(eligibleNodeStaked))
      expect(await iouPPO.balanceOf(eligibleNodeStaked.account)).to.be.equal(0)

      await iouPPO
        .connect(userStaked)
        .claim(eligibleNodeStaked.amount, eligibleNodeStaked.staked, proof)

      expect(await iouPPO.balanceOf(eligibleNodeStaked.account)).to.be.equal(
        eligibleNodeStaked.amount
      )
    })

    it('sets hasClaimed', async () => {
      const proof = merkleTree.getHexProof(hashIOUPPOLeafNode(eligibleNodeStaked))
      expect(await iouPPO.hasClaimed(eligibleNodeStaked.account)).to.be.equal(false)

      await iouPPO
        .connect(userStaked)
        .claim(eligibleNodeStaked.amount, eligibleNodeStaked.staked, proof)

      expect(await iouPPO.hasClaimed(eligibleNodeStaked.account)).to.be.equal(true)
    })

    it('sets hasStaked to true if staker', async () => {
      const proof = merkleTree.getHexProof(hashIOUPPOLeafNode(eligibleNodeStaked))
      expect(await iouPPO.hasStaked(eligibleNodeStaked.account)).to.be.equal(false)

      await iouPPO
        .connect(userStaked)
        .claim(eligibleNodeStaked.amount, eligibleNodeStaked.staked, proof)

      expect(await iouPPO.hasStaked(eligibleNodeStaked.account)).to.be.equal(true)
    })

    it('keeps hasStaked as false if non-staker', async () => {
      const proof = merkleTree.getHexProof(hashIOUPPOLeafNode(eligibleNodeNotStaked))
      expect(await iouPPO.hasStaked(eligibleNodeNotStaked.account)).to.be.equal(false)

      await iouPPO
        .connect(userNotStaked)
        .claim(eligibleNodeNotStaked.amount, eligibleNodeNotStaked.staked, proof)

      expect(await iouPPO.hasStaked(eligibleNodeNotStaked.account)).to.be.equal(false)
    })
  })

  describe('# convert', () => {
    beforeEach(async () => {
      await setupIOUPPO()
      await iouPPO.connect(owner).setMerkleTreeRoot(merkleTree.getHexRoot())
      const proofStaked = merkleTree.getHexProof(hashIOUPPOLeafNode(eligibleNodeStaked))
      await iouPPO
        .connect(userStaked)
        .claim(eligibleNodeStaked.amount, eligibleNodeStaked.staked, proofStaked)
      const proofNotStaked = merkleTree.getHexProof(hashIOUPPOLeafNode(eligibleNodeNotStaked))
      await iouPPO
        .connect(userNotStaked)
        .claim(eligibleNodeNotStaked.amount, eligibleNodeNotStaked.staked, proofNotStaked)
    })

    it('reverts if paused', async () => {
      await iouPPO.connect(owner).setPaused(true)
      expect(await iouPPO.getPaused()).to.be.equal(true)

      expect(iouPPO.connect(userNotStaked).convert(shouldStake)).revertedWith(
        revertReason('paused')
      )
    })

    it('reverts if PPO address not set', async () => {
      expect(await iouPPO.getPPOToken()).to.be.equal(ZERO_ADDRESS)
      expect(iouPPO.connect(userNotStaked).convert(shouldStake)).revertedWith(
        revertReason('PPO address not set')
      )
    })

    it('reverts if caller IOUPPO balance = 0', async () => {
      await iouPPO.connect(owner).setPPOToken(ppo.address)
      expect(await iouPPO.balanceOf(owner.address)).to.be.equal(0)

      expect(iouPPO.connect(owner).convert(shouldStake)).revertedWith(
        revertReason('IOUPPO balance = 0')
      )
    })

    it('reverts if contract PPO balance < caller IOUPPO balance', async () => {
      await iouPPO.connect(owner).setPPOToken(ppo.address)
      expect(await iouPPO.getPPOToken()).to.be.equal(ppo.address)

      expect(iouPPO.connect(userNotStaked).convert(shouldStake)).revertedWith(
        revertReason('Insufficient PPO in contract')
      )
    })

    it('reverts if staked and ppoStaking not set', async () => {
      await iouPPO.connect(owner).setPPOToken(ppo.address)
      expect(await iouPPO.getPPOToken()).to.be.equal(ppo.address)
      await ppo.connect(deployer).transfer(iouPPO.address, ppoAmountForIOUPPO)
      expect(await ppo.balanceOf(iouPPO.address)).to.be.equal(ppoAmountForIOUPPO)
      shouldStake = true

      expect(iouPPO.connect(userStaked).convert(shouldStake)).revertedWith(
        revertReason('PPOStaking address not set')
      )
    })

    it('burns caller entire IOUPPO balance', async () => {
      await iouPPO.connect(owner).setPPOToken(ppo.address)
      expect(await iouPPO.getPPOToken()).to.be.equal(ppo.address)
      await ppo.connect(deployer).transfer(iouPPO.address, ppoAmountForIOUPPO)
      expect(await ppo.balanceOf(iouPPO.address)).to.be.equal(ppoAmountForIOUPPO)
      shouldStake = false

      await iouPPO.connect(userNotStaked).convert(shouldStake)

      expect(await iouPPO.balanceOf(userNotStaked.address)).to.be.equal(0)
    })

    it('converts if not staked and caller balance = contract balance', async () => {
      await iouPPO.connect(owner).setPPOToken(ppo.address)
      expect(await iouPPO.getPPOToken()).to.be.equal(ppo.address)
      const callerIOUPPOBalance = await iouPPO.balanceOf(userNotStaked.address)
      await ppo.connect(deployer).transfer(iouPPO.address, callerIOUPPOBalance)
      expect(await ppo.balanceOf(iouPPO.address)).to.equal(callerIOUPPOBalance)
      const ppoBalanceBefore = await ppo.balanceOf(userNotStaked.address)
      const expectedIncrease = await iouPPO.balanceOf(userNotStaked.address)
      const expectedPPOBalanceAfter = ppoBalanceBefore.add(expectedIncrease)
      shouldStake = false

      await iouPPO.connect(userNotStaked).convert(shouldStake)

      expect(await ppo.balanceOf(userNotStaked.address)).to.be.equal(expectedPPOBalanceAfter)
    })

    it('converts if not staked and contract PPO balance > caller IOUPPO balance', async () => {
      await iouPPO.connect(owner).setPPOToken(ppo.address)
      expect(await iouPPO.getPPOToken()).to.be.equal(ppo.address)
      const callerIOUPPOBalance = await iouPPO.balanceOf(userNotStaked.address)
      await ppo.connect(deployer).transfer(iouPPO.address, ppoAmountForIOUPPO)
      expect(await ppo.balanceOf(iouPPO.address)).to.equal(ppoAmountForIOUPPO)
      expect(await ppo.balanceOf(iouPPO.address)).to.be.gte(callerIOUPPOBalance)
      const ppoBalanceBefore = await ppo.balanceOf(userNotStaked.address)
      const expectedIncrease = await iouPPO.balanceOf(userNotStaked.address)
      const expectedPPOBalanceAfter = ppoBalanceBefore.add(expectedIncrease)
      shouldStake = false

      await iouPPO.connect(userNotStaked).convert(shouldStake)

      expect(await ppo.balanceOf(userNotStaked.address)).to.be.equal(expectedPPOBalanceAfter)
    })

    it('converts if not staked and PPOStaking not set', async () => {
      await iouPPO.connect(owner).setPPOToken(ppo.address)
      expect(await iouPPO.getPPOToken()).to.be.equal(ppo.address)
      expect(await iouPPO.getPPOStaking()).to.be.equal(ZERO_ADDRESS)
      await ppo.connect(deployer).transfer(iouPPO.address, ppoAmountForIOUPPO)
      expect(await ppo.balanceOf(iouPPO.address)).to.equal(ppoAmountForIOUPPO)
      const ppoBalanceBefore = await ppo.balanceOf(userNotStaked.address)
      shouldStake = false
      const expectedIncrease = await iouPPO.balanceOf(userNotStaked.address)
      const expectedPPOBalanceAfter = ppoBalanceBefore.add(expectedIncrease)

      await iouPPO.connect(userNotStaked).convert(shouldStake)

      expect(await ppo.balanceOf(userNotStaked.address)).to.be.equal(expectedPPOBalanceAfter)
    })

    it('converts if not staked and PPOStaking set', async () => {
      await iouPPO.connect(owner).setPPOToken(ppo.address)
      expect(await iouPPO.getPPOToken()).to.be.equal(ppo.address)
      expect(await iouPPO.getPPOStaking()).to.be.equal(ZERO_ADDRESS)
      await iouPPO.connect(owner).setPPOStaking(ppoStaking.address)
      expect(await iouPPO.connect(owner).getPPOStaking()).to.eq(ppoStaking.address)
      await ppo.connect(deployer).transfer(iouPPO.address, ppoAmountForIOUPPO)
      expect(await ppo.balanceOf(iouPPO.address)).to.equal(ppoAmountForIOUPPO)
      const ppoBalanceBefore = await ppo.balanceOf(userNotStaked.address)
      shouldStake = false
      const expectedIncrease = await iouPPO.balanceOf(userNotStaked.address)
      const expectedPPOBalanceAfter = ppoBalanceBefore.add(expectedIncrease)

      await iouPPO.connect(userNotStaked).convert(shouldStake)

      expect(await ppo.balanceOf(userNotStaked.address)).to.be.equal(expectedPPOBalanceAfter)
    })
  })

  describe('# withdrawERC20', () => {
    beforeEach(async () => {
      await setupIOUPPO()
      const mockERC20Recipient = userNotStaked.address
      const mockERC20Decimal = 18
      const mockERC20InitialMint = parseEther('1000')
      mockERC20 = await mockERC20Fixture(
        'Mock ERC20',
        'MERC20',
        mockERC20Decimal,
        mockERC20Recipient,
        mockERC20InitialMint
      )
    })

    it('reverts if not owner', () => {
      const amountWithdrawn = parseEther('1')

      expect(iouPPO.withdrawERC20(ppo.address, amountWithdrawn)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('reverts if withdraw amount > balance', () => {
      const amountWithdrawn = parseEther('1')

      expect(iouPPO.connect(owner).withdrawERC20(ppo.address, amountWithdrawn)).revertedWith(
        revertReason('ERC20: transfer amount exceeds balance')
      )
    })

    it('transfers PPO to owner', async () => {
      const amountSent = parseEther('10')
      const amountWithdrawn = parseEther('1')
      const ppoBalanceBefore = await ppo.balanceOf(owner.address)
      const ppoBalanceIOUPPOBefore = await ppo.balanceOf(iouPPO.address)
      await ppo.connect(deployer).transfer(iouPPO.address, amountSent)
      const ppoBalanceIOUPPOAfter = await ppo.balanceOf(iouPPO.address)
      expect(ppoBalanceIOUPPOAfter).to.be.equal(ppoBalanceIOUPPOBefore.add(amountSent))

      await iouPPO.connect(owner).withdrawERC20(ppo.address, amountWithdrawn)

      expect(await ppo.balanceOf(owner.address)).to.be.equal(ppoBalanceBefore.add(amountWithdrawn))
      expect(await ppo.balanceOf(iouPPO.address)).to.be.equal(
        ppoBalanceIOUPPOAfter.sub(amountWithdrawn)
      )
    })

    it('transfers ERC20 to owner', async () => {
      const amountSent = parseEther('10')
      const amountWithdrawn = parseEther('1')
      const erc20BalanceBefore = await mockERC20.balanceOf(owner.address)
      const erc20BalanceIOUPPOBefore = await mockERC20.balanceOf(iouPPO.address)
      await mockERC20.connect(userNotStaked).transfer(iouPPO.address, amountSent)
      const erc20BalanceIOUPPOAfter = await mockERC20.balanceOf(iouPPO.address)
      expect(erc20BalanceIOUPPOAfter).to.be.equal(erc20BalanceIOUPPOBefore.add(amountSent))

      await iouPPO.connect(owner).withdrawERC20(mockERC20.address, amountWithdrawn)

      expect(await mockERC20.balanceOf(owner.address)).to.be.equal(
        erc20BalanceBefore.add(amountWithdrawn)
      )
      expect(await mockERC20.balanceOf(iouPPO.address)).to.be.equal(
        erc20BalanceIOUPPOAfter.sub(amountWithdrawn)
      )
    })
  })
})
