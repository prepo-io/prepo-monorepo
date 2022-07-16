import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { ZERO_ADDRESS, JUNK_ADDRESS } from 'prepo-constants'
import { ppoFixture } from './fixtures/PPOFixtures'
import { PPO } from '../types/generated'

describe('=> PPO', () => {
  let deployer: SignerWithAddress
  let owner: SignerWithAddress
  let user1: SignerWithAddress
  let ppo: PPO

  const deployPPO = async (): Promise<void> => {
    ;[deployer, owner, user1] = await ethers.getSigners()
    ppo = await ppoFixture(owner.address, 'prePO Token', 'PPO')
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
      await expect(ppo.connect(user1).mint(1)).revertedWith('Ownable: caller is not the owner')
    })

    it("increases owner's balance", async () => {
      const ownerPPOBalanceBefore = await ppo.balanceOf(owner.address)

      await ppo.connect(owner).mint(1)

      expect(await ppo.balanceOf(owner.address)).to.eq(ownerPPOBalanceBefore.add(1))
    })

    it("does not increase deployer's balance", async () => {
      const deployerPPOBalanceBefore = await ppo.balanceOf(deployer.address)

      await ppo.connect(owner).mint(1)

      expect(await ppo.balanceOf(deployer.address)).to.eq(deployerPPOBalanceBefore)
    })
  })

  describe('# burn', () => {
    beforeEach(async () => {
      await setupPPO()
      await ppo.connect(owner).mint(1)
    })

    it('reverts if amount > balance', async () => {
      const callerPPOBalanceBefore = await ppo.balanceOf(owner.address)

      await ppo.connect(owner).mint(1)

      expect(await ppo.balanceOf(owner.address)).to.eq(ownerPPOBalanceBefore.add(1))
    })

    it("doesn't decrease caller balance if amount = 0", async () => {})

    it('decreases caller balance if amount = 1', async () => {})

    it('decreases caller balance if amount > 1', async () => {})
  })
})
