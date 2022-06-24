import chai, { expect } from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { parseEther } from 'ethers/lib/utils'
import { ZERO_ADDRESS } from 'prepo-constants'
import { utils } from 'prepo-hardhat'
import { mockBaseTokenFixture } from './fixtures/MockBaseTokenFixture'
import { MockBaseToken } from '../typechain/MockBaseToken'

const { revertReason } = utils

chai.use(solidity)

describe('=> MockBaseToken', () => {
  let mockBaseToken: MockBaseToken
  let owner: SignerWithAddress
  let mockStrategy: SignerWithAddress
  let user1: SignerWithAddress

  const setupAccounts = async (): Promise<void> => {
    ;[owner, mockStrategy, user1] = await ethers.getSigners()
  }

  const setupMockBaseToken = async (): Promise<void> => {
    mockBaseToken = await mockBaseTokenFixture('Fake USD', 'FAKEUSD')
  }

  describe('initial state', (): void => {
    before(async () => {
      await setupAccounts()
      await setupMockBaseToken()
    })

    it("sets name to 'Fake USD'", async () => {
      expect(await mockBaseToken.name()).to.eq('Fake USD')
    })

    it("sets symbol to 'FAKEUSD'", async () => {
      expect(await mockBaseToken.symbol()).to.eq('FAKEUSD')
    })

    it('sets owner to deployer', async () => {
      expect(await mockBaseToken.owner()).to.eq(owner.address)
    })
  })

  describe('# setMockStrategy', () => {
    beforeEach(async () => {
      await setupAccounts()
      await setupMockBaseToken()
    })

    it('reverts if not owner', async () => {
      expect(await mockBaseToken.owner()).to.not.eq(user1.address)

      expect(mockBaseToken.connect(user1).setMockStrategy(mockStrategy.address)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('sets to non-zero address', async () => {
      expect(await mockBaseToken.getMockStrategy()).to.not.eq(mockStrategy.address)

      await mockBaseToken.connect(owner).setMockStrategy(mockStrategy.address)

      expect(await mockBaseToken.getMockStrategy()).to.eq(mockStrategy.address)
    })

    it('is idempotent', async () => {
      expect(await mockBaseToken.getMockStrategy()).to.not.eq(mockStrategy.address)

      await mockBaseToken.connect(owner).setMockStrategy(mockStrategy.address)

      expect(await mockBaseToken.getMockStrategy()).to.eq(mockStrategy.address)

      await mockBaseToken.connect(owner).setMockStrategy(mockStrategy.address)

      expect(await mockBaseToken.getMockStrategy()).to.eq(mockStrategy.address)
    })

    it('sets to zero address', async () => {
      await mockBaseToken.connect(owner).setMockStrategy(mockStrategy.address)
      expect(await mockBaseToken.getMockStrategy()).to.not.eq(ZERO_ADDRESS)

      await mockBaseToken.connect(owner).setMockStrategy(ZERO_ADDRESS)

      expect(await mockBaseToken.getMockStrategy()).to.eq(ZERO_ADDRESS)
    })
  })

  describe('# mint', () => {
    const testMintAmount = parseEther('1000')
    beforeEach(async () => {
      await setupAccounts()
      await setupMockBaseToken()
      await mockBaseToken.connect(owner).setMockStrategy(mockStrategy.address)
    })

    it('reverts if not mock strategy', async () => {
      expect(await mockBaseToken.getMockStrategy()).to.not.eq(user1.address)

      expect(mockBaseToken.connect(user1).mint(user1.address, testMintAmount)).revertedWith(
        revertReason('Caller is not MockStrategy')
      )
    })

    it('mints tokens to recipient', async () => {
      const balanceBefore = await mockBaseToken.balanceOf(user1.address)

      await mockBaseToken.connect(mockStrategy).mint(user1.address, testMintAmount)

      expect(await mockBaseToken.balanceOf(user1.address)).to.eq(balanceBefore.add(testMintAmount))
    })

    it('mints tokens to recipient if recipient is mock strategy', async () => {
      const balanceBefore = await mockBaseToken.balanceOf(mockStrategy.address)

      await mockBaseToken.connect(mockStrategy).mint(mockStrategy.address, testMintAmount)

      expect(await mockBaseToken.balanceOf(mockStrategy.address)).to.eq(
        balanceBefore.add(testMintAmount)
      )
    })
  })

  describe('# ownerMint', () => {
    const testMintAmount = parseEther('1000')
    beforeEach(async () => {
      await setupAccounts()
      await setupMockBaseToken()
      await mockBaseToken.connect(owner).setMockStrategy(mockStrategy.address)
    })

    it('reverts if not owner', async () => {
      expect(await mockBaseToken.owner()).to.not.eq(user1.address)

      expect(mockBaseToken.connect(user1).ownerMint(testMintAmount)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('mints tokens to owner', async () => {
      const balanceBefore = await mockBaseToken.balanceOf(owner.address)

      await mockBaseToken.connect(owner).ownerMint(testMintAmount)

      expect(await mockBaseToken.balanceOf(owner.address)).to.eq(balanceBefore.add(testMintAmount))
    })
  })
})
