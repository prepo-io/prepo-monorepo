import { ethers } from 'hardhat'
import { expect } from 'chai'
import { utils } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { mockERC20Fixture } from './fixtures/MockERC20Fixture'
import { acquisitionRoyaleInternshipFixture } from './fixtures/AcquisitionRoyaleInternshipFixture'
import { mockInternshipAttackFixture } from './fixtures/MockInternshipAttackFixture'
import { getLastTimestamp, mineBlock, setNextTimestamp } from './utils'
import { MockERC20 } from '../typechain/MockERC20'
import { AcquisitionRoyaleInternship } from '../typechain/AcquisitionRoyaleInternship'
import { MockInternshipAttack } from '../typechain/MockInternshipAttack'

const { parseEther } = utils

describe('AcquistiionRoyaleInternship', () => {
  let deployer: SignerWithAddress
  let user: SignerWithAddress
  let user2: SignerWithAddress
  let runwayPoints: MockERC20
  let internship: AcquisitionRoyaleInternship
  let attackInternship1: MockInternshipAttack
  let attackInternship2: MockInternshipAttack
  let testGlobalDayStartTime: number
  const ONE_HOUR = 3600 // 3600 seconds in a hour
  const ONE_DAY = ONE_HOUR * 24 // 24 hours in a day
  const defaultTasksPerDay = 10
  const defaultRpPerInternPerDay = parseEther('5')
  const defaultGlobalRpLimitPerDay = parseEther('500')
  const defaultClaimDelay = ONE_HOUR * 8 // Default delay is 8 hours

  beforeEach(async () => {
    ;[deployer, user, user2] = await ethers.getSigners()
    runwayPoints = await mockERC20Fixture('Runway Points', 'RP')
    await runwayPoints.connect(deployer).mint(deployer.address, parseEther('1000000'))
    testGlobalDayStartTime = await getLastTimestamp()
    internship = await acquisitionRoyaleInternshipFixture()
    await internship.initialize(
      runwayPoints.address,
      defaultTasksPerDay,
      defaultRpPerInternPerDay,
      defaultGlobalRpLimitPerDay
    )
  })

  describe('# initialize', () => {
    it('should be initialized with correct values', async () => {
      expect(await internship.getRunwayPoints()).to.eq(runwayPoints.address)
      expect(await internship.getTasksPerDay()).to.eq(defaultTasksPerDay)
      expect(await internship.getRpPerInternPerDay()).to.eq(defaultRpPerInternPerDay)
      expect(await internship.getGlobalRpLimitPerDay()).to.eq(defaultGlobalRpLimitPerDay)
      expect(await internship.getClaimDelay()).to.eq(defaultClaimDelay)
    })
  })

  describe('# ownerWithdraw', () => {
    const testContractRp = parseEther('10')
    const testWithdrawalAmount = testContractRp.sub(parseEther('1'))
    beforeEach(async () => {
      await runwayPoints.connect(deployer).transfer(internship.address, testContractRp)
    })

    it('should only be usable by the owner', async () => {
      expect(await internship.owner()).to.not.eq(user.address)

      await expect(internship.connect(user).ownerWithdraw(testWithdrawalAmount)).revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should transfer `amount` RP out of the contract to the owner', async () => {
      const ownerBalanceBefore = await runwayPoints.balanceOf(deployer.address)
      expect(await runwayPoints.balanceOf(internship.address)).to.eq(testContractRp)

      await internship.connect(deployer).ownerWithdraw(testWithdrawalAmount)

      expect(await runwayPoints.balanceOf(deployer.address)).to.eq(
        ownerBalanceBefore.add(testWithdrawalAmount)
      )
      expect(await runwayPoints.balanceOf(internship.address)).to.eq(
        testContractRp.sub(testWithdrawalAmount)
      )
    })
  })

  describe('# setTasksPerDay', () => {
    const testTasksPerDay = defaultTasksPerDay + 1
    it('should only be usable by the owner', async () => {
      expect(await internship.owner()).to.not.eq(user.address)

      await expect(internship.connect(user).setTasksPerDay(testTasksPerDay)).revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should not allow setting `tasksPerDay` to zero', async () => {
      expect(await internship.getTasksPerDay()).to.eq(defaultTasksPerDay)

      await expect(internship.connect(deployer).setTasksPerDay(0)).revertedWith('Cannot be zero')
    })

    it('should correctly set `tasksPerDay` to a new value', async () => {
      expect(await internship.getTasksPerDay()).to.eq(defaultTasksPerDay)

      await internship.connect(deployer).setTasksPerDay(testTasksPerDay)

      expect(await internship.getTasksPerDay()).to.eq(testTasksPerDay)
    })

    it('should correctly set the same value twice', async () => {
      expect(await internship.getTasksPerDay()).to.eq(defaultTasksPerDay)
      await internship.connect(deployer).setTasksPerDay(testTasksPerDay)
      expect(await internship.getTasksPerDay()).to.eq(testTasksPerDay)

      await internship.connect(deployer).setTasksPerDay(testTasksPerDay)

      expect(await internship.getTasksPerDay()).to.eq(testTasksPerDay)
    })
  })

  describe('# setRpPerInternPerDay', () => {
    const testRpPerInternPerDay = defaultRpPerInternPerDay.add(parseEther('1'))
    it('should only be usable by the owner', async () => {
      expect(await internship.owner()).to.not.eq(user.address)

      await expect(
        internship.connect(user).setRpPerInternPerDay(testRpPerInternPerDay)
      ).revertedWith('Ownable: caller is not the owner')
    })

    it('should correctly set `rpPerInternPerDay` to a new value', async () => {
      expect(await internship.getRpPerInternPerDay()).to.eq(defaultRpPerInternPerDay)

      await internship.connect(deployer).setRpPerInternPerDay(testRpPerInternPerDay)

      expect(await internship.getRpPerInternPerDay()).to.eq(testRpPerInternPerDay)
    })

    it('should correctly set the same value twice', async () => {
      expect(await internship.getRpPerInternPerDay()).to.eq(defaultRpPerInternPerDay)
      await internship.connect(deployer).setRpPerInternPerDay(testRpPerInternPerDay)
      expect(await internship.getRpPerInternPerDay()).to.eq(testRpPerInternPerDay)

      await internship.connect(deployer).setRpPerInternPerDay(testRpPerInternPerDay)

      expect(await internship.getRpPerInternPerDay()).to.eq(testRpPerInternPerDay)
    })
  })

  describe('# setGlobalRpLimitPerDay', () => {
    const testGlobalRpLimitPerDay = defaultGlobalRpLimitPerDay.add(parseEther('1'))
    it('should only be usable by the owner', async () => {
      expect(await internship.owner()).to.not.eq(user.address)

      await expect(
        internship.connect(user).setGlobalRpLimitPerDay(testGlobalRpLimitPerDay)
      ).revertedWith('Ownable: caller is not the owner')
    })

    it('should correctly set `globalRpLimitPerDay` to a new value', async () => {
      expect(await internship.getGlobalRpLimitPerDay()).to.eq(defaultGlobalRpLimitPerDay)

      await internship.connect(deployer).setGlobalRpLimitPerDay(testGlobalRpLimitPerDay)

      expect(await internship.getGlobalRpLimitPerDay()).to.eq(testGlobalRpLimitPerDay)
    })

    it('should correctly set the same value twice', async () => {
      expect(await internship.getGlobalRpLimitPerDay()).to.eq(defaultGlobalRpLimitPerDay)
      await internship.connect(deployer).setGlobalRpLimitPerDay(testGlobalRpLimitPerDay)
      expect(await internship.getGlobalRpLimitPerDay()).to.eq(testGlobalRpLimitPerDay)

      await internship.connect(deployer).setGlobalRpLimitPerDay(testGlobalRpLimitPerDay)

      expect(await internship.getGlobalRpLimitPerDay()).to.eq(testGlobalRpLimitPerDay)
    })
  })

  describe('# setGlobalDayStartTime', () => {
    it('should only be usable by the owner', async () => {
      expect(await internship.owner()).to.not.eq(user.address)

      await expect(
        internship.connect(user).setGlobalDayStartTime(testGlobalDayStartTime)
      ).revertedWith('Ownable: caller is not the owner')
    })

    it('should correctly set `globalDayStartTime` to a new value', async () => {
      expect(await internship.getGlobalDayStartTime()).to.eq(0)

      await internship.connect(deployer).setGlobalDayStartTime(testGlobalDayStartTime)

      expect(await internship.getGlobalDayStartTime()).to.eq(testGlobalDayStartTime)
    })

    it('should correctly set the same value twice', async () => {
      expect(await internship.getGlobalDayStartTime()).to.eq(0)
      await internship.connect(deployer).setGlobalDayStartTime(testGlobalDayStartTime)
      expect(await internship.getGlobalDayStartTime()).to.eq(testGlobalDayStartTime)

      await internship.connect(deployer).setGlobalDayStartTime(testGlobalDayStartTime)

      expect(await internship.getGlobalDayStartTime()).to.eq(testGlobalDayStartTime)
    })
  })

  describe('# setClaimDelay', () => {
    const testClaimDelay = defaultClaimDelay + ONE_HOUR
    it('should only be usable by the owner', async () => {
      expect(await internship.owner()).to.not.eq(user.address)

      await expect(internship.connect(user).setClaimDelay(testClaimDelay)).revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should correctly set `claimDelay` to a new value', async () => {
      expect(await internship.getClaimDelay()).to.eq(defaultClaimDelay)

      await internship.connect(deployer).setClaimDelay(testClaimDelay)

      expect(await internship.getClaimDelay()).to.eq(testClaimDelay)
    })

    it('should correctly set the same value twice', async () => {
      expect(await internship.getClaimDelay()).to.eq(defaultClaimDelay)
      await internship.connect(deployer).setClaimDelay(testClaimDelay)
      expect(await internship.getClaimDelay()).to.eq(testClaimDelay)

      await internship.connect(deployer).setClaimDelay(testClaimDelay)

      expect(await internship.getClaimDelay()).to.eq(testClaimDelay)
    })
  })

  describe('# getGlobalRpClaimedToday', () => {
    beforeEach(async () => {
      await runwayPoints.connect(deployer).transfer(internship.address, defaultGlobalRpLimitPerDay)
    })
    it('should return zero if global day start time has not been updated', async () => {
      expect(await getLastTimestamp()).to.be.gt(
        (await internship.getGlobalDayStartTime()).add(ONE_DAY)
      )

      expect(await internship.getGlobalRpClaimedToday()).to.eq(0)
    })

    describe('should return the total number of RP claimed for the current day', () => {
      it('when no tasks have been completed', async () => {
        await internship.connect(deployer).setGlobalDayStartTime(testGlobalDayStartTime)
        await internship.connect(deployer).setTasksPerDay(1)

        expect(await internship.getGlobalRpClaimedToday()).to.eq(0)
      })

      it('when 1 task has been completed by a user', async () => {
        await internship.connect(deployer).setGlobalDayStartTime(testGlobalDayStartTime)
        await internship.connect(deployer).setTasksPerDay(1)
        await internship.connect(user).doTask()

        expect(await internship.getGlobalRpClaimedToday()).to.eq(defaultRpPerInternPerDay)
      })

      it('when 2 tasks have been completed by different users', async () => {
        await internship.connect(deployer).setGlobalDayStartTime(testGlobalDayStartTime)
        await internship.connect(deployer).setTasksPerDay(1)
        await internship.connect(user).doTask()
        await internship.connect(user2).doTask()

        expect(await internship.getGlobalRpClaimedToday()).to.eq(defaultRpPerInternPerDay.mul(2))
      })
    })
  })

  describe('# getTasksCompletedToday', () => {
    beforeEach(async () => {
      await runwayPoints.connect(deployer).transfer(internship.address, defaultRpPerInternPerDay)
      await internship.connect(deployer).setGlobalDayStartTime(testGlobalDayStartTime)
    })

    it('should return the number of tasks completed so far for the current day', async () => {
      expect(await internship.getDayStartTime(user.address)).to.not.eq(testGlobalDayStartTime)
      expect(await internship.getTasksCompletedToday(user.address)).to.eq(0)

      await internship.connect(user).doTask()

      expect(await internship.getDayStartTime(user.address)).to.eq(testGlobalDayStartTime)
      expect(await internship.getTasksCompletedToday(user.address)).to.eq(1)
    })

    it('should return zero when a new day starts and the global time has not been updated', async () => {
      // Move block time forward by a day.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlock(ethers.provider as any, (await getLastTimestamp()) + ONE_DAY)
      // Verify global time is behind the current block time.
      expect((await internship.getGlobalDayStartTime()).add(ONE_DAY)).to.be.lt(
        await getLastTimestamp()
      )

      expect(await internship.getTasksCompletedToday(user.address)).to.eq(0)
    })

    it("should return zero when the global time is in sync, but the intern hasn't done any tasks for the current day", async () => {
      // Verify global time is in sync with block time.
      expect((await internship.getGlobalDayStartTime()).add(ONE_DAY)).to.be.gt(
        await getLastTimestamp()
      )

      // Get tasks completed for user2 since user2 has not done any tasks.
      expect(await internship.getTasksCompletedToday(user2.address)).to.eq(0)
    })
  })

  describe('# doTask', () => {
    beforeEach(async function () {
      await runwayPoints.connect(deployer).transfer(internship.address, defaultGlobalRpLimitPerDay)
      if (
        this.currentTest?.title !==
        "should not allow users to do tasks if the start time hasn't been set"
      ) {
        await internship.connect(deployer).setGlobalDayStartTime(testGlobalDayStartTime)
      }
      // create two attack contracts, each will call the internship.doTask() method
      attackInternship1 = await mockInternshipAttackFixture(internship.address)
      attackInternship2 = await mockInternshipAttackFixture(internship.address)
    })

    it("should not allow users to do tasks if the start time hasn't been set", async () => {
      expect(await internship.getGlobalDayStartTime()).to.eq(0)

      await expect(internship.connect(user).doTask()).to.be.revertedWith(
        'Internship start time not set'
      )
    })

    it("should not allow users to do tasks if the start time hasn't been reached", async () => {
      await internship
        .connect(deployer)
        .setGlobalDayStartTime((await getLastTimestamp()) + ONE_HOUR)
      expect(await internship.getGlobalDayStartTime()).to.be.gt(await getLastTimestamp())

      await expect(internship.connect(user).doTask()).to.be.revertedWith(
        'Internship has not started'
      )
    })

    it('should not allow users to do tasks if the daily claimed RP limit has been reached', async () => {
      // Set tasks/day to 1 so that the first task will reward RP to the user.
      await internship.connect(deployer).setTasksPerDay(1)
      // Set global RP limit to a single claiming so that the second doTask() call reverts.
      await internship.connect(deployer).setGlobalRpLimitPerDay(defaultRpPerInternPerDay)
      await internship.connect(user).doTask()
      expect(await internship.getGlobalRpClaimedToday()).to.eq(
        await internship.getGlobalRpLimitPerDay()
      )

      await expect(internship.connect(user).doTask()).to.be.revertedWith('Daily RP limit reached')
    })

    it('should, if the current day is updated, check the RP limit against the reset daily RP total', async () => {
      // Set tasks/day to 1 so that the first task will reward RP to the user.
      await internship.connect(deployer).setTasksPerDay(1)
      // Set global RP limit to a single claiming so that the second doTask() call reverts.
      await internship.connect(deployer).setGlobalRpLimitPerDay(defaultRpPerInternPerDay)
      await internship.connect(user).doTask()
      expect(await internship.getGlobalRpClaimedToday()).to.eq(
        await internship.getGlobalRpLimitPerDay()
      )
      await expect(internship.connect(user).doTask()).to.be.revertedWith('Daily RP limit reached')
      // Advance block time by a day to reset daily RP total.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlock(ethers.provider as any, (await getLastTimestamp()) + ONE_DAY)

      await expect(internship.connect(user).doTask()).not.reverted
    })

    it('should update the global day start time if a day or more has passed since the last update', async () => {
      // Set the start time to a day before the current time to force an update.
      const blockTimeBeforeUpdate = await getLastTimestamp()
      await internship.connect(deployer).setGlobalDayStartTime(blockTimeBeforeUpdate - ONE_DAY)
      expect(await internship.getGlobalDayStartTime()).to.eq(blockTimeBeforeUpdate - ONE_DAY)

      await internship.connect(user).doTask()

      const blockTimeAfterUpdate = await getLastTimestamp()
      const updatedDayStartTime = blockTimeAfterUpdate - (blockTimeAfterUpdate % ONE_DAY)
      expect(await internship.getGlobalDayStartTime()).to.eq(updatedDayStartTime)
      expect(await internship.getGlobalDayStartTime()).to.not.eq(blockTimeBeforeUpdate)
    })

    it("should reset the user's task count if a new day has started since they last performed a task", async () => {
      await internship.connect(user).doTask()
      await internship.connect(user).doTask()
      expect(await internship.getTasksCompletedToday(user.address)).to.eq(2)
      // Set block time to a day after to trigger a global day update.
      await setNextTimestamp(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ethers.provider as any,
        (await internship.getGlobalDayStartTime()).add(ONE_DAY).toNumber()
      )

      await internship.connect(user).doTask()

      expect(await internship.getTasksCompletedToday(user.address)).to.eq(1)
    })

    it("should increment a user's previous task count if a new day has not started since they last performed a task", async () => {
      expect(await internship.getTasksCompletedToday(user.address)).to.eq(0)
      await internship.connect(user).doTask()
      expect(await internship.getTasksCompletedToday(user.address)).to.eq(1)

      await internship.connect(user).doTask()

      expect(await internship.getTasksCompletedToday(user.address)).to.eq(2)
    })

    it('should not allow user to do tasks if they have already reached the maximum tasks per day', async () => {
      await internship.connect(deployer).setTasksPerDay(1)
      expect(await internship.getTasksCompletedToday(user.address)).to.eq(0)
      await internship.connect(user).doTask()
      expect(await internship.getTasksCompletedToday(user.address)).to.eq(
        await internship.getTasksPerDay()
      )

      await expect(internship.connect(user).doTask()).to.be.revertedWith(
        'All daily tasks completed'
      )
    })

    it("should not increment a proxy's task count", async () => {
      // Set tasks/day to 1 so that the first task will reward RP to the user.
      await internship.connect(deployer).setTasksPerDay(1)
      expect(await internship.getTasksCompletedToday(attackInternship1.address)).to.eq(0)

      await attackInternship1.connect(user).attack()

      expect(await internship.getTasksCompletedToday(attackInternship1.address)).to.eq(0)
    })

    it("should increment the transaction originator's task count if task was done via proxy", async () => {
      // Set tasks/day to 1 so that the first task will reward RP to the user.
      await internship.connect(deployer).setTasksPerDay(1)
      expect(await internship.getTasksCompletedToday(user.address)).to.eq(0)

      await attackInternship1.connect(user).attack()

      expect(await internship.getTasksCompletedToday(user.address)).to.eq(
        await internship.getTasksPerDay()
      )
    })

    it('should send RP reward to the proxy and not the transaction originator if task was done via proxy', async () => {
      // Set tasks/day to 1 so that the first task will reward RP to the user.
      await internship.connect(deployer).setTasksPerDay(1)
      expect(await internship.getTasksCompletedToday(user.address)).to.eq(0)
      const internshipContractBalanceBefore = await runwayPoints.balanceOf(internship.address)
      const attackContractBalanceBefore = await runwayPoints.balanceOf(user.address)
      const userBalanceBefore = await runwayPoints.balanceOf(user.address)

      await attackInternship1.connect(user).attack()

      expect(await internship.getTasksCompletedToday(user.address)).to.eq(
        await internship.getTasksPerDay()
      )
      expect(await runwayPoints.balanceOf(internship.address)).to.eq(
        internshipContractBalanceBefore.sub(defaultRpPerInternPerDay)
      )
      expect(await runwayPoints.balanceOf(attackInternship1.address)).to.eq(
        attackContractBalanceBefore.add(defaultRpPerInternPerDay)
      )
      expect(await runwayPoints.balanceOf(user.address)).to.eq(userBalanceBefore)
    })

    it('should not allow the transaction originator to claim multiple times via different proxies', async () => {
      // Set tasks/day to 1 so that the first task will reward RP to the user.
      await internship.connect(deployer).setTasksPerDay(1)
      await attackInternship1.connect(user).attack()
      expect(await internship.getTasksCompletedToday(user.address)).to.eq(
        await internship.getTasksPerDay()
      )

      await expect(attackInternship2.connect(user).attack()).to.be.revertedWith(
        'All daily tasks completed'
      )
    })

    it('should reward the user with the correct amount of RP if they have completed all their daily tasks', async () => {
      // Set tasks/day to 1 so that the first task will reward RP to the user.
      await internship.connect(deployer).setTasksPerDay(1)
      const contractBalanceBefore = await runwayPoints.balanceOf(internship.address)
      const userBalanceBefore = await runwayPoints.balanceOf(user.address)

      await internship.connect(user).doTask()

      expect(await runwayPoints.balanceOf(internship.address)).to.eq(
        contractBalanceBefore.sub(defaultRpPerInternPerDay)
      )
      expect(await runwayPoints.balanceOf(user.address)).to.eq(
        userBalanceBefore.add(defaultRpPerInternPerDay)
      )
    })

    it('should prevent the user from claiming rewards if not enough time has passed since their last claiming', async () => {
      // Set tasks/day to 1 so that the first task will reward RP to the user.
      await internship.connect(deployer).setTasksPerDay(1)
      const contractBalanceBefore = await runwayPoints.balanceOf(internship.address)
      const userBalanceBefore = await runwayPoints.balanceOf(user.address)
      /**
       * Set block time to an hour before the next refresh, so that we can try to claim again shortly after the
       * new day starts.
       */
      const firstClaimingTime = (await internship.getGlobalDayStartTime())
        .add(ONE_DAY - ONE_HOUR)
        .toNumber()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, firstClaimingTime)
      await internship.connect(user).doTask()
      expect(await runwayPoints.balanceOf(internship.address)).to.eq(
        contractBalanceBefore.sub(defaultRpPerInternPerDay)
      )
      expect(await runwayPoints.balanceOf(user.address)).to.eq(
        userBalanceBefore.add(defaultRpPerInternPerDay)
      )
      /**
       * Set next block time + 1 hour to trigger a new day, only 1 hour will have passed since the last claiming,
       * not enough to match the 8 hour claiming cooldown.
       */
      const secondClaimingTime = firstClaimingTime + ONE_HOUR
      expect(secondClaimingTime - firstClaimingTime).to.be.lt(await internship.getClaimDelay())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, secondClaimingTime)

      await expect(internship.connect(user).doTask()).to.be.revertedWith(
        'Too soon to claim daily RP'
      )
    })

    it('does not set day start time for proxy contract', async () => {
      expect(await internship.getDayStartTime(attackInternship1.address)).to.not.eq(
        testGlobalDayStartTime
      )

      await attackInternship1.connect(user).attack()

      expect(await internship.getDayStartTime(attackInternship1.address)).to.not.eq(
        testGlobalDayStartTime
      )
    })

    it("sets day start time for task's originator if task completed via proxy", async () => {
      expect(await internship.getDayStartTime(user.address)).to.not.eq(testGlobalDayStartTime)

      await attackInternship1.connect(user).attack()

      expect(await internship.getDayStartTime(user.address)).to.eq(testGlobalDayStartTime)
    })

    it('does not set last claim time for proxy contracts', async () => {
      const proxyLastClaimTimeBefore = await internship.getLastClaimTime(attackInternship1.address)

      await attackInternship1.connect(user).attack()

      const proxyLastClaimTimeAfter = await internship.getLastClaimTime(attackInternship1.address)
      expect(proxyLastClaimTimeBefore).to.eq(proxyLastClaimTimeAfter)
    })

    it("sets last claim time for task's originator if task completed via proxy", async () => {
      // Set tasks/day to 1 so that the first task will reward RP to the user.
      await internship.connect(deployer).setTasksPerDay(1)
      const userLastClaimTimeBefore = await internship.getLastClaimTime(user.address)

      await attackInternship1.connect(user).attack()

      const userLastClaimTimeAfter = await internship.getLastClaimTime(user.address)
      expect(userLastClaimTimeBefore).to.not.eq(userLastClaimTimeAfter)
    })
  })
})
