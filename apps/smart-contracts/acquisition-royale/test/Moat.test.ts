import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { parseEther } from 'ethers/lib/utils'
import { moatFixture } from './fixtures/MoatFixture'
import { mockAcquisitionRoyaleFixture } from './fixtures/AcquisitionRoyaleFixture'
import { getLastTimestamp, mineBlock, setNextTimestamp } from './utils'
import { Moat, MockAcquisitionRoyale } from '../typechain'

describe('=> Moat', function () {
  let deployer: SignerWithAddress
  let user: SignerWithAddress
  let treasury: SignerWithAddress
  // Since these AR components are irrelevant to this test, just use Signers to initialize the AR contract.
  let merkleProofVerifier: SignerWithAddress
  let mockWeth: SignerWithAddress
  let runwayPoints: SignerWithAddress
  let royaleConsumables: SignerWithAddress
  let acqrHook: SignerWithAddress
  let acquisitionRoyale: MockAcquisitionRoyale
  let moat: Moat
  const testEnterpriseId = 1
  const testMoatThreshold = parseEther('50')
  const testMoatImmunityPeriod = 172800 // 2 days in seconds
  beforeEach(async () => {
    ;[
      deployer,
      user,
      treasury,
      merkleProofVerifier,
      mockWeth,
      runwayPoints,
      royaleConsumables,
      acqrHook,
    ] = await ethers.getSigners()
    acquisitionRoyale = await mockAcquisitionRoyaleFixture()
    await acquisitionRoyale.initialize(
      'Acquisition Royale',
      'AQR',
      merkleProofVerifier.address,
      mockWeth.address,
      runwayPoints.address,
      royaleConsumables.address
    )
    await acquisitionRoyale.transferOwnership(treasury.address)
    const currentTime = await getLastTimestamp()
    await acquisitionRoyale.connect(treasury).setGameStartTime(currentTime)
    moat = await moatFixture(acquisitionRoyale.address, testMoatThreshold, testMoatImmunityPeriod)
    await moat.setAcqrHook(acqrHook.address)
  })

  describe('# initialize', () => {
    it('should be initialized with correct values', async () => {
      expect(await moat.getAcquisitionRoyale()).to.eq(acquisitionRoyale.address)
      expect(await moat.getAcqrHook()).to.eq(acqrHook.address)
      expect(await moat.getMoatThreshold()).to.eq(testMoatThreshold)
      expect(await moat.getMoatImmunityPeriod()).to.eq(testMoatImmunityPeriod)
    })
  })

  describe('# updateAndGetMoatStatus', () => {
    it('should only be callable by the configured AcquisitionRoyale hook', async () => {
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)
      expect(await moat.getAcqrHook()).to.not.eq(user.address)

      await expect(
        moat.connect(user).updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold)
      ).to.be.revertedWith('Caller is not the ACQR hook')
    })

    it("should set the enterprise's last recorded moat status to true if its balance is at the threshold", async () => {
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(false)
      // Verify that the update will return true for the enterprise having moat immunity
      expect(
        await moat
          .connect(acqrHook)
          .callStatic.updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold)
      ).to.eq(true)

      await moat.connect(acqrHook).updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold)

      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(true)
    })

    it("should set the enterprise's last recorded moat status to true if its balance is above the threshold", async () => {
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(false)
      // Verify that the update will return true for the enterprise having moat immunity
      expect(
        await moat
          .connect(acqrHook)
          .callStatic.updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold.add(1))
      ).to.eq(true)

      await moat
        .connect(acqrHook)
        .updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold.add(1))

      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(true)
    })

    it("should reset the enterprise's countdown if a countdown was started but its balance is at the threshold", async () => {
      await moat.connect(acqrHook).updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold)
      // Call the update with a balance below the threshold to trigger a countdown
      await moat
        .connect(acqrHook)
        .updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold.sub(1))
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(await getLastTimestamp())
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(true)
      // Verify that the update will return true for the enterprise having moat immunity
      expect(
        await moat
          .connect(acqrHook)
          .callStatic.updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold)
      ).to.eq(true)

      await moat.connect(acqrHook).updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold)

      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(true)
    })

    it("should reset the enterprise's countdown if a countdown was started but its balance is above the threshold", async () => {
      await moat.connect(acqrHook).updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold)
      // Call the update with a balance below the threshold to trigger a countdown
      await moat
        .connect(acqrHook)
        .updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold.sub(1))
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(await getLastTimestamp())
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(true)
      // Verify that the update will return true for the enterprise having moat immunity
      expect(
        await moat
          .connect(acqrHook)
          .callStatic.updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold.add(1))
      ).to.eq(true)

      await moat
        .connect(acqrHook)
        .updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold.add(1))

      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(true)
    })

    it("should reset the enterprise's countdown and moat status if the immunity period has passed and its balance is below the threshold", async () => {
      const shortPeriodForTesting = 10
      await moat.connect(deployer).setMoatImmunityPeriod(shortPeriodForTesting)
      // First call the update with a balance at the threshold to record Moat status
      await moat.connect(acqrHook).updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold)
      // Call the update with a balance below the threshold to trigger a countdown
      await moat
        .connect(acqrHook)
        .updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold.sub(1))
      const countdownStart = await getLastTimestamp()
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(countdownStart)
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(true)
      // Add 1 to have the block occur after the immunity period has expired
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mineBlock(ethers.provider as any, countdownStart + shortPeriodForTesting + 1)
      // Verify that the update will return false for the enterprise having moat immunity
      expect(
        await moat
          .connect(acqrHook)
          .callStatic.updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold.sub(1))
      ).to.eq(false)

      await moat
        .connect(acqrHook)
        .updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold.sub(1))

      expect(await getLastTimestamp()).to.be.gt(countdownStart + shortPeriodForTesting)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(false)
    })

    it("should begin the enterprise's countdown if an enterprise previously had a moat, but its balance is now below the threshold", async () => {
      await moat.connect(acqrHook).updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(true)
      // Verify that the update will return true for the enterprise having moat immunity
      expect(
        await moat
          .connect(acqrHook)
          .callStatic.updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold.sub(1))
      ).to.eq(true)

      await moat
        .connect(acqrHook)
        .updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold.sub(1))

      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(await getLastTimestamp())
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(true)
    })

    it('should not do anything if the enterprise has a moat and its balance has remained above the threshold', async () => {
      await moat.connect(acqrHook).updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(true)
      // Verify that the update will return true for the enterprise having moat immunity
      expect(
        await moat
          .connect(acqrHook)
          .callStatic.updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold)
      ).to.eq(true)

      await moat.connect(acqrHook).updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold)

      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(true)
    })

    it("should not do anything if the enterprise's balance remains below the threshold, but its immunity period hasn't passed", async () => {
      await moat.connect(acqrHook).updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(true)
      await moat
        .connect(acqrHook)
        .updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold.sub(1))
      const countdownStart = await getLastTimestamp()
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(countdownStart)
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(true)
      // Verify that the update will return true for the enterprise having moat immunity
      expect(
        await moat
          .connect(acqrHook)
          .callStatic.updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold.sub(1))
      ).to.eq(true)

      await moat
        .connect(acqrHook)
        .updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold.sub(1))

      expect(await getLastTimestamp()).to.be.lt(countdownStart + testMoatImmunityPeriod)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(countdownStart)
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(true)
    })

    it("should not do anything if the enterprise doesn't have a moat and its balance is still below the threshold", async () => {
      await moat
        .connect(acqrHook)
        .updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold.sub(1))
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(false)
      // Verify that the update will return true for the enterprise having moat immunity
      expect(
        await moat
          .connect(acqrHook)
          .callStatic.updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold.sub(1))
      ).to.eq(false)

      await moat
        .connect(acqrHook)
        .updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold.sub(1))

      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(false)
    })
  })

  describe('# setAcqrHook', () => {
    it('should only be usable by the owner', async () => {
      await expect(moat.connect(user).setAcqrHook(user.address)).revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should be settable to any address', async () => {
      expect(await moat.getAcqrHook()).to.eq(acqrHook.address)

      await moat.connect(deployer).setAcqrHook(user.address)

      expect(await moat.getAcqrHook()).to.eq(user.address)
    })

    it('should be settable to the same value twice', async () => {
      expect(await moat.getAcqrHook()).to.eq(acqrHook.address)

      await moat.connect(deployer).setAcqrHook(user.address)

      expect(await moat.getAcqrHook()).to.eq(user.address)

      await moat.connect(deployer).setAcqrHook(user.address)

      expect(await moat.getAcqrHook()).to.eq(user.address)
    })
  })

  describe('# setMoatThreshold', () => {
    const differentThresholdToTestWith = testMoatThreshold.add(1)
    it('should only be callable by the owner', async () => {
      expect(await moat.owner()).to.not.eq(user.address)

      await expect(moat.connect(user).setMoatThreshold(differentThresholdToTestWith)).revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should be settable to a non-zero value', async () => {
      expect(await moat.getMoatThreshold()).to.eq(testMoatThreshold)

      await moat.connect(deployer).setMoatThreshold(differentThresholdToTestWith)

      expect(await moat.getMoatThreshold()).to.eq(differentThresholdToTestWith)
    })

    it('should be settable to zero', async () => {
      expect(await moat.getMoatThreshold()).to.eq(testMoatThreshold)

      await moat.connect(deployer).setMoatThreshold(0)

      expect(await moat.getMoatThreshold()).to.eq(0)
    })

    it('should correctly set the same value twice', async () => {
      expect(await moat.getMoatThreshold()).to.eq(testMoatThreshold)
      await moat.connect(deployer).setMoatThreshold(differentThresholdToTestWith)
      expect(await moat.getMoatThreshold()).to.eq(differentThresholdToTestWith)

      await moat.connect(deployer).setMoatThreshold(differentThresholdToTestWith)

      expect(await moat.getMoatThreshold()).to.eq(differentThresholdToTestWith)
    })
  })

  describe('# setMoatImmunityPeriod', () => {
    const differentPeriodToTestWith = testMoatImmunityPeriod + 1
    it('should only be callable by the owner', async () => {
      expect(await moat.owner()).to.not.eq(user.address)

      await expect(
        moat.connect(user).setMoatImmunityPeriod(differentPeriodToTestWith)
      ).revertedWith('Ownable: caller is not the owner')
    })

    it('should be settable to a non-zero value', async () => {
      expect(await moat.getMoatImmunityPeriod()).to.eq(testMoatImmunityPeriod)

      await moat.connect(deployer).setMoatImmunityPeriod(differentPeriodToTestWith)

      expect(await moat.getMoatImmunityPeriod()).to.eq(differentPeriodToTestWith)
    })

    it('should be settable to zero', async () => {
      expect(await moat.getMoatImmunityPeriod()).to.eq(testMoatImmunityPeriod)

      await moat.connect(deployer).setMoatImmunityPeriod(0)

      expect(await moat.getMoatImmunityPeriod()).to.eq(0)
    })

    it('should correctly set the same value twice', async () => {
      expect(await moat.getMoatImmunityPeriod()).to.eq(testMoatImmunityPeriod)
      await moat.connect(deployer).setMoatImmunityPeriod(differentPeriodToTestWith)
      expect(await moat.getMoatImmunityPeriod()).to.eq(differentPeriodToTestWith)

      await moat.connect(deployer).setMoatImmunityPeriod(differentPeriodToTestWith)

      expect(await moat.getMoatImmunityPeriod()).to.eq(differentPeriodToTestWith)
    })
  })

  describe('# enterpriseHasMoat', () => {
    const defaultTimeDelay = 10
    it("should return true if the enterprise's balance is at the threshold", async () => {
      const expectedTime = (await getLastTimestamp()) + defaultTimeDelay
      // Prevent virtual balance update
      await acquisitionRoyale
        .connect(treasury)
        .setEnterpriseLastRpUpdateTime(testEnterpriseId, expectedTime)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, expectedTime)
      await acquisitionRoyale.connect(treasury).setEnterpriseRp(testEnterpriseId, testMoatThreshold)
      expect(await acquisitionRoyale.getEnterpriseVirtualBalance(testEnterpriseId)).to.eq(
        testMoatThreshold
      )

      expect(await moat.enterpriseHasMoat(testEnterpriseId)).to.eq(true)
    })

    it("should return true if the enterprise's balance is above the threshold", async () => {
      const expectedTime = (await getLastTimestamp()) + defaultTimeDelay
      // Prevent virtual balance update
      await acquisitionRoyale
        .connect(treasury)
        .setEnterpriseLastRpUpdateTime(testEnterpriseId, expectedTime)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, expectedTime)
      await acquisitionRoyale
        .connect(treasury)
        .setEnterpriseRp(testEnterpriseId, testMoatThreshold.add(1))
      expect(await acquisitionRoyale.getEnterpriseVirtualBalance(testEnterpriseId)).to.be.gt(
        testMoatThreshold
      )

      expect(await moat.enterpriseHasMoat(testEnterpriseId)).to.eq(true)
    })

    it("should return true if the enterprise's balance fell below the threshold, but its immunity period hasn't passed", async () => {
      // First call the update with a balance at the threshold to record Moat status
      await moat.connect(acqrHook).updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold)
      // Call the update with a balance below the threshold to trigger a countdown
      await moat
        .connect(acqrHook)
        .updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold.sub(1))
      const countdownStart = await getLastTimestamp()
      /**
       * Update the AR rp balance since enterpriseHasMoat reads from the in-game balance.
       * It is not possible for the in-game enterprise balance to fall below the threshold
       * without its moat status being updated, unless the threshold is changed mid-game.
       * In which case, enterpriseHasMoat will return false because the enterprise will have
       * fallen below the threshold, but the countdown hasn't been set.
       *
       * Using divide by 2 instead of subtracting by 1 since passive RP accumulation makes
       * verifying exact amounts after multiple update calls very complicated.
       */
      await acquisitionRoyale
        .connect(treasury)
        .setEnterpriseRp(testEnterpriseId, testMoatThreshold.div(2))
      expect(await acquisitionRoyale.getEnterpriseVirtualBalance(testEnterpriseId)).to.be.lt(
        testMoatThreshold
      )
      expect(await getLastTimestamp()).to.be.lt(countdownStart + testMoatImmunityPeriod)

      expect(await moat.enterpriseHasMoat(testEnterpriseId)).to.eq(true)
    })

    it("should return false if the enterprise's balance remains below the threshold and its immunity period has passed", async () => {
      const shortPeriodForTesting = 10
      await moat.connect(deployer).setMoatImmunityPeriod(shortPeriodForTesting)
      // First call the update with a balance at the threshold to record Moat status
      await moat.connect(acqrHook).updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold)
      // Call the update with a balance below the threshold to trigger a countdown
      await moat
        .connect(acqrHook)
        .updateAndGetMoatStatus(testEnterpriseId, testMoatThreshold.sub(1))
      const countdownStart = await getLastTimestamp()
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(countdownStart)
      /**
       * Update the AR rp balance to below the threshold to have the contract instead use the
       * countdown to infer moat status.
       */
      await acquisitionRoyale
        .connect(treasury)
        .setEnterpriseRp(testEnterpriseId, testMoatThreshold.div(2))
      expect(await acquisitionRoyale.getEnterpriseVirtualBalance(testEnterpriseId)).to.be.lt(
        testMoatThreshold
      )
      expect(await moat.enterpriseHasMoat(testEnterpriseId)).to.eq(true)
      // Mine a block to move the time past the immunity period
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mineBlock(ethers.provider as any, countdownStart + shortPeriodForTesting + 1)
      expect(await acquisitionRoyale.getEnterpriseVirtualBalance(testEnterpriseId)).to.be.lt(
        testMoatThreshold
      )
      expect(await getLastTimestamp()).to.be.gt(countdownStart + shortPeriodForTesting)

      expect(await moat.enterpriseHasMoat(testEnterpriseId)).to.eq(false)
    })

    it("should return false if the enterprise's balance is below the threshold and doesn't have a countdown initiated", async () => {
      await acquisitionRoyale
        .connect(treasury)
        .setEnterpriseRp(testEnterpriseId, testMoatThreshold.div(2))
      expect(await acquisitionRoyale.getEnterpriseVirtualBalance(testEnterpriseId)).to.be.lt(
        testMoatThreshold
      )
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)

      expect(await moat.enterpriseHasMoat(testEnterpriseId)).to.eq(false)
    })
  })
})
