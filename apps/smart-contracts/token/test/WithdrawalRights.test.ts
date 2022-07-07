import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { ZERO_ADDRESS } from 'prepo-constants'
import { withdrawalRightsFixture } from './fixtures/WithdrawalRightsFixtures'
import { revertReason } from '../utils'
import { WithdrawalRights } from '../types/generated'

describe('WithdrawalRights', () => {
  let deployer: SignerWithAddress
  let governance: SignerWithAddress
  let user1: SignerWithAddress
  let user2: SignerWithAddress
  let ppoStaking: SignerWithAddress
  let withdrawalRights: WithdrawalRights
  const testURI = 'https://newBaseURI/'

  const setupAccounts = async (): Promise<void> => {
    ;[deployer, governance, user1, user2, ppoStaking] = await ethers.getSigners()
  }

  const setupWithdrawalRights = async (): Promise<void> => {
    withdrawalRights = await withdrawalRightsFixture(governance.address)
  }

  describe('initial state', () => {
    before(async () => {
      await setupAccounts()
      await setupWithdrawalRights()
    })

    it("sets name to 'Staked PPO Withdrawal Rights'", async () => {
      expect(await withdrawalRights.name()).to.eq('Staked PPO Withdrawal Rights')
    })

    it("sets symbol to 'stkPPO-WR'", async () => {
      expect(await withdrawalRights.symbol()).to.eq('stkPPO-WR')
    })

    it('sets owner from constructor', async () => {
      expect(await withdrawalRights.owner()).to.eq(governance.address)
    })
  })

  describe('# setURI', () => {
    beforeEach(async () => {
      await setupAccounts()
      await setupWithdrawalRights()
    })

    it('reverts if not owner', async () => {
      expect(await withdrawalRights.owner()).to.not.eq(user1.address)

      expect(withdrawalRights.connect(user1).setURI(testURI)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('sets to non-empty string', async () => {
      expect(await withdrawalRights.tokenURI(0)).to.not.eq(testURI)

      await withdrawalRights.connect(governance).setURI(testURI)

      expect(await withdrawalRights.tokenURI(0)).to.eq(testURI)
    })

    it('sets to empty string', async () => {
      await withdrawalRights.connect(governance).setURI(testURI)
      expect(await withdrawalRights.tokenURI(0)).to.not.eq('')

      await withdrawalRights.connect(governance).setURI('')

      expect(await withdrawalRights.tokenURI(0)).to.eq('')
    })

    it('is idempotent', async () => {
      expect(await withdrawalRights.tokenURI(0)).to.not.eq(testURI)

      await withdrawalRights.connect(governance).setURI(testURI)

      expect(await withdrawalRights.tokenURI(0)).to.eq(testURI)

      await withdrawalRights.connect(governance).setURI(testURI)

      expect(await withdrawalRights.tokenURI(0)).to.eq(testURI)
    })
  })

  describe('# setPPOStaking', () => {
    beforeEach(async () => {
      await setupAccounts()
      await setupWithdrawalRights()
    })

    it('reverts if not owner', async () => {
      expect(await withdrawalRights.owner()).to.not.eq(user1.address)

      expect(withdrawalRights.connect(user1).setPPOStaking(ppoStaking.address)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('sets to non-zero address', async () => {
      expect(await withdrawalRights.getPPOStaking()).to.not.eq(ppoStaking.address)

      await withdrawalRights.connect(governance).setPPOStaking(ppoStaking.address)

      expect(await withdrawalRights.getPPOStaking()).to.eq(ppoStaking.address)
    })

    it('sets to zero address', async () => {
      await withdrawalRights.connect(governance).setPPOStaking(ppoStaking.address)
      expect(await withdrawalRights.getPPOStaking()).to.not.eq(ZERO_ADDRESS)

      await withdrawalRights.connect(governance).setPPOStaking(ZERO_ADDRESS)

      expect(await withdrawalRights.getPPOStaking()).to.eq(ZERO_ADDRESS)
    })

    it('is idempotent', async () => {
      expect(await withdrawalRights.getPPOStaking()).to.not.eq(ppoStaking.address)

      await withdrawalRights.connect(governance).setPPOStaking(ppoStaking.address)

      expect(await withdrawalRights.getPPOStaking()).to.eq(ppoStaking.address)

      await withdrawalRights.connect(governance).setPPOStaking(ppoStaking.address)

      expect(await withdrawalRights.getPPOStaking()).to.eq(ppoStaking.address)
    })
  })

  describe('# mint', () => {
    beforeEach(async () => {
      await setupAccounts()
      await setupWithdrawalRights()
      await withdrawalRights.connect(governance).setPPOStaking(ppoStaking.address)
    })

    it('reverts if not PPOStaking', async () => {
      expect(await withdrawalRights.getPPOStaking()).to.not.eq(user1.address)

      expect(withdrawalRights.connect(user1).mint(user1.address)).revertedWith(
        revertReason('msg.sender != PPOStaking')
      )
    })

    it("increments recipient's balance by 1", async () => {
      const user1BalanceBefore = await withdrawalRights.balanceOf(user1.address)

      await withdrawalRights.connect(ppoStaking).mint(user1.address)

      expect(await withdrawalRights.balanceOf(user1.address)).to.eq(user1BalanceBefore.add(1))
    })

    it('sets tokenId owner to recipient', async () => {
      await expect(withdrawalRights.ownerOf(0)).to.be.revertedWith(
        'ERC721: owner query for nonexistent token'
      )

      await withdrawalRights.connect(ppoStaking).mint(user1.address)

      expect(await withdrawalRights.ownerOf(0)).to.eq(user1.address)
    })
  })
})
