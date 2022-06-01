import chai, { expect } from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { Contract } from 'ethers'
import { FakeContract, smock } from '@defi-wonderland/smock'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { mockERC20Fixture } from './fixtures/MockERC20Fixture'
import { proRataActionRewardsFixture } from './fixtures/ProRataActionRewardsFixture'
import { AddressZero, getLastTimestamp, mineBlocks, revertReason, setNextTimestamp } from './utils'
import { ProRataActionRewards } from '../typechain/ProRataActionRewards'
import { MockERC20 } from '../typechain/MockERC20'

chai.use(solidity)
chai.use(smock.matchers)

describe('=> ProRataActionRewards', () => {
  let deployer: SignerWithAddress
  let owner: SignerWithAddress
  let user1: SignerWithAddress
  let user2: SignerWithAddress
  let proRataActionRewards: ProRataActionRewards
  let currTimestamp: number
  let mockERC20: MockERC20
  let fakeActionHook: FakeContract<Contract>
  const PERIOD_LENGTH = 24 * 60 * 60
  const USER_ACTION_LIMIT_PER_PERIOD = 2
  const REWARD_AMOUNT_PER_PERIOD = 100
  const SAMPLE_ADDRESS = '0x0000000000000000000000000000000000001234'

  const setupProRataActionRewards = async (): Promise<void> => {
    ;[deployer, user1, user2] = await ethers.getSigners()
    owner = deployer
    proRataActionRewards = await proRataActionRewardsFixture()
  }

  describe('# initialize', () => {
    beforeEach(async () => {
      await setupProRataActionRewards()
    })

    it('sets owner as deployer', async () => {
      expect(await proRataActionRewards.owner()).to.eq(deployer.address)
    })
  })

  describe('# setPeriodLength', () => {
    beforeEach(async () => {
      await setupProRataActionRewards()
    })

    it('reverts if not owner', async () => {
      expect(await proRataActionRewards.owner()).to.not.eq(user1.address)

      expect(proRataActionRewards.connect(user1).setPeriodLength(PERIOD_LENGTH)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('sets to non-zero value', async () => {
      expect(await proRataActionRewards.getPeriodLength()).to.not.eq(PERIOD_LENGTH)
      expect(PERIOD_LENGTH).to.not.eq(0)

      await proRataActionRewards.connect(owner).setPeriodLength(PERIOD_LENGTH)

      expect(await proRataActionRewards.getPeriodLength()).to.eq(PERIOD_LENGTH)
    })

    it('sets to 0', async () => {
      await proRataActionRewards.connect(owner).setPeriodLength(PERIOD_LENGTH)
      expect(await proRataActionRewards.getPeriodLength()).to.not.eq(0)

      await proRataActionRewards.connect(owner).setPeriodLength(0)

      expect(await proRataActionRewards.getPeriodLength()).to.eq(0)
    })

    it('is idempotent', async () => {
      expect(await proRataActionRewards.getPeriodLength()).to.not.eq(PERIOD_LENGTH)

      await proRataActionRewards.connect(owner).setPeriodLength(PERIOD_LENGTH)

      expect(await proRataActionRewards.getPeriodLength()).to.eq(PERIOD_LENGTH)

      await proRataActionRewards.connect(owner).setPeriodLength(PERIOD_LENGTH)

      expect(await proRataActionRewards.getPeriodLength()).to.eq(PERIOD_LENGTH)
    })
  })

  describe('# setUserActionLimitPerPeriod', () => {
    beforeEach(async () => {
      await setupProRataActionRewards()
    })

    it('reverts if not owner', async () => {
      expect(await proRataActionRewards.owner()).to.not.eq(user1.address)

      expect(
        proRataActionRewards
          .connect(user1)
          .setUserActionLimitPerPeriod(USER_ACTION_LIMIT_PER_PERIOD)
      ).revertedWith(revertReason('Ownable: caller is not the owner'))
    })

    it('sets to non-zero value', async () => {
      expect(await proRataActionRewards.getUserActionLimitPerPeriod()).to.not.eq(
        USER_ACTION_LIMIT_PER_PERIOD
      )
      expect(USER_ACTION_LIMIT_PER_PERIOD).to.not.eq(0)

      await proRataActionRewards
        .connect(owner)
        .setUserActionLimitPerPeriod(USER_ACTION_LIMIT_PER_PERIOD)

      expect(await proRataActionRewards.getUserActionLimitPerPeriod()).to.eq(
        USER_ACTION_LIMIT_PER_PERIOD
      )
    })

    it('sets to 0', async () => {
      await proRataActionRewards
        .connect(owner)
        .setUserActionLimitPerPeriod(USER_ACTION_LIMIT_PER_PERIOD)
      expect(await proRataActionRewards.getUserActionLimitPerPeriod()).to.not.eq(0)

      await proRataActionRewards.connect(owner).setUserActionLimitPerPeriod(0)

      expect(await proRataActionRewards.getUserActionLimitPerPeriod()).to.eq(0)
    })

    it('is idempotent', async () => {
      expect(await proRataActionRewards.getUserActionLimitPerPeriod()).to.not.eq(
        USER_ACTION_LIMIT_PER_PERIOD
      )

      await proRataActionRewards
        .connect(owner)
        .setUserActionLimitPerPeriod(USER_ACTION_LIMIT_PER_PERIOD)

      expect(await proRataActionRewards.getUserActionLimitPerPeriod()).to.eq(
        USER_ACTION_LIMIT_PER_PERIOD
      )

      await proRataActionRewards
        .connect(owner)
        .setUserActionLimitPerPeriod(USER_ACTION_LIMIT_PER_PERIOD)

      expect(await proRataActionRewards.getUserActionLimitPerPeriod()).to.eq(
        USER_ACTION_LIMIT_PER_PERIOD
      )
    })
  })

  describe('# setRewardAmountPerPeriod', () => {
    beforeEach(async () => {
      await setupProRataActionRewards()
    })

    it('reverts if not owner', async () => {
      expect(await proRataActionRewards.owner()).to.not.eq(user1.address)

      expect(
        proRataActionRewards.connect(user1).setRewardAmountPerPeriod(REWARD_AMOUNT_PER_PERIOD)
      ).revertedWith(revertReason('Ownable: caller is not the owner'))
    })

    it('sets to non-zero value', async () => {
      expect(await proRataActionRewards.getRewardAmountPerPeriod()).to.not.eq(
        REWARD_AMOUNT_PER_PERIOD
      )
      expect(REWARD_AMOUNT_PER_PERIOD).to.not.eq(0)

      await proRataActionRewards.connect(owner).setRewardAmountPerPeriod(REWARD_AMOUNT_PER_PERIOD)

      expect(await proRataActionRewards.getRewardAmountPerPeriod()).to.eq(REWARD_AMOUNT_PER_PERIOD)
    })

    it('sets to 0', async () => {
      await proRataActionRewards.connect(owner).setRewardAmountPerPeriod(REWARD_AMOUNT_PER_PERIOD)
      expect(await proRataActionRewards.getRewardAmountPerPeriod()).to.not.eq(0)

      await proRataActionRewards.connect(owner).setRewardAmountPerPeriod(0)

      expect(await proRataActionRewards.getRewardAmountPerPeriod()).to.eq(0)
    })

    it('is idempotent', async () => {
      expect(await proRataActionRewards.getRewardAmountPerPeriod()).to.not.eq(
        REWARD_AMOUNT_PER_PERIOD
      )

      await proRataActionRewards.connect(owner).setRewardAmountPerPeriod(REWARD_AMOUNT_PER_PERIOD)

      expect(await proRataActionRewards.getRewardAmountPerPeriod()).to.eq(REWARD_AMOUNT_PER_PERIOD)

      await proRataActionRewards.connect(owner).setRewardAmountPerPeriod(REWARD_AMOUNT_PER_PERIOD)

      expect(await proRataActionRewards.getRewardAmountPerPeriod()).to.eq(REWARD_AMOUNT_PER_PERIOD)
    })
  })

  describe('# setRewardToken', () => {
    beforeEach(async () => {
      await setupProRataActionRewards()
    })

    it('reverts if not owner', async () => {
      expect(await proRataActionRewards.owner()).to.not.eq(user1.address)

      expect(proRataActionRewards.connect(user1).setRewardToken(SAMPLE_ADDRESS)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('sets to non-zero address', async () => {
      expect(await proRataActionRewards.getRewardToken()).to.not.eq(SAMPLE_ADDRESS)
      expect(SAMPLE_ADDRESS).to.not.eq(AddressZero)

      await proRataActionRewards.connect(owner).setRewardToken(SAMPLE_ADDRESS)

      expect(await proRataActionRewards.getRewardToken()).to.eq(SAMPLE_ADDRESS)
    })

    it('sets to zero address', async () => {
      await proRataActionRewards.connect(owner).setRewardToken(SAMPLE_ADDRESS)
      expect(await proRataActionRewards.getRewardToken()).to.not.eq(AddressZero)

      await proRataActionRewards.connect(owner).setRewardToken(AddressZero)

      expect(await proRataActionRewards.getRewardToken()).to.eq(AddressZero)
    })

    it('is idempotent', async () => {
      expect(await proRataActionRewards.getRewardToken()).to.not.eq(SAMPLE_ADDRESS)

      await proRataActionRewards.connect(owner).setRewardToken(SAMPLE_ADDRESS)

      expect(await proRataActionRewards.getRewardToken()).to.eq(SAMPLE_ADDRESS)

      await proRataActionRewards.connect(owner).setRewardToken(SAMPLE_ADDRESS)

      expect(await proRataActionRewards.getRewardToken()).to.eq(SAMPLE_ADDRESS)
    })
  })

  describe('# setActionHook', () => {
    beforeEach(async () => {
      await setupProRataActionRewards()
    })

    it('reverts if not owner', async () => {
      expect(await proRataActionRewards.owner()).to.not.eq(user1.address)
      expect(proRataActionRewards.connect(user1).setActionHook(SAMPLE_ADDRESS)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('sets to non-zero address', async () => {
      expect(await proRataActionRewards.getActionHook()).to.not.eq(SAMPLE_ADDRESS)
      expect(SAMPLE_ADDRESS).to.not.eq(AddressZero)

      await proRataActionRewards.connect(owner).setActionHook(SAMPLE_ADDRESS)

      expect(await proRataActionRewards.getActionHook()).to.eq(SAMPLE_ADDRESS)
    })

    it('sets to zero address', async () => {
      await proRataActionRewards.connect(owner).setActionHook(SAMPLE_ADDRESS)
      expect(await proRataActionRewards.getActionHook()).to.not.eq(AddressZero)

      await proRataActionRewards.connect(owner).setActionHook(AddressZero)

      expect(await proRataActionRewards.getActionHook()).to.eq(AddressZero)
    })

    it('is idempotent', async () => {
      expect(await proRataActionRewards.getActionHook()).to.not.eq(SAMPLE_ADDRESS)

      await proRataActionRewards.connect(owner).setActionHook(SAMPLE_ADDRESS)

      expect(await proRataActionRewards.getActionHook()).to.eq(SAMPLE_ADDRESS)

      await proRataActionRewards.connect(owner).setActionHook(SAMPLE_ADDRESS)

      expect(await proRataActionRewards.getActionHook()).to.eq(SAMPLE_ADDRESS)
    })
  })

  describe('# action', () => {
    beforeEach(async () => {
      await setupProRataActionRewards()
      await proRataActionRewards.connect(owner).setPeriodLength(PERIOD_LENGTH)
      await proRataActionRewards
        .connect(owner)
        .setUserActionLimitPerPeriod(USER_ACTION_LIMIT_PER_PERIOD)
      fakeActionHook = await smock.fake('IActionHook')
    })

    it('increments action counts by 1', async () => {
      const user1CurrActionCount = await proRataActionRewards.getCurrActionCount(user1.address)
      const user2CurrActionCount = await proRataActionRewards.getCurrActionCount(user2.address)
      const totalCurrActionCount = await proRataActionRewards.getTotalCurrActionCount()

      await proRataActionRewards.connect(user1).action()

      expect(await proRataActionRewards.getCurrActionCount(user1.address)).to.eq(
        user1CurrActionCount.add(1)
      )
      expect(await proRataActionRewards.getCurrActionCount(user2.address)).to.eq(
        user2CurrActionCount
      )
      expect(await proRataActionRewards.getTotalCurrActionCount()).to.eq(
        totalCurrActionCount.add(1)
      )
    })

    it('reverts if user action limit exceeded', async () => {
      await proRataActionRewards.connect(user1).action()
      await proRataActionRewards.connect(user1).action()
      expect(await proRataActionRewards.getCurrActionCount(user1.address)).to.eq(
        await proRataActionRewards.getUserActionLimitPerPeriod()
      )

      await expect(proRataActionRewards.connect(user1).action()).revertedWith(
        revertReason('Action limit exceeded')
      )
    })

    it('resets user action counts if new period since last call', async () => {
      await proRataActionRewards.connect(user1).action()
      await proRataActionRewards.connect(user1).action()
      const userCurrActionCountBeforePeriodTransition =
        await proRataActionRewards.getCurrActionCount(user1.address)
      const totalCurrActionCountBeforePeriodTransition =
        await proRataActionRewards.getTotalCurrActionCount()
      const userPrevActionCountBeforePeriodTransition =
        await proRataActionRewards.getPrevActionCount(user1.address)
      const totalPrevActionCountBeforePeriodTransition =
        await proRataActionRewards.getTotalPrevActionCount()
      currTimestamp = await getLastTimestamp()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, currTimestamp + PERIOD_LENGTH)

      await proRataActionRewards.connect(user1).action()

      expect(await proRataActionRewards.getCurrActionCount(user1.address)).to.not.eq(
        userCurrActionCountBeforePeriodTransition.add(1)
      )
      expect(await proRataActionRewards.getTotalCurrActionCount()).to.not.eq(
        totalCurrActionCountBeforePeriodTransition.add(1)
      )
      expect(await proRataActionRewards.getPrevActionCount(user1.address)).to.not.eq(
        userPrevActionCountBeforePeriodTransition
      )
      expect(await proRataActionRewards.getTotalPrevActionCount()).to.not.eq(
        totalPrevActionCountBeforePeriodTransition
      )
      expect(await proRataActionRewards.getPrevActionCount(user1.address)).to.eq(
        userCurrActionCountBeforePeriodTransition
      )
      expect(await proRataActionRewards.getTotalPrevActionCount()).to.eq(
        totalCurrActionCountBeforePeriodTransition
      )
    })

    it('skips hook call if hook address is zero', async () => {
      expect(await proRataActionRewards.getActionHook()).to.be.eq(AddressZero)

      await proRataActionRewards.connect(user1).action()

      expect(fakeActionHook.hook).to.not.have.been.called
    })

    it('calls hook if hook address is non-zero', async () => {
      await proRataActionRewards.connect(owner).setActionHook(fakeActionHook.address)
      expect(await proRataActionRewards.getActionHook()).to.not.eq(AddressZero)

      await proRataActionRewards.connect(user1).action()

      expect(fakeActionHook.hook).to.have.been.called
    })

    it('reverts if hook reverts', async () => {
      await proRataActionRewards.connect(owner).setActionHook(fakeActionHook.address)
      expect(await proRataActionRewards.getActionHook()).to.not.eq(AddressZero)
      fakeActionHook.hook.reverts()

      await expect(proRataActionRewards.connect(user1).action()).to.be.reverted
      expect(fakeActionHook.hook).to.have.been.calledOnce
    })
  })

  describe('# withdrawERC20', () => {
    beforeEach(async () => {
      await setupProRataActionRewards()
      mockERC20 = await mockERC20Fixture('Mock ERC20', 'MERC20')
      await mockERC20.mint(proRataActionRewards.address, 100)
    })

    it('reverts if not owner', async () => {
      expect(await proRataActionRewards.owner()).to.not.eq(user1.address)
      const actionContractTokenBalance = await mockERC20.balanceOf(proRataActionRewards.address)

      await expect(
        proRataActionRewards
          .connect(user1)
          .withdrawERC20(mockERC20.address, actionContractTokenBalance)
      ).revertedWith(revertReason('Ownable: caller is not the owner'))
    })

    it('reverts if withdraw amount > balance', async () => {
      const actionContractTokenBalance = await mockERC20.balanceOf(proRataActionRewards.address)
      expect(actionContractTokenBalance).to.be.gt(0)

      await expect(
        proRataActionRewards
          .connect(owner)
          .withdrawERC20(mockERC20.address, actionContractTokenBalance.add(1))
      ).revertedWith(revertReason('ERC20: transfer amount exceeds balance'))
    })

    it('transfers ERC20 to owner', async () => {
      const ownerTokenBalanceBefore = await mockERC20.balanceOf(owner.address)
      const contractTokenBalanceBefore = await mockERC20.balanceOf(proRataActionRewards.address)
      const amountWithdrawn = 10

      await proRataActionRewards.connect(owner).withdrawERC20(mockERC20.address, amountWithdrawn)

      expect(await mockERC20.balanceOf(owner.address)).to.be.eq(
        ownerTokenBalanceBefore.add(amountWithdrawn)
      )
      expect(await mockERC20.balanceOf(proRataActionRewards.address)).to.be.eq(
        contractTokenBalanceBefore.sub(amountWithdrawn)
      )
    })
  })

  describe('# getCurrActionCount', () => {
    beforeEach(async () => {
      await setupProRataActionRewards()
      await proRataActionRewards.connect(owner).setPeriodLength(PERIOD_LENGTH)
      await proRataActionRewards
        .connect(owner)
        .setUserActionLimitPerPeriod(USER_ACTION_LIMIT_PER_PERIOD)
      await proRataActionRewards.connect(user1).action()
    })

    it('returns unchanged action count if time passed < period length', async () => {
      const startTime = await getLastTimestamp()
      const user1CurrActionCount = await proRataActionRewards.getCurrActionCount(user1.address)
      expect(user1CurrActionCount).to.be.gt(0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlocks(ethers.provider as any, 1)
      const timePassesSincePeriodStart = (await getLastTimestamp()) - startTime
      expect(timePassesSincePeriodStart).to.be.lt(await proRataActionRewards.getPeriodLength())

      expect(await proRataActionRewards.getCurrActionCount(user1.address)).to.eq(
        user1CurrActionCount
      )
    })

    it('returns unchanged count if time passed = period length', async () => {
      const startTime = await getLastTimestamp()
      const user1CurrActionCount = await proRataActionRewards.getCurrActionCount(user1.address)
      expect(user1CurrActionCount).to.be.gt(0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, startTime + PERIOD_LENGTH)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlocks(ethers.provider as any, 1)
      const timePassesSincePeriodStart = (await getLastTimestamp()) - startTime
      expect(timePassesSincePeriodStart).to.be.eq(await proRataActionRewards.getPeriodLength())

      expect(await proRataActionRewards.getCurrActionCount(user1.address)).to.eq(
        user1CurrActionCount
      )
    })

    it('returns 0 if time passed > period length', async () => {
      const startTime = await getLastTimestamp()
      const user1CurrActionCount = await proRataActionRewards.getCurrActionCount(user1.address)
      expect(user1CurrActionCount).to.be.gt(0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, startTime + PERIOD_LENGTH)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlocks(ethers.provider as any, 2)
      const timePassesSincePeriodStart = (await getLastTimestamp()) - startTime
      expect(timePassesSincePeriodStart).to.be.gt(await proRataActionRewards.getPeriodLength())

      const user1CurrActionCountAfter = await proRataActionRewards.getCurrActionCount(user1.address)

      expect(user1CurrActionCountAfter).to.eq(0)
    })
  })

  describe('# getTotalCurrActionCount', () => {
    beforeEach(async () => {
      await setupProRataActionRewards()
      await proRataActionRewards.connect(owner).setPeriodLength(PERIOD_LENGTH)
      await proRataActionRewards
        .connect(owner)
        .setUserActionLimitPerPeriod(USER_ACTION_LIMIT_PER_PERIOD)
      await proRataActionRewards.connect(user1).action()
    })

    it('returns unchanged count if time passed < period length', async () => {
      const startTime = await getLastTimestamp()
      const totalCurrActionCount = await proRataActionRewards.getTotalCurrActionCount()
      expect(totalCurrActionCount).to.be.gt(0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mineBlocks(ethers.provider as any, 1)
      const timePassesSincePeriodStart = (await getLastTimestamp()) - startTime
      expect(timePassesSincePeriodStart).to.be.lt(await proRataActionRewards.getPeriodLength())

      expect(await proRataActionRewards.getTotalCurrActionCount()).to.eq(totalCurrActionCount)
    })

    it('returns unchanged count if time passed = period length', async () => {
      const startTime = await getLastTimestamp()
      const totalCurrActionCount = await proRataActionRewards.getTotalCurrActionCount()
      expect(totalCurrActionCount).to.be.gt(0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, startTime + PERIOD_LENGTH)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlocks(ethers.provider as any, 1)
      const timePassesSincePeriodStart = (await getLastTimestamp()) - startTime
      expect(timePassesSincePeriodStart).to.be.eq(await proRataActionRewards.getPeriodLength())

      expect(await proRataActionRewards.getTotalCurrActionCount()).to.eq(totalCurrActionCount)
    })

    it('returns 0 if time passed > period length', async () => {
      const startTime = await getLastTimestamp()
      const totalCurrActionCount = await proRataActionRewards.getTotalCurrActionCount()
      expect(totalCurrActionCount).to.be.gt(0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, startTime + PERIOD_LENGTH)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlocks(ethers.provider as any, 2)
      const timePassesSincePeriodStart = (await getLastTimestamp()) - startTime
      expect(timePassesSincePeriodStart).to.be.gt(await proRataActionRewards.getPeriodLength())

      const totalCurrActionCountAfter = await proRataActionRewards.getTotalCurrActionCount()

      expect(totalCurrActionCountAfter).to.eq(0)
    })
  })

  describe('# getPrevActionCount', () => {
    beforeEach(async () => {
      await setupProRataActionRewards()
      await proRataActionRewards.connect(owner).setPeriodLength(PERIOD_LENGTH)
      await proRataActionRewards
        .connect(owner)
        .setUserActionLimitPerPeriod(USER_ACTION_LIMIT_PER_PERIOD)
      await proRataActionRewards.connect(user1).action()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, (await getLastTimestamp()) + PERIOD_LENGTH)
      // mining a block sets the block timestamp a little more than the period length
      // when user calls action and thus period transition block gets executed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlocks(ethers.provider as any, 1)
      await proRataActionRewards.connect(user1).action()
    })

    it("returns unchanged count if time since last action's period start < period", async () => {
      const startTime = await getLastTimestamp()
      const user1PrevActionCount = await proRataActionRewards.getPrevActionCount(user1.address)
      expect(user1PrevActionCount).to.be.gt(0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mineBlocks(ethers.provider as any, 1)
      const timePassesSincePeriodStart = (await getLastTimestamp()) - startTime
      expect(timePassesSincePeriodStart).to.be.lt(await proRataActionRewards.getPeriodLength())

      const user1PrevActionCountAfter = await proRataActionRewards.getPrevActionCount(user1.address)

      expect(user1PrevActionCountAfter).to.eq(user1PrevActionCount)
    })

    it("returns unchanged count if time since last action's period start = period", async () => {
      const startTime = await getLastTimestamp()
      const user1PrevActionCount = await proRataActionRewards.getPrevActionCount(user1.address)
      expect(user1PrevActionCount).to.be.gt(0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, startTime + PERIOD_LENGTH)
      // mining a block to set the block time defined above
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlocks(ethers.provider as any, 1)
      const timePassesSincePeriodStart = (await getLastTimestamp()) - startTime
      expect(timePassesSincePeriodStart).to.be.eq(await proRataActionRewards.getPeriodLength())

      const user1PrevActionCountAfter = await proRataActionRewards.getPrevActionCount(user1.address)

      expect(user1PrevActionCountAfter).to.eq(user1PrevActionCount)
    })

    it("returns curr action count if time since last action's period start > period and < 2 times period", async () => {
      const startTime = await getLastTimestamp()
      await proRataActionRewards.connect(user1).action()
      const user1PrevActionCount = await proRataActionRewards.getPrevActionCount(user1.address)
      const user1CurrActionCount = await proRataActionRewards.getCurrActionCount(user1.address)
      expect(user1CurrActionCount).to.not.eq(user1PrevActionCount)
      expect(user1CurrActionCount).to.be.gt(0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, startTime + PERIOD_LENGTH)
      // mining 2 block to increase the block time a little more than PERIOD_LENGTH
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlocks(ethers.provider as any, 2)
      const timePassesSincePeriodStart = (await getLastTimestamp()) - startTime
      expect(timePassesSincePeriodStart).to.be.gt(await proRataActionRewards.getPeriodLength())
      expect(timePassesSincePeriodStart).to.be.lt(
        (await proRataActionRewards.getPeriodLength()).mul(2)
      )

      const user1PrevActionCountAfter = await proRataActionRewards.getPrevActionCount(user1.address)

      expect(user1PrevActionCountAfter).to.not.eq(user1PrevActionCount)
      expect(user1PrevActionCountAfter).to.eq(user1CurrActionCount)
    })

    it("returns curr action count if time since last action's period start = 2 times period", async () => {
      const startTime = await getLastTimestamp()
      await proRataActionRewards.connect(user1).action()
      const user1PrevActionCount = await proRataActionRewards.getPrevActionCount(user1.address)
      const user1CurrActionCount = await proRataActionRewards.getCurrActionCount(user1.address)
      expect(user1CurrActionCount).to.not.eq(user1PrevActionCount)
      expect(user1CurrActionCount).to.be.gt(0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, startTime + 2 * PERIOD_LENGTH)
      // mining a block to set the block time as defined above
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlocks(ethers.provider as any, 1)
      const timePassesSincePeriodStart = (await getLastTimestamp()) - startTime
      expect(timePassesSincePeriodStart).to.be.eq(
        (await proRataActionRewards.getPeriodLength()).mul(2)
      )

      const user1PrevActionCountAfter = await proRataActionRewards.getPrevActionCount(user1.address)

      expect(user1PrevActionCountAfter).to.not.eq(user1PrevActionCount)
      expect(user1PrevActionCountAfter).to.eq(user1CurrActionCount)
    })

    it("returns 0 if if time since last action's period start > 2 times period", async () => {
      const startTime = await getLastTimestamp()
      await proRataActionRewards.connect(user1).action()
      const user1PrevActionCount = await proRataActionRewards.getPrevActionCount(user1.address)
      const user1CurrActionCount = await proRataActionRewards.getCurrActionCount(user1.address)
      expect(user1CurrActionCount).to.not.eq(user1PrevActionCount)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, startTime + 2 * PERIOD_LENGTH)
      // mining 2 block to increase the block time a little more than 2*PERIOD_LENGTH
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlocks(ethers.provider as any, 2)
      const timePassesSincePeriodStart = (await getLastTimestamp()) - startTime
      expect(timePassesSincePeriodStart).to.be.gt(
        (await proRataActionRewards.getPeriodLength()).mul(2)
      )

      const user1PrevActionCountAfter = await proRataActionRewards.getPrevActionCount(user1.address)

      expect(user1PrevActionCountAfter).to.not.eq(user1PrevActionCount)
      expect(user1PrevActionCountAfter).to.not.eq(user1CurrActionCount)
      expect(user1PrevActionCountAfter).to.eq(0)
    })
  })

  describe('# getTotalPrevActionCount', () => {
    beforeEach(async () => {
      await setupProRataActionRewards()
      await proRataActionRewards.connect(owner).setPeriodLength(PERIOD_LENGTH)
      await proRataActionRewards
        .connect(owner)
        .setUserActionLimitPerPeriod(USER_ACTION_LIMIT_PER_PERIOD)
      await proRataActionRewards.connect(user1).action()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, (await getLastTimestamp()) + PERIOD_LENGTH)
      // mining a block sets the block timestamp a little more than the period length
      // when user calls action and thus period transition block gets executed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlocks(ethers.provider as any, 1)
      await proRataActionRewards.connect(user1).action()
    })

    it("returns total prev action count if time since last action's period start < period", async () => {
      const startTime = await getLastTimestamp()
      const totalPrevActionCountBefore = await proRataActionRewards.getTotalPrevActionCount()
      expect(totalPrevActionCountBefore).to.be.gt(0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlocks(ethers.provider as any, 1) // to increase the block time
      const timestamp2 = await getLastTimestamp()
      expect(timestamp2 - startTime).to.be.lt(await proRataActionRewards.getPeriodLength())

      const totalPrevActionCountAfter = await proRataActionRewards.getTotalPrevActionCount()

      expect(totalPrevActionCountAfter).to.eq(totalPrevActionCountBefore)
    })

    it("returns total prev action count if time since last action's period start = period", async () => {
      const startTime = await getLastTimestamp()
      const totalPrevActionCountBefore = await proRataActionRewards.getTotalPrevActionCount()
      expect(totalPrevActionCountBefore).to.be.gt(0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, startTime + PERIOD_LENGTH)
      // mining a block to set the block time defined above
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlocks(ethers.provider as any, 1)
      const timestamp2 = await getLastTimestamp()
      expect(timestamp2 - startTime).to.be.eq(await proRataActionRewards.getPeriodLength())

      const totalPrevActionCountAfter = await proRataActionRewards.getTotalPrevActionCount()

      expect(totalPrevActionCountAfter).to.eq(totalPrevActionCountBefore)
    })

    it("returns total curr action count if time since last action's period start > period and < 2 times period", async () => {
      const startTime = await getLastTimestamp()
      await proRataActionRewards.connect(user1).action()
      const totalPrevActionCountBefore = await proRataActionRewards.getTotalPrevActionCount()
      const totalCurrActionCountBefore = await proRataActionRewards.getTotalCurrActionCount()
      expect(totalPrevActionCountBefore).to.not.eq(totalCurrActionCountBefore)
      expect(totalCurrActionCountBefore).to.be.gt(0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, startTime + PERIOD_LENGTH)
      // mining 2 block to increase the block time a little more than PERIOD_LENGTH
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlocks(ethers.provider as any, 2)
      const timestamp2 = await getLastTimestamp()
      expect(timestamp2 - startTime).to.be.gt(await proRataActionRewards.getPeriodLength())
      expect(timestamp2 - startTime).to.be.lt((await proRataActionRewards.getPeriodLength()).mul(2))

      const totalPrevActionCountAfter = await proRataActionRewards.getPrevActionCount(user1.address)

      expect(totalPrevActionCountAfter).to.not.eq(totalPrevActionCountBefore)
      expect(totalPrevActionCountAfter).to.eq(totalCurrActionCountBefore)
    })

    it("returns total curr action count if time since last action's period start = 2 times period", async () => {
      const startTime = await getLastTimestamp()
      await proRataActionRewards.connect(user1).action()
      const totalPrevActionCountBefore = await proRataActionRewards.getTotalPrevActionCount()
      const totalCurrActionCountBefore = await proRataActionRewards.getTotalCurrActionCount()
      expect(totalPrevActionCountBefore).to.not.eq(totalCurrActionCountBefore)
      expect(totalCurrActionCountBefore).to.be.gt(0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, startTime + 2 * PERIOD_LENGTH)
      // mining a block to set the block time as defined above
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlocks(ethers.provider as any, 1)
      const timestamp2 = await getLastTimestamp()
      expect(timestamp2 - startTime).to.be.eq((await proRataActionRewards.getPeriodLength()).mul(2))

      const totalPrevActionCountAfter = await proRataActionRewards.getPrevActionCount(user1.address)

      expect(totalPrevActionCountAfter).to.not.eq(totalPrevActionCountBefore)
      expect(totalPrevActionCountAfter).to.eq(totalCurrActionCountBefore)
    })

    it("returns 0 if time since last action's period start passed > 2 times period", async () => {
      const startTime = await getLastTimestamp()
      await proRataActionRewards.connect(user1).action()
      const totalPrevActionCountBefore = await proRataActionRewards.getTotalPrevActionCount()
      const totalCurrActionCountBefore = await proRataActionRewards.getTotalCurrActionCount()
      expect(totalPrevActionCountBefore).to.not.eq(totalCurrActionCountBefore)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, startTime + 2 * PERIOD_LENGTH)
      // mining 2 block to increase the block time a little more than 2*PERIOD_LENGTH
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlocks(ethers.provider as any, 2)
      const timestamp2 = await getLastTimestamp()
      expect(timestamp2 - startTime).to.be.gt((await proRataActionRewards.getPeriodLength()).mul(2))

      const totalPrevActionCountAfter = await proRataActionRewards.getPrevActionCount(user1.address)

      expect(totalPrevActionCountAfter).to.not.eq(totalPrevActionCountBefore)
      expect(totalPrevActionCountAfter).to.not.eq(totalCurrActionCountBefore)
      expect(totalPrevActionCountAfter).to.eq(0)
    })
  })
})
