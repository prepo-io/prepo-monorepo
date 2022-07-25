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
  let firstMockERC1155: MockContract<Contract>
  let secondMockERC1155: MockContract<Contract>
  const ERC1155IdArray = [1, 2]
  const ERC1155AmountArray = [parseEther('1'), parseEther('2')]

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

  const setupWithdrawTokensAndMockERC1155 = async (): Promise<void> => {
    await setupWithdrawTokens()
    const mockERC1155Factory = await smock.mock('ERC1155Mintable')
    firstMockERC1155 = await mockERC1155Factory.deploy('firstMockURI')
    await firstMockERC1155
      .connect(owner)
      .mint(withdrawTokens.address, ERC1155IdArray[0], ERC1155AmountArray[0])
    secondMockERC1155 = await mockERC1155Factory.deploy('secondMockURI')
    await secondMockERC1155
      .connect(owner)
      .mint(withdrawTokens.address, ERC1155IdArray[1], ERC1155AmountArray[1])
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

  describe('# batchWithdrawERC1155', async () => {
    let ERC1155ContractArray: string[]
    beforeEach(async () => {
      await setupWithdrawTokensAndMockERC1155()
      ERC1155ContractArray = [firstMockERC1155.address, secondMockERC1155.address]
    })

    it('reverts if not owner', async () => {
      expect(await withdrawTokens.owner()).to.not.eq(user1.address)

      await expect(
        withdrawTokens
          .connect(user1)
          .batchWithdrawERC1155(ERC1155ContractArray, ERC1155IdArray, ERC1155AmountArray)
      ).revertedWith('Ownable: caller is not the owner')
    })

    it('reverts token contract array length mismatch', async () => {
      const mismatchedContractArray = ERC1155ContractArray.slice(0, 1)
      expect(mismatchedContractArray.length).to.not.eq(ERC1155IdArray.length)
      expect(ERC1155IdArray.length).to.eq(ERC1155AmountArray.length)

      await expect(
        withdrawTokens
          .connect(owner)
          .batchWithdrawERC1155(mismatchedContractArray, ERC1155IdArray, ERC1155AmountArray)
      ).revertedWith('Array length mismatch')
    })

    it('reverts token id array length mismatch', async () => {
      const mismatchedTokenIdArray = ERC1155IdArray.slice(0, 1)
      expect(mismatchedTokenIdArray.length).to.not.eq(ERC1155AmountArray)
      expect(ERC1155AmountArray.length).to.eq(ERC1155ContractArray.length)

      await expect(
        withdrawTokens
          .connect(owner)
          .batchWithdrawERC1155(ERC1155ContractArray, mismatchedTokenIdArray, ERC1155AmountArray)
      ).revertedWith('Array length mismatch')
    })

    it('reverts token contract array length mismatch', async () => {
      const mismatchedAmountArray = ERC1155AmountArray.slice(0, 1)
      expect(mismatchedAmountArray.length).to.not.eq(ERC1155IdArray.length)
      expect(ERC1155IdArray.length).to.eq(ERC1155ContractArray.length)

      await expect(
        withdrawTokens
          .connect(owner)
          .batchWithdrawERC1155(ERC1155ContractArray, ERC1155IdArray, mismatchedAmountArray)
      ).revertedWith('Array length mismatch')
    })

    it('reverts if amount > balance', async () => {
      const contractERC1155Balance = await firstMockERC1155.balanceOf(
        withdrawTokens.address,
        ERC1155IdArray[0]
      )

      await expect(
        withdrawTokens
          .connect(owner)
          .batchWithdrawERC1155(
            [firstMockERC1155.address],
            [ERC1155IdArray[0]],
            [contractERC1155Balance.add(1)]
          )
      ).revertedWith('ERC1155: insufficient balance for transfer')
    })

    it('withdraws if amount = contract balance', async () => {
      const contractFirstERC1155BalanceBefore = await firstMockERC1155.balanceOf(
        withdrawTokens.address,
        ERC1155IdArray[0]
      )
      const ownerFirstERC1155BalanceBefore = await firstMockERC1155.balanceOf(
        owner.address,
        ERC1155IdArray[0]
      )
      expect(contractFirstERC1155BalanceBefore).to.not.eq(0)

      await withdrawTokens
        .connect(owner)
        .batchWithdrawERC1155(
          [firstMockERC1155.address],
          [ERC1155IdArray[0]],
          [contractFirstERC1155BalanceBefore]
        )

      expect(await firstMockERC1155.balanceOf(withdrawTokens.address, ERC1155IdArray[0])).to.eq(0)
      expect(await firstMockERC1155.balanceOf(owner.address, ERC1155IdArray[0])).to.eq(
        ownerFirstERC1155BalanceBefore.add(contractFirstERC1155BalanceBefore)
      )
    })

    it('withdraws if amount < contract balance', async () => {
      const contractFirstERC1155BalanceBefore = await firstMockERC1155.balanceOf(
        withdrawTokens.address,
        ERC1155IdArray[0]
      )
      const ownerFirstERC1155BalanceBefore = await firstMockERC1155.balanceOf(
        owner.address,
        ERC1155IdArray[0]
      )
      expect(contractFirstERC1155BalanceBefore).to.not.eq(0)

      await withdrawTokens
        .connect(owner)
        .batchWithdrawERC1155(
          [firstMockERC1155.address],
          [ERC1155IdArray[0]],
          [contractFirstERC1155BalanceBefore.sub(1)]
        )

      expect(await firstMockERC1155.balanceOf(withdrawTokens.address, ERC1155IdArray[0])).to.eq(1)
      expect(await firstMockERC1155.balanceOf(owner.address, ERC1155IdArray[0])).to.eq(
        ownerFirstERC1155BalanceBefore.add(contractFirstERC1155BalanceBefore.sub(1))
      )
    })

    it('withdraws if multiple ERC1155 tokens', async () => {
      const contractFirstERC1155BalanceBefore = await firstMockERC1155.balanceOf(
        withdrawTokens.address,
        ERC1155IdArray[0]
      )
      const ownerFirstERC1155BalanceBefore = await firstMockERC1155.balanceOf(
        owner.address,
        ERC1155IdArray[0]
      )
      const contractSecondERC1155BalanceBefore = await secondMockERC1155.balanceOf(
        withdrawTokens.address,
        ERC1155IdArray[1]
      )
      const ownerSecondERC1155BalanceBefore = await secondMockERC1155.balanceOf(
        owner.address,
        ERC1155IdArray[1]
      )
      expect(contractFirstERC1155BalanceBefore).to.not.eq(0)
      expect(contractSecondERC1155BalanceBefore).to.not.eq(0)

      await withdrawTokens
        .connect(owner)
        .batchWithdrawERC1155(ERC1155ContractArray, ERC1155IdArray, ERC1155AmountArray)

      expect(await firstMockERC1155.balanceOf(withdrawTokens.address, ERC1155IdArray[0])).to.eq(0)
      expect(await firstMockERC1155.balanceOf(owner.address, ERC1155IdArray[0])).to.eq(
        ownerFirstERC1155BalanceBefore.add(contractFirstERC1155BalanceBefore)
      )
      expect(await secondMockERC1155.balanceOf(withdrawTokens.address, ERC1155IdArray[1])).to.eq(0)
      expect(await secondMockERC1155.balanceOf(owner.address, ERC1155IdArray[1])).to.eq(
        ownerSecondERC1155BalanceBefore.add(contractSecondERC1155BalanceBefore)
      )
    })
  })

  describe('# onERC721Received', () => {
    beforeEach(async () => {
      await setupWithdrawTokensAndMockERC721()
    })

    it('is compliant with ERC721 safeTransferFrom() requirements', async () => {
      //As id = 1 already minted in beforeEach
      await firstMockERC721.connect(owner).mint(user1.address, 2)

      await expect(
        firstMockERC721
          .connect(user1)
          ['safeTransferFrom(address,address,uint256)'](user1.address, withdrawTokens.address, 2)
      ).to.not.reverted
    })
  })

  describe('# onERC1155Received', () => {
    beforeEach(async () => {
      await setupWithdrawTokensAndMockERC1155()
    })

    it('is compliant with ERC1155 safeTransferFrom() requirements', async () => {
      //As id = 1 already minted in beforeEach
      await firstMockERC1155.mint(user1.address, 2, 1)

      await expect(
        firstMockERC1155
          .connect(user1)
          .safeTransferFrom(user1.address, withdrawTokens.address, 2, 1, [])
      ).not.reverted
    })
  })

  describe('# onERC1155BatchReceived', () => {
    beforeEach(async () => {
      await setupWithdrawTokensAndMockERC1155()
    })

    it('is compliant with ERC1155 safeBatchTransferFrom() requirements', async () => {
      //As id = 1 already minted in beforeEach
      await firstMockERC1155.mint(user1.address, 2, 1)

      await expect(
        firstMockERC1155
          .connect(user1)
          .safeBatchTransferFrom(user1.address, withdrawTokens.address, [2], [1], [])
      ).not.reverted
    })
  })
})
