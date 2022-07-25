import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { ZERO_ADDRESS } from 'prepo-constants'
import { withdrawTokensFixture } from './fixtures/WithdrawTokensFixture'
import { WithdrawTokens } from '../types/generated'
import { MockContract, smock } from '@defi-wonderland/smock'
import { parseEther } from 'ethers/lib/utils'
import { Contract } from 'ethers'

describe('WithdrawTokens', () => {
  let deployer: SignerWithAddress
  let owner: SignerWithAddress
  let user1: SignerWithAddress
  let user2: SignerWithAddress
  let withdrawTokens: WithdrawTokens
  let firstMockERC20: MockContract<Contract>
  let secondMockERC20: MockContract<Contract>
  let firstMockERC721: MockContract<Contract>
  let secondMockERC721: MockContract<Contract>

  const setupWithdrawTokens = async (): Promise<void> => {
    ;[deployer, user1, user2] = await ethers.getSigners()
    owner = deployer
    withdrawTokens = await withdrawTokensFixture()
  }

  const setupWithdrawTokensAndMockERC20 = async (): Promise<void> => {
    await setupWithdrawTokens()
    const mockERC20Factory = await smock.mock('ERC20Mintable')
    firstMockERC20 = await mockERC20Factory.deploy('firstMockERC20', 'MERC20F')
    await firstMockERC20.connect(owner).mint(withdrawTokens.address, parseEther('1'))
    secondMockERC20 = await mockERC20Factory.deploy('secondMockERC20', 'MERC20S')
    await secondMockERC20.connect(owner).mint(withdrawTokens.address, parseEther('1'))
  }

  const setupWithdrawTokensAndMockERC721 = async (): Promise<void> => {
    await setupWithdrawTokens()
    const mockERC721Factory = await smock.mock('ERC721Mintable')
    firstMockERC721 = await mockERC721Factory.deploy('firstMockERC721', 'MERC721F')
    await firstMockERC721.connect(owner).mint(withdrawTokens.address, 1)
    secondMockERC721 = await mockERC721Factory.deploy('secondMockERC721', 'MERC721S')
    await secondMockERC721.connect(owner).mint(withdrawTokens.address, 1)
  }

  describe('initial state', () => {
    beforeEach(async () => {
      await setupWithdrawTokens()
    })

    it('sets owner to deployer', async () => {
      expect(await withdrawTokens.owner()).to.eq(deployer.address)
    })

    it('sets nominee to zero address', async () => {
      expect(await withdrawTokens.getNominee()).to.eq(ZERO_ADDRESS)
    })
  })

  describe('# batchWithdrawERC20', async () => {
    beforeEach(async () => {
      await setupWithdrawTokensAndMockERC20()
    })

    it('reverts if not owner', async () => {
      expect(await withdrawTokens.owner()).to.not.eq(user1.address)

      await expect(
        withdrawTokens.connect(user1).batchWithdrawERC20([firstMockERC20.address], [1])
      ).revertedWith('Ownable: caller is not the owner')
    })

    it('reverts if array length mismatch', async () => {
      expect([firstMockERC20].length).to.not.eq([1, 2].length)

      await expect(
        withdrawTokens.connect(owner).batchWithdrawERC20([firstMockERC20.address], [1, 2])
      ).revertedWith('Array length mismatch')
    })

    it('reverts if amount > contract balance', async () => {
      const contractFirstERC20BalanceBefore = await firstMockERC20.balanceOf(withdrawTokens.address)

      await expect(
        withdrawTokens
          .connect(owner)
          .batchWithdrawERC20([firstMockERC20.address], [contractFirstERC20BalanceBefore.add(1)])
      ).revertedWith('ERC20: transfer amount exceeds balance')
    })

    it('withdraws if amount = contract balance', async () => {
      const contractFirstERC20BalanceBefore = await firstMockERC20.balanceOf(withdrawTokens.address)
      const ownerFirstERC20BalanceBefore = await firstMockERC20.balanceOf(owner.address)

      await withdrawTokens
        .connect(owner)
        .batchWithdrawERC20([firstMockERC20.address], [contractFirstERC20BalanceBefore])

      expect(await firstMockERC20.balanceOf(withdrawTokens.address)).to.eq(0)
      expect(await firstMockERC20.balanceOf(owner.address)).to.eq(
        ownerFirstERC20BalanceBefore.add(contractFirstERC20BalanceBefore)
      )
    })

    it('withdraws if amount < contract balance', async () => {
      const contractFirstERC20BalanceBefore = await firstMockERC20.balanceOf(withdrawTokens.address)
      const ownerFirstERC20BalanceBefore = await firstMockERC20.balanceOf(owner.address)

      await withdrawTokens
        .connect(owner)
        .batchWithdrawERC20([firstMockERC20.address], [contractFirstERC20BalanceBefore.sub(1)])

      expect(await firstMockERC20.balanceOf(withdrawTokens.address)).to.eq(1)
      expect(await firstMockERC20.balanceOf(owner.address)).to.eq(
        ownerFirstERC20BalanceBefore.add(contractFirstERC20BalanceBefore.sub(1))
      )
    })

    it('withdraws if multiple ERC20 tokens', async () => {
      const contractFirstERC20BalanceBefore = await firstMockERC20.balanceOf(withdrawTokens.address)
      const ownerFirstERC20BalanceBefore = await firstMockERC20.balanceOf(owner.address)
      const contractSecondERC20BalanceBefore = await secondMockERC20.balanceOf(
        withdrawTokens.address
      )
      const ownerSecondERC20BalanceBefore = await secondMockERC20.balanceOf(owner.address)

      await withdrawTokens
        .connect(owner)
        .batchWithdrawERC20(
          [firstMockERC20.address, secondMockERC20.address],
          [contractFirstERC20BalanceBefore.sub(1), contractSecondERC20BalanceBefore.sub(1)]
        )

      expect(await firstMockERC20.balanceOf(withdrawTokens.address)).to.eq(1)
      expect(await firstMockERC20.balanceOf(owner.address)).to.eq(
        ownerFirstERC20BalanceBefore.add(contractFirstERC20BalanceBefore.sub(1))
      )
      expect(await secondMockERC20.balanceOf(withdrawTokens.address)).to.eq(1)
      expect(await secondMockERC20.balanceOf(owner.address)).to.eq(
        ownerSecondERC20BalanceBefore.add(contractSecondERC20BalanceBefore.sub(1))
      )
    })
  })

  describe('# batchWithdrawERC721', async () => {
    beforeEach(async () => {
      await setupWithdrawTokensAndMockERC721()
    })

    it('reverts if not owner', async () => {
      expect(await withdrawTokens.owner()).to.not.eq(user1.address)

      await expect(
        withdrawTokens.connect(user1).batchWithdrawERC721([firstMockERC721.address], [1])
      ).revertedWith('Ownable: caller is not the owner')
    })

    it('reverts if array length mismatch', async () => {
      expect([firstMockERC721].length).to.not.eq([1, 2].length)

      await expect(
        withdrawTokens.connect(owner).batchWithdrawERC721([firstMockERC721.address], [1, 1])
      ).revertedWith('Array length mismatch')
    })

    it('reverts if token id not owned by contract', async () => {
      await firstMockERC721.connect(owner).mint(user1.address, 2)
      expect(await firstMockERC721.ownerOf(2)).to.not.eq(withdrawTokens.address)

      await expect(
        withdrawTokens.connect(owner).batchWithdrawERC721([firstMockERC721.address], [2])
      ).revertedWith('ERC721: transfer caller is not owner nor approved')
    })

    it('withdraws single ERC721 token', async () => {
      const contractFirstERC721BalanceBefore = await firstMockERC721.balanceOf(
        withdrawTokens.address
      )
      const ownerFirstERC721BalanceBefore = await firstMockERC721.balanceOf(owner.address)

      await withdrawTokens.connect(owner).batchWithdrawERC721([firstMockERC721.address], [1])

      expect(await firstMockERC721.balanceOf(owner.address)).to.be.equal(
        ownerFirstERC721BalanceBefore.add(1)
      )
      expect(await firstMockERC721.balanceOf(withdrawTokens.address)).to.be.equal(
        contractFirstERC721BalanceBefore.sub(1)
      )
    })

    it('withdraws multiple ERC721 tokens', async () => {
      const contractFirstERC721BalanceBefore = await firstMockERC721.balanceOf(
        withdrawTokens.address
      )
      const ownerFirstERC721BalanceBefore = await firstMockERC721.balanceOf(owner.address)
      const contractSecondERC721BalanceBefore = await secondMockERC721.balanceOf(
        withdrawTokens.address
      )
      const ownerSecondERC721BalanceBefore = await secondMockERC721.balanceOf(owner.address)

      await withdrawTokens
        .connect(owner)
        .batchWithdrawERC721([firstMockERC721.address, secondMockERC721.address], [1, 1])

      expect(await firstMockERC721.balanceOf(owner.address)).to.be.equal(
        ownerFirstERC721BalanceBefore.add(1)
      )
      expect(await firstMockERC721.balanceOf(withdrawTokens.address)).to.be.equal(
        contractFirstERC721BalanceBefore.sub(1)
      )
      expect(await secondMockERC721.balanceOf(owner.address)).to.be.equal(
        ownerSecondERC721BalanceBefore.add(1)
      )
      expect(await secondMockERC721.balanceOf(withdrawTokens.address)).to.be.equal(
        contractSecondERC721BalanceBefore.sub(1)
      )
    })
  })

  describe('# onERC721Received', () => {
    beforeEach(async () => {
      await setupWithdrawTokensAndMockERC721()
    })

    it('is compliant with ERC721 safeTransferFrom() requirements', async () => {
      await firstMockERC721.connect(owner).mint(user1.address, 2)

      await expect(
        firstMockERC721
          .connect(user1)
          ['safeTransferFrom(address,address,uint256)'](user1.address, withdrawTokens.address, 2)
      ).to.not.reverted
    })
  })
})
