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

  const setupWithdrawTokens = async (): Promise<void> => {
    ;[deployer, user1, user2] = await ethers.getSigners()
    owner = deployer
    withdrawTokens = await withdrawTokensFixture()
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
      await setupWithdrawTokens()
      const mockERC20Factory = await smock.mock('ERC20Mintable')
      firstMockERC20 = await mockERC20Factory.deploy('firstMockERC20', 'MERC20F')
      await firstMockERC20.connect(owner).mint(withdrawTokens.address, parseEther('1'))
      secondMockERC20 = await mockERC20Factory.deploy('secondMockERC20', 'MERC20S')
      await secondMockERC20.connect(owner).mint(withdrawTokens.address, parseEther('1'))
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
        withdrawTokens
          .connect(owner)
          .batchWithdrawERC20([firstMockERC20.address], [1, 2])
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
})
