import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { ZERO_ADDRESS, JUNK_ADDRESS } from 'prepo-constants'
import { ppoFixture } from './fixtures/PPOFixtures'
import { MAX_UINT256 } from '../utils'
import { PPO } from '../types/generated'

describe('=> PPO', () => {
  let deployer: SignerWithAddress
  let owner: SignerWithAddress
  let user1: SignerWithAddress
  let ppo: PPO

  const deployPPO = async (): Promise<void> => {
    ;[deployer, owner, user1] = await ethers.getSigners()
    ppo = await ppoFixture('prePO Token', 'PPO', owner.address)
  }

  const setupPPO = async (): Promise<void> => {
    await deployPPO()
    await ppo.connect(owner).acceptOwnership()
  }

  describe('initial state', () => {
    beforeEach(async () => {
      await deployPPO()
    })

    it('sets nominee from initialize', async () => {
      expect(await ppo.getNominee()).to.not.eq(deployer.address)
      expect(await ppo.getNominee()).to.eq(owner.address)
    })

    it('sets name from initialize', async () => {
      expect(await ppo.name()).to.eq('prePO Token')
    })

    it('sets symbol from initialize', async () => {
      expect(await ppo.symbol()).to.eq('PPO')
    })

    it('sets owner to deployer', async () => {
      expect(await ppo.owner()).to.eq(deployer.address)
    })

    it('sets transfer hook as zero address', async () => {
      expect(await ppo.getTransferHook()).to.eq(ZERO_ADDRESS)
    })
  })

  describe('#setTransferHook', () => {
    beforeEach(async () => {
      await setupPPO()
    })

    it('reverts if not owner', async () => {
      expect(await ppo.owner()).to.not.eq(user1.address)

      await expect(ppo.connect(user1).setTransferHook(JUNK_ADDRESS)).revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('sets to non-zero address', async () => {
      expect(await ppo.getTransferHook()).to.not.eq(JUNK_ADDRESS)
      expect(JUNK_ADDRESS).to.not.equal(ZERO_ADDRESS)

      await ppo.connect(owner).setTransferHook(JUNK_ADDRESS)

      expect(await ppo.getTransferHook()).to.eq(JUNK_ADDRESS)
    })

    it('sets to zero address', async () => {
      await ppo.connect(owner).setTransferHook(JUNK_ADDRESS)
      expect(await ppo.getTransferHook()).to.not.eq(ZERO_ADDRESS)

      await ppo.connect(owner).setTransferHook(ZERO_ADDRESS)

      expect(await ppo.getTransferHook()).to.eq(ZERO_ADDRESS)
    })

    it('is idempotent', async () => {
      expect(await ppo.getTransferHook()).to.not.eq(JUNK_ADDRESS)

      await ppo.connect(owner).setTransferHook(JUNK_ADDRESS)

      expect(await ppo.getTransferHook()).to.eq(JUNK_ADDRESS)

      await ppo.connect(owner).setTransferHook(JUNK_ADDRESS)

      expect(await ppo.getTransferHook()).to.eq(JUNK_ADDRESS)
    })
  })

  describe('# mint', () => {
    beforeEach(async () => {
      await setupPPO()
    })

    it('reverts if not owner', async () => {
      expect(await ppo.owner()).to.not.eq(user1.address)

      await expect(ppo.connect(user1).mint(user1.address, 1)).revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('reverts if minting to zero address', async () => {
      await expect(ppo.connect(owner).mint(ZERO_ADDRESS, 1)).revertedWith(
        'ERC20: mint to the zero address'
      )
    })

    it('increases non-caller balance', async () => {
      const nonCallerPPOBalanceBefore = await ppo.balanceOf(user1.address)
      expect(owner).to.not.eq(user1)

      await ppo.connect(owner).mint(user1.address, 1)

      expect(await ppo.balanceOf(user1.address)).to.eq(nonCallerPPOBalanceBefore.add(1))
    })

    it('increases caller balance', async () => {
      const callerPPOBalanceBefore = await ppo.balanceOf(owner.address)

      await ppo.connect(owner).mint(owner.address, 1)

      expect(await ppo.balanceOf(owner.address)).to.eq(callerPPOBalanceBefore.add(1))
    })

    it('increases recipient balance if amount = 0', async () => {
      const recipientPPOBalanceBefore = await ppo.balanceOf(owner.address)

      await ppo.connect(owner).mint(user1.address, 0)

      expect(await ppo.balanceOf(owner.address)).to.eq(recipientPPOBalanceBefore)
    })

    it('increases recipient balance if amount > 1', async () => {
      const recipientPPOBalanceBefore = await ppo.balanceOf(owner.address)

      await ppo.connect(owner).mint(user1.address, 2)

      expect(await ppo.balanceOf(user1.address)).to.eq(recipientPPOBalanceBefore.add(2))
    })

    it('increases recipient balance if amount = max uint', async () => {
      expect(await ppo.balanceOf(user1.address)).to.eq(0)

      await ppo.connect(owner).mint(user1.address, MAX_UINT256)

      expect(await ppo.balanceOf(user1.address)).to.eq(MAX_UINT256)
    })
  })
})
