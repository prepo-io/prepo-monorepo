import { ethers } from 'hardhat'
import chai, { expect } from 'chai'
import { solidity } from 'ethereum-waffle'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { parseEther } from 'ethers/lib/utils'
import { acqrHookV1Fixture } from './fixtures/AcqrHookFixture'
import { mockAcquisitionRoyaleFixture } from './fixtures/AcquisitionRoyaleFixture'
import { getLastTimestamp, PERCENT_DENOMINATOR } from './utils'
import { moatFixture } from './fixtures/MoatFixture'
import { Moat } from '../typechain/Moat'
import { AcqrHookV1, MockAcquisitionRoyale } from '../typechain'

chai.use(solidity)

describe('=> AcqrHookV1', () => {
  let deployer: SignerWithAddress
  let user: SignerWithAddress
  let treasury: SignerWithAddress
  // Since these AR components are irrelevant to this test, just use Signers to initialize the AR contract.
  let merkleProofVerifier: SignerWithAddress
  let mockWeth: SignerWithAddress
  let runwayPoints: SignerWithAddress
  let royaleConsumables: SignerWithAddress
  let acquisitionRoyale: MockAcquisitionRoyale
  let acqrHook: AcqrHookV1
  let moat: Moat
  const testMergerBurn = 500000000 // 5%
  const testMoatThreshold = parseEther('50')
  const testMoatImmunityPeriod = 172800 // 2 days in seconds
  beforeEach(async () => {
    ;[deployer, user, treasury, merkleProofVerifier, mockWeth, runwayPoints, royaleConsumables] =
      await ethers.getSigners()
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
    moat = await moatFixture(acquisitionRoyale.address, testMoatThreshold, testMoatImmunityPeriod)
    acqrHook = await acqrHookV1Fixture(acquisitionRoyale.address, moat.address)
    await moat.setAcqrHook(acqrHook.address)
    await acquisitionRoyale.connect(treasury).setHook(acqrHook.address)
    await acquisitionRoyale.connect(treasury).setGameStartTime(await getLastTimestamp())
  })

  describe('mergeHook', () => {
    const callerId = 0
    const targetId = 1
    const balanceOfCaller = parseEther('10')
    const balanceOfTarget = parseEther('5')
    beforeEach(async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, callerId)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, targetId)
      await acquisitionRoyale.connect(treasury).setEnterpriseRp(callerId, balanceOfCaller)
      await acquisitionRoyale.connect(treasury).setEnterpriseRp(targetId, balanceOfTarget)
      await acquisitionRoyale.connect(treasury).setMergerBurnPercentage(testMergerBurn)
    })

    it('should only be callable by the AcquisitionRoyale contract', async () => {
      await expect(
        acqrHook.connect(user).callStatic.mergeHook(callerId, targetId, targetId)
      ).to.be.revertedWith('Caller is not Acquisition Royale')
    })

    it("should calculate the caller's and target's new balances correctly (when the caller enterprise is kept)", async () => {
      const newBalances = await acquisitionRoyale.callStatic.callMergeHook(
        callerId,
        targetId,
        targetId
      )

      const balanceToBurn = balanceOfTarget
        .mul(await acquisitionRoyale.getMergerBurnPercentage())
        .div(PERCENT_DENOMINATOR)
        .add(1)
      expect(newBalances._newCallerRpBalance).to.eq(
        balanceOfCaller.add(balanceOfTarget.sub(balanceToBurn))
      )
      expect(newBalances._newTargetRpBalance).to.eq(0)
    })

    it("should calculate the caller's and target's new balances correctly (when the target enterprise is kept)", async () => {
      const newBalances = await acquisitionRoyale.callStatic.callMergeHook(
        callerId,
        targetId,
        callerId
      )

      const balanceToBurn = balanceOfCaller
        .mul(await acquisitionRoyale.getMergerBurnPercentage())
        .div(PERCENT_DENOMINATOR)
        .add(1)
      expect(newBalances._newCallerRpBalance).to.eq(0)
      expect(newBalances._newTargetRpBalance).to.eq(
        balanceOfTarget.add(balanceOfCaller.sub(balanceToBurn))
      )
    })

    it('should zero out the balance of the enterprise to be burnt instead of underflowing when subtracting the merger burn amount', async () => {
      // Set the burn percentage to 100% to make the fee exceed the burnt enterprise's balance (since 1 is added to the fee for rounding).
      await acquisitionRoyale.connect(treasury).setMergerBurnPercentage(PERCENT_DENOMINATOR)

      const newBalances = await acquisitionRoyale.callStatic.callMergeHook(
        callerId,
        targetId,
        targetId
      )

      expect(newBalances._newCallerRpBalance).to.eq(balanceOfCaller)
      expect(newBalances._newTargetRpBalance).to.eq(0)
    })

    describe('if the calling enterprise is kept', () => {
      it("should award a moat to caller if post-merger balance becomes >= threshold and begin target's moat countdown if it had a moat", async () => {
        await acquisitionRoyale.callDepositHook(
          callerId,
          testMoatThreshold.div(2).sub(balanceOfCaller)
        )
        await acquisitionRoyale
          .connect(treasury)
          .setEnterpriseRp(callerId, testMoatThreshold.div(2))
        await acquisitionRoyale.callDepositHook(targetId, testMoatThreshold.sub(balanceOfTarget))
        await acquisitionRoyale.connect(treasury).setEnterpriseRp(targetId, testMoatThreshold)
        /**
         * Because this hook does not actually perform balance updates, we cannot
         * use `enterpriseHasMoat` to retrieve an accurate moat status after a hook
         * call. The hook call only writes state to the `Moat` contract, thus we
         * grab the last moat status recorded.
         */
        expect(await moat.getLastHadMoat(callerId)).to.eq(false)
        expect(await moat.getLastHadMoat(targetId)).to.eq(true)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)

        await acquisitionRoyale.callMergeHook(callerId, targetId, targetId)

        expect(await moat.getLastHadMoat(callerId)).to.eq(true)
        expect(await moat.getLastHadMoat(targetId)).to.eq(true)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(await getLastTimestamp())
      })

      it("should award a moat to caller if post-merger balance becomes >= threshold and not affect target if it didn't have a moat", async () => {
        await acquisitionRoyale.callDepositHook(
          callerId,
          testMoatThreshold.div(2).sub(balanceOfCaller)
        )
        await acquisitionRoyale
          .connect(treasury)
          .setEnterpriseRp(callerId, testMoatThreshold.div(2))
        await acquisitionRoyale.callDepositHook(
          targetId,
          testMoatThreshold.sub(balanceOfTarget).sub(1)
        )
        await acquisitionRoyale
          .connect(treasury)
          .setEnterpriseRp(targetId, testMoatThreshold.sub(1))
        expect(await moat.getLastHadMoat(callerId)).to.eq(false)
        expect(await moat.getLastHadMoat(targetId)).to.eq(false)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)

        await acquisitionRoyale.callMergeHook(callerId, targetId, targetId)

        expect(await moat.getLastHadMoat(callerId)).to.eq(true)
        expect(await moat.getLastHadMoat(targetId)).to.eq(false)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)
      })

      it("should not award a moat to caller if the post-merger balance stays < threshold and begin target's moat countdown if it had a moat", async () => {
        /**
         * Set the balance for the calling enterprise to zero, this is because the
         * the merger burn will result in an amount just below the moat threshold
         * to be transferred to the calling enterprise.
         */
        await acquisitionRoyale.connect(treasury).setEnterpriseRp(callerId, 0)
        await acquisitionRoyale.callDepositHook(targetId, testMoatThreshold)
        await acquisitionRoyale.connect(treasury).setEnterpriseRp(targetId, testMoatThreshold)
        expect(await moat.getLastHadMoat(callerId)).to.eq(false)
        expect(await moat.getLastHadMoat(targetId)).to.eq(true)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)

        await acquisitionRoyale.callMergeHook(callerId, targetId, targetId)

        expect(await moat.getLastHadMoat(callerId)).to.eq(false)
        expect(await moat.getLastHadMoat(targetId)).to.eq(true)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(await getLastTimestamp())
      })

      it("should not award a moat to caller if the post-merger balance stays < threshold and not affect target if it didn't have a moat", async () => {
        await acquisitionRoyale.connect(treasury).setEnterpriseRp(callerId, 0)
        await acquisitionRoyale.callDepositHook(
          targetId,
          testMoatThreshold.sub(balanceOfTarget).sub(1)
        )
        await acquisitionRoyale
          .connect(treasury)
          .setEnterpriseRp(targetId, testMoatThreshold.sub(1))
        expect(await moat.getLastHadMoat(callerId)).to.eq(false)
        expect(await moat.getLastHadMoat(targetId)).to.eq(false)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)

        await acquisitionRoyale.callMergeHook(callerId, targetId, targetId)

        expect(await moat.getLastHadMoat(callerId)).to.eq(false)
        expect(await moat.getLastHadMoat(targetId)).to.eq(false)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)
      })

      it("should not affect caller's moat if post-merger balance stays >= threshold and begin target's moat countdown if it had a moat", async () => {
        await acquisitionRoyale.callDepositHook(callerId, testMoatThreshold.sub(balanceOfCaller))
        await acquisitionRoyale.connect(treasury).setEnterpriseRp(callerId, testMoatThreshold)
        await acquisitionRoyale.callDepositHook(targetId, testMoatThreshold.sub(balanceOfTarget))
        await acquisitionRoyale.connect(treasury).setEnterpriseRp(targetId, testMoatThreshold)
        expect(await moat.getLastHadMoat(callerId)).to.eq(true)
        expect(await moat.getLastHadMoat(targetId)).to.eq(true)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)

        await acquisitionRoyale.callMergeHook(callerId, targetId, targetId)

        expect(await moat.getLastHadMoat(callerId)).to.eq(true)
        expect(await moat.getLastHadMoat(targetId)).to.eq(true)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(await getLastTimestamp())
      })

      it("should not affect caller's moat if post-merger balance stays >= threshold and not affect target if it didn't have a moat", async () => {
        await acquisitionRoyale.callDepositHook(callerId, testMoatThreshold.sub(balanceOfCaller))
        await acquisitionRoyale.connect(treasury).setEnterpriseRp(callerId, testMoatThreshold)
        await acquisitionRoyale.callDepositHook(
          targetId,
          testMoatThreshold.sub(balanceOfTarget).sub(1)
        )
        await acquisitionRoyale
          .connect(treasury)
          .setEnterpriseRp(targetId, testMoatThreshold.sub(1))
        expect(await moat.getLastHadMoat(callerId)).to.eq(true)
        expect(await moat.getLastHadMoat(targetId)).to.eq(false)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)

        await acquisitionRoyale.callMergeHook(callerId, targetId, targetId)

        expect(await moat.getLastHadMoat(callerId)).to.eq(true)
        expect(await moat.getLastHadMoat(targetId)).to.eq(false)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)
      })
    })

    describe('if the target enterprise is kept', () => {
      it("should award a moat to target if post-merger balance becomes >= threshold and begin caller's moat countdown if it had a moat", async () => {
        await acquisitionRoyale.callDepositHook(callerId, testMoatThreshold.sub(balanceOfCaller))
        await acquisitionRoyale.connect(treasury).setEnterpriseRp(callerId, testMoatThreshold)
        await acquisitionRoyale.callDepositHook(
          targetId,
          testMoatThreshold.div(2).sub(balanceOfTarget)
        )
        await acquisitionRoyale
          .connect(treasury)
          .setEnterpriseRp(targetId, testMoatThreshold.div(2))
        expect(await moat.getLastHadMoat(callerId)).to.eq(true)
        expect(await moat.getLastHadMoat(targetId)).to.eq(false)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)

        await acquisitionRoyale.callMergeHook(callerId, targetId, callerId)

        expect(await moat.getLastHadMoat(callerId)).to.eq(true)
        expect(await moat.getLastHadMoat(targetId)).to.eq(true)
        expect(await moat.getMoatCountdown(callerId)).to.eq(await getLastTimestamp())
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)
      })

      it("should award a moat to target if post-merger balance becomes >= threshold and not affect caller if it didn't have a moat", async () => {
        await acquisitionRoyale.callDepositHook(
          callerId,
          testMoatThreshold.sub(balanceOfCaller).sub(1)
        )
        await acquisitionRoyale
          .connect(treasury)
          .setEnterpriseRp(callerId, testMoatThreshold.sub(1))
        await acquisitionRoyale.callDepositHook(
          targetId,
          testMoatThreshold.div(2).sub(balanceOfTarget)
        )
        await acquisitionRoyale
          .connect(treasury)
          .setEnterpriseRp(targetId, testMoatThreshold.div(2))
        expect(await moat.getLastHadMoat(callerId)).to.eq(false)
        expect(await moat.getLastHadMoat(targetId)).to.eq(false)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)

        await acquisitionRoyale.callMergeHook(callerId, targetId, callerId)

        expect(await moat.getLastHadMoat(callerId)).to.eq(false)
        expect(await moat.getLastHadMoat(targetId)).to.eq(true)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)
      })

      it("should not award a moat to target if the post-merger balance falls < threshold and begin caller's moat countdown if it had a moat", async () => {
        /**
         * Set the balance for the target enterprise to zero, this is because the
         * the merger burn will result in an amount just below the moat threshold
         * to be transferred to the target enterprise.
         */
        await acquisitionRoyale.connect(treasury).setEnterpriseRp(targetId, 0)
        await acquisitionRoyale.callDepositHook(callerId, testMoatThreshold)
        await acquisitionRoyale.connect(treasury).setEnterpriseRp(callerId, testMoatThreshold)
        expect(await moat.getLastHadMoat(callerId)).to.eq(true)
        expect(await moat.getLastHadMoat(targetId)).to.eq(false)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)

        await acquisitionRoyale.callMergeHook(callerId, targetId, callerId)

        expect(await moat.getLastHadMoat(callerId)).to.eq(true)
        expect(await moat.getLastHadMoat(targetId)).to.eq(false)
        expect(await moat.getMoatCountdown(callerId)).to.eq(await getLastTimestamp())
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)
      })

      it("should not award a moat to target if the post-merger balance falls < threshold and not affect caller if it didn't have a moat", async () => {
        await acquisitionRoyale.connect(treasury).setEnterpriseRp(targetId, 0)
        await acquisitionRoyale.callDepositHook(
          callerId,
          testMoatThreshold.sub(balanceOfCaller).sub(1)
        )
        await acquisitionRoyale
          .connect(treasury)
          .setEnterpriseRp(callerId, testMoatThreshold.sub(1))
        expect(await moat.getLastHadMoat(callerId)).to.eq(false)
        expect(await moat.getLastHadMoat(targetId)).to.eq(false)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)

        await acquisitionRoyale.callMergeHook(callerId, targetId, callerId)

        expect(await moat.getLastHadMoat(callerId)).to.eq(false)
        expect(await moat.getLastHadMoat(targetId)).to.eq(false)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)
      })

      it("should not affect target's moat if post-merger balance stays >= threshold and begin caller's moat countdown if it had a moat", async () => {
        await acquisitionRoyale.callDepositHook(callerId, testMoatThreshold.sub(balanceOfCaller))
        await acquisitionRoyale.connect(treasury).setEnterpriseRp(callerId, testMoatThreshold)
        await acquisitionRoyale.callDepositHook(targetId, testMoatThreshold.sub(balanceOfTarget))
        await acquisitionRoyale.connect(treasury).setEnterpriseRp(targetId, testMoatThreshold)
        expect(await moat.getLastHadMoat(callerId)).to.eq(true)
        expect(await moat.getLastHadMoat(targetId)).to.eq(true)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)

        await acquisitionRoyale.callMergeHook(callerId, targetId, callerId)

        expect(await moat.getLastHadMoat(callerId)).to.eq(true)
        expect(await moat.getLastHadMoat(targetId)).to.eq(true)
        expect(await moat.getMoatCountdown(callerId)).to.eq(await getLastTimestamp())
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)
      })

      it("should not affect target's moat if post-merger balance stays >= threshold and not affect caller if it didn't have a moat", async () => {
        await acquisitionRoyale.callDepositHook(
          callerId,
          testMoatThreshold.sub(balanceOfCaller).sub(1)
        )
        await acquisitionRoyale
          .connect(treasury)
          .setEnterpriseRp(callerId, testMoatThreshold.sub(1))
        await acquisitionRoyale.callDepositHook(targetId, testMoatThreshold.sub(balanceOfTarget))
        await acquisitionRoyale.connect(treasury).setEnterpriseRp(targetId, testMoatThreshold)
        expect(await moat.getLastHadMoat(callerId)).to.eq(false)
        expect(await moat.getLastHadMoat(targetId)).to.eq(true)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)

        await acquisitionRoyale.callMergeHook(callerId, targetId, callerId)

        expect(await moat.getLastHadMoat(callerId)).to.eq(false)
        expect(await moat.getLastHadMoat(targetId)).to.eq(true)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)
      })
    })
  })

  describe('competeHook', () => {
    const callerId = 0
    const targetId = 1
    const balanceOfCaller = parseEther('10')
    const balanceOfTarget = parseEther('5')
    beforeEach(async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, callerId)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, targetId)
      await acquisitionRoyale.connect(treasury).setEnterpriseRp(callerId, balanceOfCaller)
      await acquisitionRoyale.connect(treasury).setEnterpriseRp(targetId, balanceOfTarget)
    })

    it('should only be callable by the AcquisitionRoyale contract', async () => {
      const damageToDeal = balanceOfTarget.div(2)
      // Pass rpToSpend at 1:2 ratio for simplicity
      const rpToSpend = damageToDeal.div(2)

      await expect(
        acqrHook.connect(user).callStatic.competeHook(callerId, targetId, damageToDeal, rpToSpend)
      ).to.be.revertedWith('Caller is not Acquisition Royale')
    })

    it("should subtract spent RP from the caller's balance and damage dealt from the target's balance", async () => {
      const damageToDeal = balanceOfTarget.div(2)
      // Pass rpToSpend at 1:2 ratio for simplicity
      const rpToSpend = damageToDeal.div(2)

      const newBalances = await acquisitionRoyale.callStatic.callCompeteHook(
        callerId,
        targetId,
        damageToDeal,
        rpToSpend
      )

      expect(newBalances._newCallerRpBalance).to.eq(balanceOfCaller.sub(rpToSpend))
      expect(newBalances._newTargetRpBalance).to.eq(balanceOfTarget.sub(damageToDeal))
    })

    it("should revert if the RP to spend exceeds the caller's balance", async () => {
      const damageToDeal = balanceOfTarget.div(2)
      const rpToSpend = balanceOfCaller.mul(2)

      await expect(
        acquisitionRoyale.callStatic.callCompeteHook(callerId, targetId, damageToDeal, rpToSpend)
      ).to.be.revertedWith(
        'reverted with panic code 0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)'
      )
    })

    it("should subtract a proportional amount from the caller's balance if the damage exceeds the target's balance", async () => {
      const damageToDeal = balanceOfTarget.mul(2)
      // Pass rpToSpend at 1:2 ratio for simplicity
      const rpToSpend = damageToDeal.div(2)
      const percentForMaxDamage = balanceOfTarget.mul(PERCENT_DENOMINATOR).div(damageToDeal).add(1)
      const expectedRpToSpend = percentForMaxDamage.mul(rpToSpend).div(PERCENT_DENOMINATOR)

      const newBalances = await acquisitionRoyale.callStatic.callCompeteHook(
        callerId,
        targetId,
        damageToDeal,
        rpToSpend
      )

      expect(newBalances._newCallerRpBalance).to.eq(balanceOfCaller.sub(expectedRpToSpend))
      expect(newBalances._newTargetRpBalance).to.eq(0)
    })

    it("should begin caller's moat countdown if its balance falls < threshold and not affect target if its balance stays < threshold", async () => {
      const damageToDeal = 2
      const rpToSpend = 1
      await acquisitionRoyale.callDepositHook(callerId, testMoatThreshold.sub(balanceOfCaller))
      await acquisitionRoyale.connect(treasury).setEnterpriseRp(callerId, testMoatThreshold)
      await acquisitionRoyale.callDepositHook(
        targetId,
        testMoatThreshold.sub(balanceOfTarget).sub(1)
      )
      await acquisitionRoyale.connect(treasury).setEnterpriseRp(targetId, testMoatThreshold.sub(1))
      expect(await moat.getLastHadMoat(callerId)).to.eq(true)
      expect(await moat.getMoatCountdown(callerId)).to.eq(0)
      expect(await moat.getLastHadMoat(targetId)).to.eq(false)
      expect(await moat.getMoatCountdown(targetId)).to.eq(0)

      await acquisitionRoyale.callCompeteHook(callerId, targetId, damageToDeal, rpToSpend)

      expect(await moat.getLastHadMoat(callerId)).to.eq(true)
      expect(await moat.getMoatCountdown(callerId)).to.eq(await getLastTimestamp())
      expect(await moat.getLastHadMoat(targetId)).to.eq(false)
      expect(await moat.getMoatCountdown(targetId)).to.eq(0)
    })

    it("should not affect caller's moat if its balance stays > threshold and begin target's moat countdown if its balance falls < threshold", async () => {
      const damageToDeal = 2
      const rpToSpend = 1
      await acquisitionRoyale.callDepositHook(
        callerId,
        testMoatThreshold.sub(balanceOfCaller).add(rpToSpend)
      )
      await acquisitionRoyale
        .connect(treasury)
        .setEnterpriseRp(callerId, testMoatThreshold.add(rpToSpend))
      await acquisitionRoyale.callDepositHook(
        targetId,
        testMoatThreshold.sub(balanceOfTarget).add(damageToDeal).sub(1)
      )
      await acquisitionRoyale
        .connect(treasury)
        .setEnterpriseRp(targetId, testMoatThreshold.add(damageToDeal).sub(1))
      expect(await moat.getLastHadMoat(callerId)).to.eq(true)
      expect(await moat.getMoatCountdown(callerId)).to.eq(0)
      expect(await moat.getLastHadMoat(targetId)).to.eq(true)
      expect(await moat.getMoatCountdown(targetId)).to.eq(0)

      await acquisitionRoyale.callCompeteHook(callerId, targetId, damageToDeal, rpToSpend)

      expect(await moat.getLastHadMoat(callerId)).to.eq(true)
      expect(await moat.getMoatCountdown(callerId)).to.eq(0)
      expect(await moat.getLastHadMoat(targetId)).to.eq(true)
      expect(await moat.getMoatCountdown(targetId)).to.eq(await getLastTimestamp())
    })

    it('should begin moat countdowns for caller and target if both balances fall < threshold', async () => {
      const damageToDeal = 2
      const rpToSpend = 1
      await acquisitionRoyale.callDepositHook(callerId, testMoatThreshold.sub(balanceOfCaller))
      await acquisitionRoyale.connect(treasury).setEnterpriseRp(callerId, testMoatThreshold)
      await acquisitionRoyale.callDepositHook(targetId, testMoatThreshold.sub(balanceOfTarget))
      await acquisitionRoyale.connect(treasury).setEnterpriseRp(targetId, testMoatThreshold)
      expect(await moat.getLastHadMoat(callerId)).to.eq(true)
      expect(await moat.getMoatCountdown(callerId)).to.eq(0)
      expect(await moat.getLastHadMoat(targetId)).to.eq(true)
      expect(await moat.getMoatCountdown(targetId)).to.eq(0)

      await acquisitionRoyale.callCompeteHook(callerId, targetId, damageToDeal, rpToSpend)

      expect(await moat.getLastHadMoat(callerId)).to.eq(true)
      expect(await moat.getMoatCountdown(callerId)).to.eq(await getLastTimestamp())
      expect(await moat.getLastHadMoat(targetId)).to.eq(true)
      expect(await moat.getMoatCountdown(targetId)).to.eq(await getLastTimestamp())
    })

    it('should not affect caller or target moats if both balances stay >= threshold', async () => {
      const damageToDeal = 2
      const rpToSpend = 1
      await acquisitionRoyale.callDepositHook(
        callerId,
        testMoatThreshold.sub(balanceOfCaller).add(rpToSpend)
      )
      await acquisitionRoyale
        .connect(treasury)
        .setEnterpriseRp(callerId, testMoatThreshold.add(rpToSpend))
      await acquisitionRoyale.callDepositHook(
        targetId,
        testMoatThreshold.sub(balanceOfTarget).add(damageToDeal)
      )
      await acquisitionRoyale
        .connect(treasury)
        .setEnterpriseRp(targetId, testMoatThreshold.add(damageToDeal))
      expect(await moat.getLastHadMoat(callerId)).to.eq(true)
      expect(await moat.getMoatCountdown(callerId)).to.eq(0)
      expect(await moat.getLastHadMoat(targetId)).to.eq(true)
      expect(await moat.getMoatCountdown(targetId)).to.eq(0)

      await acquisitionRoyale.callCompeteHook(callerId, targetId, damageToDeal, rpToSpend)

      expect(await moat.getLastHadMoat(callerId)).to.eq(true)
      expect(await moat.getMoatCountdown(callerId)).to.eq(0)
      expect(await moat.getLastHadMoat(targetId)).to.eq(true)
      expect(await moat.getMoatCountdown(targetId)).to.eq(0)
    })

    it('should not affect caller or target if both balances stay < threshold', async () => {
      const damageToDeal = 2
      const rpToSpend = 1
      await acquisitionRoyale.callDepositHook(
        callerId,
        testMoatThreshold.sub(balanceOfCaller).sub(1)
      )
      await acquisitionRoyale.connect(treasury).setEnterpriseRp(callerId, testMoatThreshold.sub(1))
      await acquisitionRoyale.callDepositHook(
        targetId,
        testMoatThreshold.sub(balanceOfTarget).sub(1)
      )
      await acquisitionRoyale.connect(treasury).setEnterpriseRp(targetId, testMoatThreshold.sub(1))
      expect(await moat.getLastHadMoat(callerId)).to.eq(false)
      expect(await moat.getMoatCountdown(callerId)).to.eq(0)
      expect(await moat.getLastHadMoat(targetId)).to.eq(false)
      expect(await moat.getMoatCountdown(targetId)).to.eq(0)

      await acquisitionRoyale.callCompeteHook(callerId, targetId, damageToDeal, rpToSpend)

      expect(await moat.getLastHadMoat(callerId)).to.eq(false)
      expect(await moat.getMoatCountdown(callerId)).to.eq(0)
      expect(await moat.getLastHadMoat(targetId)).to.eq(false)
      expect(await moat.getMoatCountdown(targetId)).to.eq(0)
    })
  })

  describe('acquireHook', () => {
    const callerId = 0
    const targetId = 1
    const balanceOfCaller = parseEther('10')
    const balanceOfTarget = parseEther('5')
    beforeEach(async () => {
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, callerId)
      await acquisitionRoyale.connect(treasury).mintEnterprise(user.address, targetId)
      await acquisitionRoyale.connect(treasury).setEnterpriseRp(callerId, balanceOfCaller)
      await acquisitionRoyale.connect(treasury).setEnterpriseRp(targetId, balanceOfTarget)
      await acquisitionRoyale.connect(treasury).setMergerBurnPercentage(testMergerBurn)
    })

    it('should only be callable by the AcquisitionRoyale contract', async () => {
      await expect(
        acqrHook.connect(user).callStatic.acquireHook(callerId, targetId, callerId, 0)
      ).to.be.revertedWith('Caller is not Acquisition Royale')
    })

    it("should transfer over the caller's enterprise balance minus a fee if the target enterprise is kept", async () => {
      // Use a `nativeSent` value of zero since it is irrelevant for these tests.
      const newBalances = await acquisitionRoyale.callStatic.callAcquireHook(
        callerId,
        targetId,
        callerId,
        0
      )

      const balanceToBurn = balanceOfCaller
        .mul(await acquisitionRoyale.getMergerBurnPercentage())
        .div(PERCENT_DENOMINATOR)
        .add(1)
      expect(newBalances._newCallerRpBalance).to.eq(0)
      expect(newBalances._newTargetRpBalance).to.eq(
        balanceOfTarget.add(balanceOfCaller.sub(balanceToBurn))
      )
    })

    it("should leave the balances unchanged if the caller's enterprise is kept", async () => {
      // Use a `nativeSent` value of zero since it is irrelevant for these tests.
      const newBalances = await acquisitionRoyale.callStatic.callAcquireHook(
        callerId,
        targetId,
        targetId,
        0
      )

      expect(newBalances._newCallerRpBalance).to.eq(balanceOfCaller)
      expect(newBalances._newTargetRpBalance).to.eq(balanceOfTarget)
    })

    it('should revert if the caller has moat immunity and the target has moat immunity', async () => {
      await acquisitionRoyale.callDepositHook(callerId, testMoatThreshold.sub(balanceOfCaller))
      await acquisitionRoyale.connect(treasury).setEnterpriseRp(callerId, testMoatThreshold)
      await acquisitionRoyale.callDepositHook(targetId, testMoatThreshold.sub(balanceOfTarget))
      await acquisitionRoyale.connect(treasury).setEnterpriseRp(targetId, testMoatThreshold)
      /**
       * Use enterpriseHasMoat for these test cases since the acquireHook will use it to determine
       * if an enterprise has moat immunity.
       */
      expect(await moat.enterpriseHasMoat(callerId)).to.eq(true)
      expect(await moat.enterpriseHasMoat(targetId)).to.eq(true)

      await expect(
        acquisitionRoyale.callAcquireHook(callerId, targetId, targetId, 0)
      ).to.be.revertedWith('Target has moat immunity')
    })

    it("should revert if the caller doesn't have moat immunity and the target has moat immunity", async () => {
      /**
       * Use divided by 2 for simplicity since enterpriseHasMoat uses the enterprise's virtual
       * balance and calculating the amount just below the virtual balance would make this
       * test case more cumbersome than it needs to be.
       */
      await acquisitionRoyale.callDepositHook(
        callerId,
        testMoatThreshold.div(2).sub(balanceOfCaller)
      )
      await acquisitionRoyale.connect(treasury).setEnterpriseRp(callerId, testMoatThreshold.div(2))
      await acquisitionRoyale.callDepositHook(targetId, testMoatThreshold.sub(balanceOfTarget))
      await acquisitionRoyale.connect(treasury).setEnterpriseRp(targetId, testMoatThreshold)
      expect(await moat.enterpriseHasMoat(callerId)).to.eq(false)
      expect(await moat.enterpriseHasMoat(targetId)).to.eq(true)

      await expect(
        acquisitionRoyale.callAcquireHook(callerId, targetId, targetId, 0)
      ).to.be.revertedWith('Target has moat immunity')
    })

    describe('if the calling enterprise is kept', () => {
      it("should not affect caller's moat and not affect target if it didn't have a moat", async () => {
        await acquisitionRoyale.callDepositHook(callerId, testMoatThreshold.sub(balanceOfCaller))
        await acquisitionRoyale.connect(treasury).setEnterpriseRp(callerId, testMoatThreshold)
        await acquisitionRoyale.callDepositHook(
          targetId,
          testMoatThreshold.div(2).sub(balanceOfTarget)
        )
        await acquisitionRoyale
          .connect(treasury)
          .setEnterpriseRp(targetId, testMoatThreshold.div(2))
        expect(await moat.getLastHadMoat(callerId)).to.eq(true)
        expect(await moat.getLastHadMoat(targetId)).to.eq(false)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)

        await acquisitionRoyale.callAcquireHook(callerId, targetId, targetId, 0)

        expect(await moat.getLastHadMoat(callerId)).to.eq(true)
        expect(await moat.getLastHadMoat(targetId)).to.eq(false)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)
      })

      it('should not affect caller and target if neither had a moat', async () => {
        await acquisitionRoyale.callDepositHook(
          callerId,
          testMoatThreshold.div(2).sub(balanceOfCaller)
        )
        await acquisitionRoyale
          .connect(treasury)
          .setEnterpriseRp(callerId, testMoatThreshold.div(2))
        await acquisitionRoyale.callDepositHook(
          targetId,
          testMoatThreshold.div(2).sub(balanceOfTarget)
        )
        await acquisitionRoyale
          .connect(treasury)
          .setEnterpriseRp(targetId, testMoatThreshold.div(2))
        expect(await moat.getLastHadMoat(callerId)).to.eq(false)
        expect(await moat.getLastHadMoat(targetId)).to.eq(false)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)

        await acquisitionRoyale.callAcquireHook(callerId, targetId, targetId, 0)

        expect(await moat.getLastHadMoat(callerId)).to.eq(false)
        expect(await moat.getLastHadMoat(targetId)).to.eq(false)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)
      })
    })

    describe('if the target enterprise is kept', () => {
      it("should award a moat to the target if transferred RP brings balance >= threshold and begin the caller's moat countdown if it had a moat", async () => {
        await acquisitionRoyale.callDepositHook(callerId, testMoatThreshold.sub(balanceOfCaller))
        await acquisitionRoyale.connect(treasury).setEnterpriseRp(callerId, testMoatThreshold)
        await acquisitionRoyale.callDepositHook(
          targetId,
          testMoatThreshold.div(2).sub(balanceOfTarget)
        )
        await acquisitionRoyale
          .connect(treasury)
          .setEnterpriseRp(targetId, testMoatThreshold.div(2))
        expect(await moat.getLastHadMoat(callerId)).to.eq(true)
        expect(await moat.getLastHadMoat(targetId)).to.eq(false)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)

        await acquisitionRoyale.callAcquireHook(callerId, targetId, callerId, 0)

        expect(await moat.getLastHadMoat(callerId)).to.eq(true)
        expect(await moat.getLastHadMoat(targetId)).to.eq(true)
        expect(await moat.getMoatCountdown(callerId)).to.eq(await getLastTimestamp())
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)
      })

      it("should award a moat to the target if transferred RP brings balance >= threshold and not affect caller if it didn't have a moat", async () => {
        await acquisitionRoyale.callDepositHook(
          callerId,
          testMoatThreshold.sub(balanceOfCaller).sub(1)
        )
        await acquisitionRoyale
          .connect(treasury)
          .setEnterpriseRp(callerId, testMoatThreshold.sub(1))
        await acquisitionRoyale.callDepositHook(
          targetId,
          testMoatThreshold.div(2).sub(balanceOfTarget)
        )
        await acquisitionRoyale
          .connect(treasury)
          .setEnterpriseRp(targetId, testMoatThreshold.div(2))
        expect(await moat.getLastHadMoat(callerId)).to.eq(false)
        expect(await moat.getLastHadMoat(targetId)).to.eq(false)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)

        await acquisitionRoyale.callAcquireHook(callerId, targetId, callerId, 0)

        expect(await moat.getLastHadMoat(callerId)).to.eq(false)
        expect(await moat.getLastHadMoat(targetId)).to.eq(true)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)
      })

      it("should not affect target if its balance stays < threshold and begin caller's moat countdown if it had a moat", async () => {
        await acquisitionRoyale.callDepositHook(callerId, testMoatThreshold.sub(balanceOfCaller))
        await acquisitionRoyale.connect(treasury).setEnterpriseRp(callerId, testMoatThreshold)
        /**
         * Bring target's balance to 1 to ensure the transferred RP from the moated caller does not bring
         * its balance over the threshold.
         */
        await acquisitionRoyale.connect(treasury).setEnterpriseRp(targetId, 1)
        /**
         * To register the overwritten balance with `Moat` contract, we can use an empty callDepositHook call.
         * This is because in-game, deposits will happen via the deposit() function which will both update
         * the in-game RP balance and register the change with the `Moat` contract. Since we are testing hook
         * functions separately from the `AcquisitionRoyale` contract, we need to replicate what would happen
         * by performing these operations separately.
         */
        await acquisitionRoyale.callDepositHook(targetId, 0)
        expect(await moat.getLastHadMoat(callerId)).to.eq(true)
        expect(await moat.getLastHadMoat(targetId)).to.eq(false)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)

        await acquisitionRoyale.callAcquireHook(callerId, targetId, callerId, 0)

        expect(await moat.getLastHadMoat(callerId)).to.eq(true)
        expect(await moat.getLastHadMoat(targetId)).to.eq(false)
        expect(await moat.getMoatCountdown(callerId)).to.eq(await getLastTimestamp())
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)
      })

      it("should not affect target if its balance stays < threshold and not affect caller if it didn't have a moat", async () => {
        /**
         * Starting balances can be kept since they are small enough to keep an acquisition from
         * giving the target moat immunity. However, we still need to record their statuses with
         * the moat contract, which can be done via two empty deposit calls.
         */
        await acquisitionRoyale.callDepositHook(callerId, 0)
        await acquisitionRoyale.callDepositHook(targetId, 0)
        // Demonstrate starting balances fulfill the testcase requirements
        const amountToBurn = balanceOfCaller
          .mul(await acquisitionRoyale.getMergerBurnPercentage())
          .div(PERCENT_DENOMINATOR)
        const amountToTransfer = balanceOfCaller.sub(amountToBurn)
        expect(balanceOfTarget.add(amountToTransfer)).to.be.lt(testMoatThreshold)
        expect(await moat.getLastHadMoat(callerId)).to.eq(false)
        expect(await moat.getLastHadMoat(targetId)).to.eq(false)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)

        await acquisitionRoyale.callAcquireHook(callerId, targetId, callerId, 0)

        expect(await moat.getLastHadMoat(callerId)).to.eq(false)
        expect(await moat.getLastHadMoat(targetId)).to.eq(false)
        expect(await moat.getMoatCountdown(callerId)).to.eq(0)
        expect(await moat.getMoatCountdown(targetId)).to.eq(0)
      })
    })
  })

  describe('depositHook', () => {
    const testEnterpriseId = 1
    const testEnterpriseBalance = parseEther('10')
    const testRpToDeposit = parseEther('5')
    beforeEach(async () => {
      await acquisitionRoyale
        .connect(treasury)
        .setEnterpriseRp(testEnterpriseId, testEnterpriseBalance)
    })

    it('should only be callable by the AcquisitionRoyale contract', async () => {
      await expect(
        acqrHook.connect(user).callStatic.depositHook(testEnterpriseId, testRpToDeposit)
      ).to.be.revertedWith('Caller is not Acquisition Royale')
    })

    it("should return the sum of the enterprise's balance and the amount being deposited", async () => {
      expect(
        await acquisitionRoyale
          .connect(user)
          .callStatic.callDepositHook(testEnterpriseId, testRpToDeposit)
      ).to.eq(testEnterpriseBalance.add(testRpToDeposit))
    })

    it('should give the enterprise a moat if its balance becomes >= threshold', async () => {
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(false)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)

      await acquisitionRoyale
        .connect(user)
        .callDepositHook(testEnterpriseId, testMoatThreshold.sub(testEnterpriseBalance))

      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(true)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)
    })

    it('should not give the enterprise a moat if its balance stays < threshold', async () => {
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(false)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)

      await acquisitionRoyale
        .connect(user)
        .callDepositHook(testEnterpriseId, testMoatThreshold.sub(testEnterpriseBalance).sub(1))

      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(false)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)
    })

    it('should not affect an enterprise that already has a moat', async () => {
      await acquisitionRoyale
        .connect(user)
        .callDepositHook(testEnterpriseId, testMoatThreshold.sub(testEnterpriseBalance))
      await acquisitionRoyale.connect(treasury).setEnterpriseRp(testEnterpriseId, testMoatThreshold)
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(true)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)

      await acquisitionRoyale.connect(user).callDepositHook(testEnterpriseId, 1)

      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(true)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)
    })
  })

  describe('withdrawHook', () => {
    const testEnterpriseId = 1
    const testEnterpriseBalance = parseEther('10')
    const testRpToWithdraw = parseEther('5')
    beforeEach(async () => {
      await acquisitionRoyale
        .connect(treasury)
        .setEnterpriseRp(testEnterpriseId, testEnterpriseBalance)
    })

    it('should only be callable by the AcquisitionRoyale contract', async () => {
      await expect(
        acqrHook.connect(user).callStatic.withdrawHook(testEnterpriseId, testRpToWithdraw)
      ).to.be.revertedWith('Caller is not Acquisition Royale')
    })

    it('should return the correct new enterprise balance and amount to mint and burn based on the withdrawal amount and fee', async () => {
      const withdrawReturnValues = await acquisitionRoyale
        .connect(user)
        .callStatic.callWithdrawHook(testEnterpriseId, testRpToWithdraw)

      expect(withdrawReturnValues._newRpBalance).to.eq(testEnterpriseBalance.sub(testRpToWithdraw))
      const expectedAmountToBurn = testRpToWithdraw
        .mul(await acquisitionRoyale.getWithdrawalBurnPercentage())
        .div(PERCENT_DENOMINATOR)
      expect(withdrawReturnValues._rpToMint).to.eq(testRpToWithdraw.sub(expectedAmountToBurn))
      expect(withdrawReturnValues._rpToBurn).to.eq(expectedAmountToBurn)
    })

    it('should give the enterprise a moat and begin its countdown if it obtains a moat from RP passively accumulated, but its balance falls < threshold', async () => {
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(false)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)
      // Directly modify the RP balance to simulate passive RP accumulation
      await acquisitionRoyale.connect(treasury).setEnterpriseRp(testEnterpriseId, testMoatThreshold)

      await acquisitionRoyale.connect(user).callWithdrawHook(testEnterpriseId, 1)

      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(true)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(await getLastTimestamp())
    })

    it('should give the enterprise a moat and not begin its countdown if it obtains a moat from RP passively accumulated and its balance stays >= threshold', async () => {
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(false)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)
      // Directly modify the RP balance to simulate passive RP accumulation
      await acquisitionRoyale
        .connect(treasury)
        .setEnterpriseRp(testEnterpriseId, testMoatThreshold.add(1))

      await acquisitionRoyale.connect(user).callWithdrawHook(testEnterpriseId, 1)

      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(true)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)
    })

    it("should not affect an enterprise's moat if it already has one and its balance stays >= threshold", async () => {
      await acquisitionRoyale
        .connect(user)
        .callDepositHook(testEnterpriseId, testMoatThreshold.add(1).sub(testEnterpriseBalance))
      await acquisitionRoyale
        .connect(treasury)
        .setEnterpriseRp(testEnterpriseId, testMoatThreshold.add(1))
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(true)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)

      await acquisitionRoyale.connect(user).callWithdrawHook(testEnterpriseId, 1)

      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(true)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)
    })

    it("should begin an enterprise's moat countdown if it currently has a moat and its balance falls < threshold", async () => {
      await acquisitionRoyale
        .connect(user)
        .callDepositHook(testEnterpriseId, testMoatThreshold.sub(testEnterpriseBalance))
      await acquisitionRoyale.connect(treasury).setEnterpriseRp(testEnterpriseId, testMoatThreshold)
      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(true)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(0)

      await acquisitionRoyale.connect(user).callWithdrawHook(testEnterpriseId, 1)

      expect(await moat.getLastHadMoat(testEnterpriseId)).to.eq(true)
      expect(await moat.getMoatCountdown(testEnterpriseId)).to.eq(await getLastTimestamp())
    })
  })
})
