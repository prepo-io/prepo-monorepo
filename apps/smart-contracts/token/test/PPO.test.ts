import chai, { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { ZERO_ADDRESS, JUNK_ADDRESS } from 'prepo-constants'
import { FakeContract, smock } from '@defi-wonderland/smock'
import { Contract } from 'ethers'
import { ppoFixture } from './fixtures/PPOFixtures'
import { MAX_UINT256 } from '../utils'
import { PPO } from '../types/generated'

chai.use(smock.matchers)

describe('=> PPO', () => {
  let deployer: SignerWithAddress
  let owner: SignerWithAddress
  let user1: SignerWithAddress
  let user2: SignerWithAddress
  let ppo: PPO
  let mockRestrictedTransferHook: FakeContract<Contract>
  let mockBlocklistTransferHook: FakeContract<Contract>

  const deployPPO = async (): Promise<void> => {
    ;[deployer, owner, user1, user2] = await ethers.getSigners()
    ppo = await ppoFixture('prePO Token', 'PPO', owner.address)
  }

  const setupPPO = async (): Promise<void> => {
    await deployPPO()
    await ppo.connect(owner).acceptOwnership()
  }

  const setupPPOAndMockTransferHooks = async (): Promise<void> => {
    await setupPPO()
    mockBlocklistTransferHook = await smock.fake('BlocklistTransferHook')
    mockRestrictedTransferHook = await smock.fake('RestrictedTransferHook')
    await ppo.connect(owner).setTransferHook(mockBlocklistTransferHook.address)
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

    it('sets token supply to zero', async () => {
      expect(await ppo.totalSupply()).to.eq(0)
    })

    it('sets owner token balance to zero', async () => {
      await ppo.balanceOf(deployer.address)
    })

    it('sets nominee token balance to zero', async () => {
      await ppo.balanceOf(owner.address)
    })
  })

  describe('# setTransferHook', () => {
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
      await setupPPOAndMockTransferHooks()
    })

    it('reverts if transfer hook not set', async () => {
      await ppo.connect(owner).setTransferHook(ZERO_ADDRESS)

      await expect(ppo.connect(owner).mint(user1.address, 1)).revertedWith('Transfer hook not set')
    })

    it('reverts if blocklist transfer hook reverts', async () => {
      mockBlocklistTransferHook.hook.reverts()

      await expect(ppo.connect(owner).mint(user1.address, 1)).to.be.reverted
      expect(mockBlocklistTransferHook.hook).to.have.been.calledWith(ZERO_ADDRESS, user1.address, 1)
    })

    it('reverts if restricted transfer hook reverts', async () => {
      // as we had set mockBlocklistTransferHook in setupPPOAndMockTransferHooks
      await ppo.connect(owner).setTransferHook(mockRestrictedTransferHook.address)
      mockRestrictedTransferHook.hook.reverts()

      await expect(ppo.connect(owner).mint(user1.address, 1)).to.be.reverted
      expect(mockRestrictedTransferHook.hook).to.have.been.calledWith(
        ZERO_ADDRESS,
        user1.address,
        1
      )
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

    it('mints to non-caller if recipient is non-caller', async () => {
      const nonCallerPPOBalanceBefore = await ppo.balanceOf(user1.address)
      expect(owner).to.not.eq(user1)

      await ppo.connect(owner).mint(user1.address, 1)

      expect(await ppo.balanceOf(user1.address)).to.eq(nonCallerPPOBalanceBefore.add(1))
    })

    it('mints to caller if recipient is caller', async () => {
      const callerPPOBalanceBefore = await ppo.balanceOf(owner.address)

      await ppo.connect(owner).mint(owner.address, 1)

      expect(await ppo.balanceOf(owner.address)).to.eq(callerPPOBalanceBefore.add(1))
    })

    it("doesn't increase recipient balance if amount = 0", async () => {
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

    it('emits transfer if amount = 0 and recipient is caller', async () => {
      const tx = await ppo.connect(owner).mint(owner.address, 0)

      await expect(tx)
        .to.emit(ppo, 'Transfer(address,address,uint256)')
        .withArgs(ZERO_ADDRESS, owner.address, 0)
    })

    it('emits transfer if amount = 0 and recipient is non-caller', async () => {
      const tx = await ppo.connect(owner).mint(user1.address, 0)

      await expect(tx)
        .to.emit(ppo, 'Transfer(address,address,uint256)')
        .withArgs(ZERO_ADDRESS, user1.address, 0)
    })

    it('emits transfer if amount > 0 and recipient is caller', async () => {
      const tx = await ppo.connect(owner).mint(owner.address, 1)

      await expect(tx)
        .to.emit(ppo, 'Transfer(address,address,uint256)')
        .withArgs(ZERO_ADDRESS, owner.address, 1)
    })

    it('emits transfer if amount > 0 and recipient is non-caller', async () => {
      const tx = await ppo.connect(owner).mint(user1.address, 1)

      await expect(tx)
        .to.emit(ppo, 'Transfer(address,address,uint256)')
        .withArgs(ZERO_ADDRESS, user1.address, 1)
    })
  })

  describe('# burn', () => {
    beforeEach(async () => {
      await setupPPOAndMockTransferHooks()
      await ppo.connect(owner).mint(user1.address, 10)
    })

    it('reverts if transfer hook not set', async () => {
      await ppo.connect(owner).setTransferHook(ZERO_ADDRESS)

      await expect(ppo.connect(user1).burn(1)).revertedWith('Transfer hook not set')
    })

    it('reverts if blocklist transfer hook reverts', async () => {
      mockBlocklistTransferHook.hook.reverts()

      await expect(ppo.connect(user1).burn(1)).to.be.reverted
      expect(mockBlocklistTransferHook.hook).to.have.been.calledWith(user1.address, ZERO_ADDRESS, 1)
    })

    it('reverts if restricted transfer hook reverts', async () => {
      // as we had set mockBlocklistTransferHook in setupPPOAndMockTransferHooks
      await ppo.connect(owner).setTransferHook(mockRestrictedTransferHook.address)
      mockRestrictedTransferHook.hook.reverts()

      await expect(ppo.connect(user1).burn(1)).to.be.reverted
      expect(mockRestrictedTransferHook.hook).to.have.been.calledWith(
        user1.address,
        ZERO_ADDRESS,
        1
      )
    })

    it('reverts if amount > balance', async () => {
      const callerPPOBalanceBefore = await ppo.balanceOf(user1.address)

      await expect(ppo.connect(user1).burn(callerPPOBalanceBefore.add(1))).to.revertedWith(
        'ERC20: burn amount exceeds balance'
      )
    })

    it("doesn't decrease caller balance if amount = 0", async () => {
      const callerPPOBalanceBefore = await ppo.balanceOf(user1.address)

      await ppo.connect(user1).burn(0)

      expect(await ppo.balanceOf(user1.address)).to.eq(callerPPOBalanceBefore)
    })

    it('decreases caller balance if amount < balance', async () => {
      const callerPPOBalanceBefore = await ppo.balanceOf(user1.address)

      await ppo.connect(user1).burn(callerPPOBalanceBefore.sub(1))

      expect(await ppo.balanceOf(user1.address)).to.eq(1)
    })

    it('decreases caller balance if amount = balance', async () => {
      const callerPPOBalanceBefore = await ppo.balanceOf(user1.address)

      await ppo.connect(user1).burn(callerPPOBalanceBefore)

      expect(await ppo.balanceOf(user1.address)).to.eq(0)
    })

    it('decreases total supply if amount > 0', async () => {
      const totalSupplyBefore = await ppo.totalSupply()

      await ppo.connect(user1).burn(1)

      expect(await ppo.totalSupply()).to.eq(totalSupplyBefore.sub(1))
    })

    it("doesn't change total supply if amount = 0", async () => {
      const totalSupplyBefore = await ppo.totalSupply()

      await ppo.connect(user1).burn(0)

      expect(await ppo.totalSupply()).to.eq(totalSupplyBefore)
    })

    it('emits transfer if amount = 0', async () => {
      const tx = await ppo.connect(user1).burn(0)

      await expect(tx)
        .to.emit(ppo, 'Transfer(address,address,uint256)')
        .withArgs(user1.address, ZERO_ADDRESS, 0)
    })

    it('emits transfer if amount > 0', async () => {
      const tx = await ppo.connect(user1).burn(1)

      await expect(tx)
        .to.emit(ppo, 'Transfer(address,address,uint256)')
        .withArgs(user1.address, ZERO_ADDRESS, 1)
    })
  })

  describe('# burnFrom', () => {
    beforeEach(async () => {
      await setupPPOAndMockTransferHooks()
      await ppo.connect(owner).mint(user1.address, 10)
    })

    it('reverts if transfer hook not set', async () => {
      await ppo.connect(owner).setTransferHook(ZERO_ADDRESS)
      await ppo.connect(user1).approve(user2.address, 1)

      await expect(ppo.connect(user2).burnFrom(user1.address, 1)).revertedWith(
        'Transfer hook not set'
      )
    })

    it('reverts if blocklist transfer hook reverts', async () => {
      mockBlocklistTransferHook.hook.reverts()
      await ppo.connect(user1).approve(user2.address, 1)

      await expect(ppo.connect(user2).burnFrom(user1.address, 1)).to.be.reverted
      expect(mockBlocklistTransferHook.hook).to.have.been.calledWith(user1.address, ZERO_ADDRESS, 1)
    })

    it('reverts if restricted transfer hook reverts', async () => {
      // as we had set mockBlocklistTransferHook in setupPPOAndMockTransferHooks
      await ppo.connect(owner).setTransferHook(mockRestrictedTransferHook.address)
      mockRestrictedTransferHook.hook.reverts()
      await ppo.connect(user1).approve(user2.address, 1)

      await expect(ppo.connect(user2).burnFrom(user1.address, 1)).to.be.reverted
      expect(mockRestrictedTransferHook.hook).to.have.been.calledWith(
        user1.address,
        ZERO_ADDRESS,
        1
      )
    })

    it('reverts if burn from zero address', async () => {
      await expect(ppo.connect(user1).burnFrom(ZERO_ADDRESS, 1)).revertedWith(
        'ERC20: burn amount exceeds allowance'
      )
    })

    it('reverts if amount > allowance', async () => {
      const user1PPOBalanceBefore = await ppo.balanceOf(user1.address)
      await ppo.connect(user1).approve(user2.address, user1PPOBalanceBefore.sub(1))

      await expect(
        ppo.connect(user2).burnFrom(user1.address, user1PPOBalanceBefore)
      ).to.revertedWith('ERC20: burn amount exceeds allowance')
    })

    it('reverts if amount > balance', async () => {
      const user1PPOBalanceBefore = await ppo.balanceOf(user1.address)
      await ppo.connect(user1).approve(user2.address, user1PPOBalanceBefore.add(1))

      await expect(
        ppo.connect(user2).burnFrom(user1.address, user1PPOBalanceBefore.add(1))
      ).to.revertedWith('ERC20: burn amount exceeds balance')
    })

    it("doesn't decrease user balance if amount = 0", async () => {
      const user1PPOBalanceBefore = await ppo.balanceOf(user1.address)
      await ppo.connect(user1).approve(user2.address, user1PPOBalanceBefore)

      await ppo.connect(user2).burnFrom(user1.address, 0)

      expect(await ppo.balanceOf(user1.address)).to.eq(user1PPOBalanceBefore)
    })

    it('decreases user balance if amount < balance', async () => {
      const user1PPOBalanceBefore = await ppo.balanceOf(user1.address)
      await ppo.connect(user1).approve(user2.address, user1PPOBalanceBefore)

      await ppo.connect(user2).burnFrom(user1.address, user1PPOBalanceBefore.sub(1))

      expect(await ppo.balanceOf(user1.address)).to.eq(1)
    })

    it('decreases user balance if amount = balance', async () => {
      const user1PPOBalanceBefore = await ppo.balanceOf(user1.address)
      await ppo.connect(user1).approve(user2.address, user1PPOBalanceBefore)

      await ppo.connect(user2).burnFrom(user1.address, user1PPOBalanceBefore)

      expect(await ppo.balanceOf(user1.address)).to.eq(0)
    })

    it('decreases total supply if amount > 0', async () => {
      const totalSupplyBefore = await ppo.totalSupply()
      await ppo.connect(user1).approve(user2.address, 1)

      await ppo.connect(user2).burnFrom(user1.address, 1)

      expect(await ppo.totalSupply()).to.eq(totalSupplyBefore.sub(1))
    })

    it("doesn't change total supply if amount = 0", async () => {
      const totalSupplyBefore = await ppo.totalSupply()

      await ppo.connect(user2).burnFrom(user1.address, 0)

      expect(await ppo.totalSupply()).to.eq(totalSupplyBefore)
    })

    it('emits transfer if amount = 0', async () => {
      const tx = await ppo.connect(user2).burnFrom(user1.address, 0)

      await expect(tx)
        .to.emit(ppo, 'Transfer(address,address,uint256)')
        .withArgs(user1.address, ZERO_ADDRESS, 0)
    })

    it('emits transfer if amount > 0', async () => {
      await ppo.connect(user1).approve(user2.address, 1)
      const tx = await ppo.connect(user2).burnFrom(user1.address, 1)

      await expect(tx)
        .to.emit(ppo, 'Transfer(address,address,uint256)')
        .withArgs(user1.address, ZERO_ADDRESS, 1)
    })
  })

  describe('# transfer', () => {
    beforeEach(async () => {
      await setupPPOAndMockTransferHooks()
      await ppo.connect(owner).mint(user1.address, 10)
    })

    it('reverts if transfer hook not set', async () => {
      await ppo.connect(owner).setTransferHook(ZERO_ADDRESS)

      await expect(ppo.connect(user1).transfer(user2.address, 1)).revertedWith(
        'Transfer hook not set'
      )
    })

    it('reverts if blocklist transfer hook reverts', async () => {
      mockBlocklistTransferHook.hook.reverts()

      await expect(ppo.connect(user1).transfer(user2.address, 1)).to.be.reverted
      expect(mockBlocklistTransferHook.hook).to.have.been.calledWith(
        user1.address,
        user2.address,
        1
      )
    })

    it('reverts if restricted transfer hook reverts', async () => {
      // as we had set mockBlocklistTransferHook in setupPPOAndMockTransferHooks
      await ppo.connect(owner).setTransferHook(mockRestrictedTransferHook.address)
      mockRestrictedTransferHook.hook.reverts()

      await expect(ppo.connect(user1).transfer(user2.address, 1)).to.be.reverted
      expect(mockRestrictedTransferHook.hook).to.have.been.calledWith(
        user1.address,
        user2.address,
        1
      )
    })

    it('reverts if amount > balance', async () => {
      const user1PPOBalanceBefore = await ppo.balanceOf(user1.address)

      await expect(
        ppo.connect(user1).transfer(user2.address, user1PPOBalanceBefore.add(1))
      ).revertedWith('ERC20: transfer amount exceeds balance')
    })

    it('reverts if transfer to zero address', async () => {
      await expect(ppo.connect(user1).transfer(ZERO_ADDRESS, 1)).revertedWith(
        'ERC20: transfer to the zero address'
      )
    })

    it('transfers if amount = 0', async () => {
      const user1PPOBalanceBefore = await ppo.balanceOf(user1.address)
      const user2PPOBalanceBefore = await ppo.balanceOf(user2.address)

      await ppo.connect(user1).transfer(user2.address, 0)

      expect(await ppo.balanceOf(user1.address)).to.eq(user1PPOBalanceBefore)
      expect(await ppo.balanceOf(user2.address)).to.eq(user2PPOBalanceBefore)
    })

    it('transfers if amount < balance', async () => {
      const user1PPOBalanceBefore = await ppo.balanceOf(user1.address)
      const user2PPOBalanceBefore = await ppo.balanceOf(user2.address)

      await ppo.connect(user1).transfer(user2.address, user1PPOBalanceBefore.sub(1))

      expect(await ppo.balanceOf(user1.address)).to.eq(1)
      expect(await ppo.balanceOf(user2.address)).to.eq(
        user2PPOBalanceBefore.add(user1PPOBalanceBefore.sub(1))
      )
    })

    it('transfers if amount = balance', async () => {
      const user1PPOBalanceBefore = await ppo.balanceOf(user1.address)
      const user2PPOBalanceBefore = await ppo.balanceOf(user2.address)

      await ppo.connect(user1).transfer(user2.address, user1PPOBalanceBefore)

      expect(await ppo.balanceOf(user1.address)).to.eq(0)
      expect(await ppo.balanceOf(user2.address)).to.eq(
        user2PPOBalanceBefore.add(user1PPOBalanceBefore)
      )
    })

    it('emits transfer if amount = 0', async () => {
      const tx = await ppo.connect(user1).transfer(user2.address, 0)

      await expect(tx)
        .to.emit(ppo, 'Transfer(address,address,uint256)')
        .withArgs(user1.address, user2.address, 0)
    })

    it('emits transfer if amount > 0', async () => {
      const tx = await ppo.connect(user1).transfer(user2.address, 1)

      await expect(tx)
        .to.emit(ppo, 'Transfer(address,address,uint256)')
        .withArgs(user1.address, user2.address, 1)
    })
  })

  describe('# transferFrom', () => {
    beforeEach(async () => {
      await setupPPOAndMockTransferHooks()
      await ppo.connect(owner).mint(user1.address, 10)
    })

    it('reverts if transfer hook not set', async () => {
      await ppo.connect(owner).setTransferHook(ZERO_ADDRESS)
      await ppo.connect(user1).approve(user2.address, 1)

      await expect(ppo.connect(user2).transferFrom(user1.address, user2.address, 1)).revertedWith(
        'Transfer hook not set'
      )
    })

    it('reverts if blocklist transfer hook reverts', async () => {
      mockBlocklistTransferHook.hook.reverts()
      await ppo.connect(user1).approve(user2.address, 1)

      await expect(ppo.connect(user2).transferFrom(user1.address, user2.address, 1)).to.be.reverted
      expect(mockBlocklistTransferHook.hook).to.have.been.calledWith(
        user1.address,
        user2.address,
        1
      )
    })

    it('reverts if restricted transfer hook reverts', async () => {
      // as we had set mockBlocklistTransferHook in setupPPOAndMockTransferHooks
      await ppo.connect(owner).setTransferHook(mockRestrictedTransferHook.address)
      mockRestrictedTransferHook.hook.reverts()
      await ppo.connect(user1).approve(user2.address, 1)

      await expect(ppo.connect(user2).transferFrom(user1.address, user2.address, 1)).to.be.reverted
      expect(mockRestrictedTransferHook.hook).to.have.been.calledWith(
        user1.address,
        user2.address,
        1
      )
    })

    it('reverts if amount > allowance', async () => {
      const user1PPOBalanceBefore = await ppo.balanceOf(user1.address)
      await ppo.connect(user1).approve(user2.address, user1PPOBalanceBefore.sub(1))

      await expect(
        ppo.connect(user2).transferFrom(user1.address, user2.address, user1PPOBalanceBefore)
      ).to.revertedWith('ERC20: transfer amount exceeds allowance')
    })

    it('reverts if amount > balance', async () => {
      const user1PPOBalanceBefore = await ppo.balanceOf(user1.address)
      await ppo.connect(user1).approve(user2.address, user1PPOBalanceBefore.add(1))

      await expect(
        ppo.connect(user2).transferFrom(user1.address, user2.address, user1PPOBalanceBefore.add(1))
      ).to.revertedWith('ERC20: transfer amount exceeds balance')
    })

    it('reverts if transfer from zero address', async () => {
      await expect(ppo.connect(user2).transferFrom(ZERO_ADDRESS, user2.address, 1)).to.revertedWith(
        'ERC20: transfer from the zero address'
      )
    })

    it('reverts if transfer to zero address', async () => {
      await expect(ppo.connect(user2).transferFrom(user1.address, ZERO_ADDRESS, 1)).to.revertedWith(
        'ERC20: transfer to the zero address'
      )
    })

    it('transfers if amount = 0', async () => {
      const user1PPOBalanceBefore = await ppo.balanceOf(user1.address)
      const user2PPOBalanceBefore = await ppo.balanceOf(user2.address)
      await ppo.connect(user1).approve(user2.address, 0)

      await ppo.connect(user2).transferFrom(user1.address, user2.address, 0)

      expect(await ppo.balanceOf(user1.address)).to.eq(user1PPOBalanceBefore)
      expect(await ppo.balanceOf(user2.address)).to.eq(user2PPOBalanceBefore)
    })

    it('transfers if amount < balance', async () => {
      const user1PPOBalanceBefore = await ppo.balanceOf(user1.address)
      const user2PPOBalanceBefore = await ppo.balanceOf(user2.address)
      await ppo.connect(user1).approve(user2.address, user1PPOBalanceBefore.sub(1))

      await ppo
        .connect(user2)
        .transferFrom(user1.address, user2.address, user1PPOBalanceBefore.sub(1))

      expect(await ppo.balanceOf(user1.address)).to.eq(1)
      expect(await ppo.balanceOf(user2.address)).to.eq(
        user2PPOBalanceBefore.add(user1PPOBalanceBefore.sub(1))
      )
    })

    it('transfers if amount = balance', async () => {
      const user1PPOBalanceBefore = await ppo.balanceOf(user1.address)
      const user2PPOBalanceBefore = await ppo.balanceOf(user2.address)
      await ppo.connect(user1).approve(user2.address, user1PPOBalanceBefore)

      await ppo.connect(user2).transferFrom(user1.address, user2.address, user1PPOBalanceBefore)

      expect(await ppo.balanceOf(user1.address)).to.eq(0)
      expect(await ppo.balanceOf(user2.address)).to.eq(
        user2PPOBalanceBefore.add(user1PPOBalanceBefore)
      )
    })

    it('emits transfer if amount = 0', async () => {
      await ppo.connect(user1).approve(user2.address, 0)
      const tx = await ppo.connect(user2).transferFrom(user1.address, user2.address, 0)

      await expect(tx)
        .to.emit(ppo, 'Transfer(address,address,uint256)')
        .withArgs(user1.address, user2.address, 0)
    })

    it('emits transfer if amount > 0', async () => {
      await ppo.connect(user1).approve(user2.address, 1)
      const tx = await ppo.connect(user2).transferFrom(user1.address, user2.address, 1)

      await expect(tx)
        .to.emit(ppo, 'Transfer(address,address,uint256)')
        .withArgs(user1.address, user2.address, 1)
    })
  })
})
