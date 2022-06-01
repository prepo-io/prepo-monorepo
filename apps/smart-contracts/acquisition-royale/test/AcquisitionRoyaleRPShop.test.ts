/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-loop-func */
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { utils, BigNumber } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { mockERC20Fixture } from './fixtures/MockERC20Fixture'
import { runwayPointsFixture } from './fixtures/RunwayPointsFixture'
import { acquisitionRoyaleConsumablesFixture } from './fixtures/AcquisitionRoyaleConsumablesFixture'
import { mockAcquisitionRoyaleFixture } from './fixtures/AcquisitionRoyaleFixture'
import { acquisitionRoyaleRPShopFixture } from './fixtures/AcquisitionRoyaleRPShopFixture'
import { AddressZero, getLastTimestamp, PERCENT_DENOMINATOR, setNextTimestamp } from './utils'
import { moatFixture } from './fixtures/MoatFixture'
import { acqrHookV1Fixture } from './fixtures/AcqrHookFixture'
import {
  AcquisitionRoyaleConsumables,
  MockAcquisitionRoyale,
  AcquisitionRoyaleRPShop,
  MockERC20,
  Moat,
  AcqrHookV1,
} from '../typechain'

const { parseEther } = utils

describe('AcquisitionRoyaleRPShop', () => {
  let deployer: SignerWithAddress
  let user: SignerWithAddress
  let user2: SignerWithAddress
  let treasury: SignerWithAddress
  let merkleProofVerifier: SignerWithAddress
  let mockWeth: MockERC20
  let runwayPoints: MockERC20
  let royaleConsumables: AcquisitionRoyaleConsumables
  let acquisitionRoyale: MockAcquisitionRoyale
  let acquisitionRoyaleRPShop: AcquisitionRoyaleRPShop
  let moat: Moat
  let acqrHook: AcqrHookV1
  const defaultRenameTokenRpPrice = parseEther('10')
  const defaultRebrandTokenRpPrice = parseEther('100')
  const defaultReviveTokenRpPrice = parseEther('1000')
  const defaultEnterpriseRpPrice = parseEther('1500')
  const renameSupply = 10000
  const rebrandSupply = 1000
  const reviveSupply = 100
  const testMoatThreshold = parseEther('50')
  const testMoatImmunityPeriod = 172800 // 2 days in seconds

  const calculateVirtualBalance = async (
    enterpriseId: number,
    blockTime: number
  ): Promise<BigNumber> => {
    const gameStartTime = (await acquisitionRoyale.getGameStartTime()).toNumber()
    const enterpriseBefore = await acquisitionRoyale.getEnterprise(enterpriseId)
    if (blockTime < gameStartTime || gameStartTime === 0) {
      return enterpriseBefore.rp
    }
    const lastUpdated = enterpriseBefore.lastRpUpdateTime.eq(0)
      ? gameStartTime
      : enterpriseBefore.lastRpUpdateTime.toNumber()
    const passiveRates = await acquisitionRoyale.getPassiveRpPerDay()
    let rpPerDay = passiveRates._base
      .add(passiveRates._acquisitions.mul(enterpriseBefore.acquisitions))
      .add(passiveRates._mergers.mul(enterpriseBefore.mergers))
    rpPerDay = rpPerDay.gt(passiveRates._max) ? passiveRates._max : rpPerDay
    return enterpriseBefore.rp.add(rpPerDay.mul(blockTime - lastUpdated).div(86400))
  }

  beforeEach(async () => {
    ;[deployer, user, user2, treasury, merkleProofVerifier] = await ethers.getSigners()
    runwayPoints = await mockERC20Fixture('Runway Points', 'RP')
    await runwayPoints.connect(deployer).mint(deployer.address, parseEther('1000000'))
    mockWeth = await mockERC20Fixture('WETH9', 'WETH9')
    acquisitionRoyale = await mockAcquisitionRoyaleFixture()
    runwayPoints = await runwayPointsFixture(acquisitionRoyale.address)
    royaleConsumables = await acquisitionRoyaleConsumablesFixture(
      'Acquisition Royale Consumables',
      'AQR-C',
      'rename.json',
      'rebrand.json',
      'revive.json',
      acquisitionRoyale.address
    )
    await acquisitionRoyale.initialize(
      'Acquisition Royale',
      'AQR',
      merkleProofVerifier.address,
      mockWeth.address,
      runwayPoints.address,
      royaleConsumables.address
    )
    await acquisitionRoyale.transferOwnership(treasury.address)

    acquisitionRoyaleRPShop = await acquisitionRoyaleRPShopFixture()
    await acquisitionRoyaleRPShop.initialize(
      runwayPoints.address,
      acquisitionRoyale.address,
      royaleConsumables.address,
      defaultRenameTokenRpPrice,
      defaultRebrandTokenRpPrice,
      defaultReviveTokenRpPrice,
      defaultEnterpriseRpPrice
    )
    moat = await moatFixture(acquisitionRoyale.address, testMoatThreshold, testMoatImmunityPeriod)
    acqrHook = await acqrHookV1Fixture(acquisitionRoyale.address, moat.address)
    await moat.setAcqrHook(acqrHook.address)
    await acquisitionRoyale.connect(treasury).setHook(acqrHook.address)
    await acquisitionRoyale.connect(treasury).setGameStartTime(await getLastTimestamp())
  })

  describe('# initialize', () => {
    it('should be initialized with correct value', async () => {
      expect(await acquisitionRoyaleRPShop.getRunwayPoints()).to.eq(runwayPoints.address)
      expect(await acquisitionRoyaleRPShop.getAcquisitionRoyale()).to.eq(acquisitionRoyale.address)
      expect(await acquisitionRoyaleRPShop.getConsumables()).to.eq(royaleConsumables.address)
      expect(await acquisitionRoyaleRPShop.getRenameTokenRpPrice()).to.eq(defaultRenameTokenRpPrice)
      expect(await acquisitionRoyaleRPShop.getRebrandTokenRpPrice()).to.eq(
        defaultRebrandTokenRpPrice
      )
      expect(await acquisitionRoyaleRPShop.getReviveTokenRpPrice()).to.eq(defaultReviveTokenRpPrice)
      expect(await acquisitionRoyaleRPShop.getEnterpriseRpPrice()).to.eq(defaultEnterpriseRpPrice)
    })
  })

  describe('# onERC1155Received', () => {
    it('should be compliant with ERC1155 safeTransfer() requirements', async () => {
      await expect(
        royaleConsumables
          .connect(deployer)
          .safeTransferFrom(deployer.address, acquisitionRoyaleRPShop.address, 0, 1, [])
      ).not.reverted
    })
  })

  describe('# onERC1155BatchReceived', () => {
    it('should be compliant with ERC1155 safeBatchTransfer() requirements', async () => {
      // Batch transfer one of each consumable to ensure batched transfer to the AcquisitionRoyaleRPShop contract does not revert.
      await expect(
        royaleConsumables
          .connect(deployer)
          .safeBatchTransferFrom(
            deployer.address,
            acquisitionRoyaleRPShop.address,
            [0, 1, 2],
            [1, 1, 1],
            []
          )
      ).not.reverted
    })
  })

  describe('# onERC721Received', () => {
    it('should be compliant with ERC721 safeTransfer() requirements', async () => {
      // Provide the deployer an enterprise to test that safeTransfer to the AcquisitionRoyaleRPShop contract does not revert.
      await acquisitionRoyale.connect(treasury).mintEnterprise(deployer.address, 0)

      await expect(
        acquisitionRoyale
          .connect(deployer)
          ['safeTransferFrom(address,address,uint256)'](
            deployer.address,
            acquisitionRoyaleRPShop.address,
            0
          )
      ).not.reverted
    })
  })

  describe('# ownerConsumablesWithdraw', () => {
    beforeEach(async () => {
      // Transfer the initially minted Consumables to the AcquisitionRoyaleRPShop contract.
      await royaleConsumables
        .connect(deployer)
        .safeTransferFrom(deployer.address, acquisitionRoyaleRPShop.address, 0, renameSupply, [])
      await royaleConsumables
        .connect(deployer)
        .safeTransferFrom(deployer.address, acquisitionRoyaleRPShop.address, 1, rebrandSupply, [])
      await royaleConsumables
        .connect(deployer)
        .safeTransferFrom(deployer.address, acquisitionRoyaleRPShop.address, 2, reviveSupply, [])
    })

    it('should only be usable by the owner', async () => {
      expect(await acquisitionRoyaleRPShop.owner()).to.not.eq(user.address)

      await expect(
        acquisitionRoyaleRPShop.connect(user).ownerConsumablesWithdraw(0, renameSupply - 1)
      ).revertedWith('Ownable: caller is not the owner')
    })

    for (let tokenId = 0; tokenId < 3; tokenId++) {
      it(`should transfer the correct amount of ERC1155 token out of the contract to the owner (tokenId = ${tokenId})`, async () => {
        const ownerBalanceBefore = await royaleConsumables.balanceOf(deployer.address, tokenId)
        const contractBalanceBefore = await royaleConsumables.balanceOf(
          acquisitionRoyaleRPShop.address,
          tokenId
        )
        // Withdraw the total balance minus one to ensure that the only the quantity specified is withdrawn.
        const amountToWithdraw = contractBalanceBefore.sub(1)
        // Verify that amount being withdrawn is non-zero.
        expect(amountToWithdraw).to.be.gt(0)

        await acquisitionRoyaleRPShop
          .connect(deployer)
          .ownerConsumablesWithdraw(tokenId, amountToWithdraw)

        expect(await royaleConsumables.balanceOf(deployer.address, tokenId)).to.eq(
          ownerBalanceBefore.add(amountToWithdraw)
        )
        expect(await royaleConsumables.balanceOf(acquisitionRoyaleRPShop.address, tokenId)).to.eq(
          contractBalanceBefore.sub(amountToWithdraw)
        )
      })
    }
  })

  describe('# ownerEnterpriseWithdraw', () => {
    const testEnterpriseCount = 3
    beforeEach(async () => {
      //  Mint Enterprises to the RP shop for the owner to withdraw.
      for (let i = 0; i < testEnterpriseCount; i++) {
        await acquisitionRoyale.connect(treasury).mintEnterprise(acquisitionRoyaleRPShop.address, i)
      }
    })

    it('should only be usable by the owner', async () => {
      expect(await acquisitionRoyaleRPShop.owner()).to.not.eq(user.address)

      await expect(
        acquisitionRoyaleRPShop.connect(user).ownerEnterpriseWithdraw(0, testEnterpriseCount)
      ).revertedWith('Ownable: caller is not the owner')
    })

    it('should transfer the specified tokenId to the owner at no RP cost if the quantity specified is 1', async () => {
      // Withdraw the last enterprise sent to the contract.
      const enterpriseToWithdraw = testEnterpriseCount - 1
      expect(await acquisitionRoyale.ownerOf(enterpriseToWithdraw)).to.eq(
        acquisitionRoyaleRPShop.address
      )
      expect(await acquisitionRoyaleRPShop.owner()).to.eq(deployer.address)

      await acquisitionRoyaleRPShop
        .connect(deployer)
        .ownerEnterpriseWithdraw(enterpriseToWithdraw, 1)

      expect(await acquisitionRoyale.ownerOf(enterpriseToWithdraw)).to.eq(deployer.address)
    })

    it('should transfer the specified number of Enterprises to the owner at no RP cost if the quantity specified is != 1', async () => {
      const shopEnterpriseBalanceBefore = await acquisitionRoyale.balanceOf(
        acquisitionRoyaleRPShop.address
      )
      expect(await acquisitionRoyaleRPShop.owner()).to.eq(deployer.address)
      const ownerEnterpriseBalanceBefore = await acquisitionRoyale.balanceOf(deployer.address)
      expect(await acquisitionRoyale.ownerOf(testEnterpriseCount)).to.eq(AddressZero)

      // Passing testEnterpriseCount for the tokenId to demonstrate this is ignored.
      await acquisitionRoyaleRPShop
        .connect(deployer)
        .ownerEnterpriseWithdraw(testEnterpriseCount, testEnterpriseCount)

      expect(await acquisitionRoyale.balanceOf(acquisitionRoyaleRPShop.address)).to.eq(
        shopEnterpriseBalanceBefore.sub(testEnterpriseCount)
      )
      expect(await acquisitionRoyale.balanceOf(deployer.address)).to.eq(
        ownerEnterpriseBalanceBefore.add(testEnterpriseCount)
      )
    })

    it('should not allow owner to transfer more Enterprises than the RPShop has', async () => {
      expect(await acquisitionRoyale.balanceOf(acquisitionRoyaleRPShop.address)).to.be.lt(
        testEnterpriseCount + 1
      )
      expect(await acquisitionRoyaleRPShop.owner()).to.eq(deployer.address)

      await expect(
        acquisitionRoyaleRPShop
          .connect(deployer)
          .ownerEnterpriseWithdraw(0, testEnterpriseCount + 1)
      ).to.be.revertedWith("Exceeds shop's Enterprise supply")
    })

    it('should not allow specifying a quantity of 0', async () => {
      // Passing testEnterpriseCount for the tokenId to demonstrate this is ignored.
      await expect(
        acquisitionRoyaleRPShop.connect(deployer).ownerEnterpriseWithdraw(testEnterpriseCount, 0)
      ).to.be.revertedWith('Quantity cannot be zero')
    })
  })

  describe('# setRenameTokenRpPrice', () => {
    it('should only be usable by the owner', async () => {
      expect(await acquisitionRoyaleRPShop.owner()).to.not.eq(user.address)

      await expect(
        acquisitionRoyaleRPShop
          .connect(user)
          .setRenameTokenRpPrice(defaultRenameTokenRpPrice.add(1))
      ).revertedWith('Ownable: caller is not the owner')
    })

    it('should correctly set the Rename price to a new value', async () => {
      expect(await acquisitionRoyaleRPShop.getRenameTokenRpPrice()).to.eq(defaultRenameTokenRpPrice)

      await acquisitionRoyaleRPShop
        .connect(deployer)
        .setRenameTokenRpPrice(defaultRenameTokenRpPrice.add(1))

      expect(await acquisitionRoyaleRPShop.getRenameTokenRpPrice()).to.eq(
        defaultRenameTokenRpPrice.add(1)
      )
    })

    it('should correctly set the same value twice', async () => {
      expect(await acquisitionRoyaleRPShop.getRenameTokenRpPrice()).to.eq(defaultRenameTokenRpPrice)
      await acquisitionRoyaleRPShop
        .connect(deployer)
        .setRenameTokenRpPrice(defaultRenameTokenRpPrice.add(1))
      expect(await acquisitionRoyaleRPShop.getRenameTokenRpPrice()).to.eq(
        defaultRenameTokenRpPrice.add(1)
      )

      await acquisitionRoyaleRPShop
        .connect(deployer)
        .setRenameTokenRpPrice(defaultRenameTokenRpPrice.add(1))

      expect(await acquisitionRoyaleRPShop.getRenameTokenRpPrice()).to.eq(
        defaultRenameTokenRpPrice.add(1)
      )
    })
  })

  describe('# setRebrandTokenRpPrice', () => {
    it('should only be usable by the owner', async () => {
      expect(await acquisitionRoyaleRPShop.owner()).to.not.eq(user.address)

      await expect(
        acquisitionRoyaleRPShop
          .connect(user)
          .setRebrandTokenRpPrice(defaultRebrandTokenRpPrice.add(1))
      ).revertedWith('Ownable: caller is not the owner')
    })

    it('should correctly set the Rebrand price to a new value', async () => {
      expect(await acquisitionRoyaleRPShop.getRebrandTokenRpPrice()).to.eq(
        defaultRebrandTokenRpPrice
      )

      await acquisitionRoyaleRPShop
        .connect(deployer)
        .setRebrandTokenRpPrice(defaultRebrandTokenRpPrice.add(1))

      expect(await acquisitionRoyaleRPShop.getRebrandTokenRpPrice()).to.eq(
        defaultRebrandTokenRpPrice.add(1)
      )
    })

    it('should correctly set the same value twice', async () => {
      expect(await acquisitionRoyaleRPShop.getRebrandTokenRpPrice()).to.eq(
        defaultRebrandTokenRpPrice
      )
      await acquisitionRoyaleRPShop
        .connect(deployer)
        .setRebrandTokenRpPrice(defaultRebrandTokenRpPrice.add(1))
      expect(await acquisitionRoyaleRPShop.getRebrandTokenRpPrice()).to.eq(
        defaultRebrandTokenRpPrice.add(1)
      )

      await acquisitionRoyaleRPShop
        .connect(deployer)
        .setRebrandTokenRpPrice(defaultRebrandTokenRpPrice.add(1))

      expect(await acquisitionRoyaleRPShop.getRebrandTokenRpPrice()).to.eq(
        defaultRebrandTokenRpPrice.add(1)
      )
    })
  })

  describe('# setReviveTokenRpPrice', () => {
    it('should only be usable by the owner', async () => {
      expect(await acquisitionRoyaleRPShop.owner()).to.not.eq(user.address)

      await expect(
        acquisitionRoyaleRPShop
          .connect(user)
          .setReviveTokenRpPrice(defaultReviveTokenRpPrice.add(1))
      ).revertedWith('Ownable: caller is not the owner')
    })

    it('should correctly set the Revive price to a new value', async () => {
      expect(await acquisitionRoyaleRPShop.getReviveTokenRpPrice()).to.eq(defaultReviveTokenRpPrice)

      await acquisitionRoyaleRPShop
        .connect(deployer)
        .setReviveTokenRpPrice(defaultReviveTokenRpPrice.add(1))

      expect(await acquisitionRoyaleRPShop.getReviveTokenRpPrice()).to.eq(
        defaultReviveTokenRpPrice.add(1)
      )
    })

    it('should correctly set the same value twice', async () => {
      expect(await acquisitionRoyaleRPShop.getReviveTokenRpPrice()).to.eq(defaultReviveTokenRpPrice)
      await acquisitionRoyaleRPShop
        .connect(deployer)
        .setReviveTokenRpPrice(defaultReviveTokenRpPrice.add(1))
      expect(await acquisitionRoyaleRPShop.getReviveTokenRpPrice()).to.eq(
        defaultReviveTokenRpPrice.add(1)
      )

      await acquisitionRoyaleRPShop
        .connect(deployer)
        .setReviveTokenRpPrice(defaultReviveTokenRpPrice.add(1))

      expect(await acquisitionRoyaleRPShop.getReviveTokenRpPrice()).to.eq(
        defaultReviveTokenRpPrice.add(1)
      )
    })
  })

  describe('# setEnterpriseRpPrice', () => {
    it('should only be usable by the owner', async () => {
      expect(await acquisitionRoyaleRPShop.owner()).to.not.eq(user.address)

      await expect(
        acquisitionRoyaleRPShop.connect(user).setEnterpriseRpPrice(defaultEnterpriseRpPrice.add(1))
      ).revertedWith('Ownable: caller is not the owner')
    })

    it('should correctly set the Enterprise price to a new value', async () => {
      expect(await acquisitionRoyaleRPShop.getEnterpriseRpPrice()).to.eq(defaultEnterpriseRpPrice)

      await acquisitionRoyaleRPShop
        .connect(deployer)
        .setEnterpriseRpPrice(defaultEnterpriseRpPrice.add(1))

      expect(await acquisitionRoyaleRPShop.getEnterpriseRpPrice()).to.eq(
        defaultEnterpriseRpPrice.add(1)
      )
    })

    it('should correctly set the same value twice', async () => {
      expect(await acquisitionRoyaleRPShop.getEnterpriseRpPrice()).to.eq(defaultEnterpriseRpPrice)
      await acquisitionRoyaleRPShop
        .connect(deployer)
        .setEnterpriseRpPrice(defaultEnterpriseRpPrice.add(1))
      expect(await acquisitionRoyaleRPShop.getEnterpriseRpPrice()).to.eq(
        defaultEnterpriseRpPrice.add(1)
      )

      await acquisitionRoyaleRPShop
        .connect(deployer)
        .setEnterpriseRpPrice(defaultEnterpriseRpPrice.add(1))

      expect(await acquisitionRoyaleRPShop.getEnterpriseRpPrice()).to.eq(
        defaultEnterpriseRpPrice.add(1)
      )
    })
  })

  describe('# purchaseConsumable', () => {
    beforeEach(async () => {
      // Transfer the initially minted Consumables to the AcquisitionRoyaleRPShop contract.
      await royaleConsumables
        .connect(deployer)
        .safeTransferFrom(deployer.address, acquisitionRoyaleRPShop.address, 0, renameSupply, [])
      await royaleConsumables
        .connect(deployer)
        .safeTransferFrom(deployer.address, acquisitionRoyaleRPShop.address, 1, rebrandSupply, [])
      await royaleConsumables
        .connect(deployer)
        .safeTransferFrom(deployer.address, acquisitionRoyaleRPShop.address, 2, reviveSupply, [])
      await runwayPoints.transfer(user.address, parseEther('10000'))
    })

    it('should not allow users to purchase using an invalid Consumables tokenId', async () => {
      const testQuantity = 10
      const invalidTokenId = 3 // AcquisitionRoyaleConsumables only exist from tokenId 0-2

      await expect(
        acquisitionRoyaleRPShop.connect(user).purchaseConsumable(invalidTokenId, testQuantity)
      ).to.be.revertedWith('Invalid Consumable ID')
    })

    for (let tokenId = 0; tokenId < 3; tokenId++) {
      it(`should send the correct amount of Consumables to a buyer in exchange for RP sent to the owner based on the price (tokenId = ${tokenId})`, async () => {
        const testQuantity = 10
        const ownerRpBalanceBefore = await runwayPoints.balanceOf(deployer.address)
        const userRpBalanceBefore = await runwayPoints.balanceOf(user.address)
        let tokenPrice: BigNumber
        if (tokenId === 0) {
          tokenPrice = await acquisitionRoyaleRPShop.getRenameTokenRpPrice()
        } else if (tokenId === 1) {
          tokenPrice = await acquisitionRoyaleRPShop.getRebrandTokenRpPrice()
        } else {
          tokenPrice = await acquisitionRoyaleRPShop.getReviveTokenRpPrice()
        }
        await runwayPoints
          .connect(user)
          .approve(acquisitionRoyaleRPShop.address, ethers.constants.MaxUint256)

        await acquisitionRoyaleRPShop.connect(user).purchaseConsumable(tokenId, testQuantity)

        expect(await royaleConsumables.balanceOf(user.address, tokenId)).to.eq(testQuantity)
        expect(await runwayPoints.balanceOf(user.address)).to.eq(
          userRpBalanceBefore.sub(tokenPrice.mul(testQuantity))
        )
        expect(await runwayPoints.balanceOf(deployer.address)).to.eq(
          ownerRpBalanceBefore.add(tokenPrice.mul(testQuantity))
        )
      })
    }

    for (let tokenId = 0; tokenId < 3; tokenId++) {
      it(`should not let a purchase go through if the user has an insufficient RP balance (tokenId = ${tokenId})`, async () => {
        const testQuantity = 10
        const user2RpBalanceBefore = await runwayPoints.balanceOf(user2.address)
        let tokenPrice: BigNumber
        if (tokenId === 0) {
          tokenPrice = await acquisitionRoyaleRPShop.getRenameTokenRpPrice()
        } else if (tokenId === 1) {
          tokenPrice = await acquisitionRoyaleRPShop.getRebrandTokenRpPrice()
        } else {
          tokenPrice = await acquisitionRoyaleRPShop.getReviveTokenRpPrice()
        }
        expect(user2RpBalanceBefore).to.be.lt(tokenPrice.mul(testQuantity))
        await runwayPoints
          .connect(user2)
          .approve(acquisitionRoyaleRPShop.address, ethers.constants.MaxUint256)

        await expect(
          acquisitionRoyaleRPShop.connect(user2).purchaseConsumable(tokenId, testQuantity)
        ).revertedWith('ERC20: transfer amount exceeds balance')
      })
    }

    for (let tokenId = 0; tokenId < 3; tokenId++) {
      it(`should not let a purchase go through if the user has an insufficient RP allowance (tokenId = ${tokenId})`, async () => {
        const testQuantity = 10
        let tokenPrice: BigNumber
        if (tokenId === 0) {
          tokenPrice = await acquisitionRoyaleRPShop.getRenameTokenRpPrice()
        } else if (tokenId === 1) {
          tokenPrice = await acquisitionRoyaleRPShop.getRebrandTokenRpPrice()
        } else {
          tokenPrice = await acquisitionRoyaleRPShop.getReviveTokenRpPrice()
        }
        await runwayPoints
          .connect(user)
          .approve(acquisitionRoyaleRPShop.address, tokenPrice.mul(testQuantity).sub(1))
        expect(
          await runwayPoints.allowance(user.address, acquisitionRoyaleRPShop.address)
        ).to.be.lt(tokenPrice.mul(testQuantity))

        await expect(
          acquisitionRoyaleRPShop.connect(user).purchaseConsumable(tokenId, testQuantity)
        ).revertedWith('ERC20: transfer amount exceeds allowance')
      })
    }
  })

  describe('# purchaseEnterprise', () => {
    const testEnterpriseCount = 3
    beforeEach(async () => {
      for (let i = 0; i < testEnterpriseCount; i++) {
        //  Mint Enterprises to the RP shop for users to purchase.
        await acquisitionRoyale.connect(treasury).mintEnterprise(acquisitionRoyaleRPShop.address, i)
      }
      await runwayPoints.transfer(user.address, parseEther('10000'))
    })

    it('should not allow user to purchase more Enterprises than the RPShop has', async () => {
      expect(await acquisitionRoyale.balanceOf(acquisitionRoyaleRPShop.address)).to.be.lt(
        testEnterpriseCount + 1
      )
      await runwayPoints
        .connect(user)
        .approve(
          acquisitionRoyaleRPShop.address,
          defaultEnterpriseRpPrice.mul(testEnterpriseCount + 1)
        )

      await expect(
        acquisitionRoyaleRPShop.connect(user).purchaseEnterprise(testEnterpriseCount + 1)
      ).to.be.revertedWith("Exceeds shop's Enterprise supply")
    })

    it('should transfer the specified number of Enterprises to the buyer in exchange for RP sent to the owner based on the Enterprise price', async () => {
      expect(await acquisitionRoyaleRPShop.owner()).to.eq(deployer.address)
      const ownerRpBalanceBefore = await runwayPoints.balanceOf(deployer.address)
      const userRpBalanceBefore = await runwayPoints.balanceOf(user.address)
      const shopEnterpriseBalanceBefore = await acquisitionRoyale.balanceOf(
        acquisitionRoyaleRPShop.address
      )
      const userEnterpriseBalanceBefore = await acquisitionRoyale.balanceOf(user.address)
      await runwayPoints
        .connect(user)
        .approve(acquisitionRoyaleRPShop.address, defaultEnterpriseRpPrice.mul(testEnterpriseCount))

      await acquisitionRoyaleRPShop.connect(user).purchaseEnterprise(testEnterpriseCount)

      expect(await runwayPoints.balanceOf(deployer.address)).to.eq(
        ownerRpBalanceBefore.add(defaultEnterpriseRpPrice.mul(testEnterpriseCount))
      )
      expect(await runwayPoints.balanceOf(user.address)).to.eq(
        userRpBalanceBefore.sub(defaultEnterpriseRpPrice.mul(testEnterpriseCount))
      )
      expect(await acquisitionRoyale.balanceOf(acquisitionRoyaleRPShop.address)).to.eq(
        shopEnterpriseBalanceBefore.sub(testEnterpriseCount)
      )
      expect(await acquisitionRoyale.balanceOf(user.address)).to.eq(
        userEnterpriseBalanceBefore.add(testEnterpriseCount)
      )
    })

    it('should not allow specifying a quantity of 0', async () => {
      await expect(acquisitionRoyaleRPShop.connect(user).purchaseEnterprise(0)).to.be.revertedWith(
        'Quantity cannot be zero'
      )
    })

    it('should not let a purchase go through if the user has an insufficient RP balance', async () => {
      expect(await runwayPoints.balanceOf(user2.address)).to.be.lt(
        defaultEnterpriseRpPrice.mul(testEnterpriseCount)
      )
      await runwayPoints
        .connect(user2)
        .approve(acquisitionRoyaleRPShop.address, defaultEnterpriseRpPrice.mul(testEnterpriseCount))

      await expect(
        acquisitionRoyaleRPShop.connect(user2).purchaseEnterprise(testEnterpriseCount)
      ).to.be.revertedWith('ERC20: transfer amount exceeds balance')
    })

    it('should not let a purchase go through if the user has an insufficient RP allowance', async () => {
      expect(await runwayPoints.balanceOf(user.address)).to.be.gte(
        defaultEnterpriseRpPrice.mul(testEnterpriseCount)
      )
      await runwayPoints
        .connect(user)
        .approve(
          acquisitionRoyaleRPShop.address,
          defaultEnterpriseRpPrice.mul(testEnterpriseCount).sub(1)
        )
      expect(await runwayPoints.allowance(user.address, acquisitionRoyaleRPShop.address)).to.be.lt(
        defaultEnterpriseRpPrice.mul(testEnterpriseCount)
      )

      await expect(
        acquisitionRoyaleRPShop.connect(user).purchaseEnterprise(testEnterpriseCount)
      ).to.be.revertedWith('ERC20: transfer amount exceeds allowance')
    })

    it('should withdraw entire RP balance of each enterprise prior to sending to buyer', async () => {
      await runwayPoints
        .connect(user)
        .approve(acquisitionRoyaleRPShop.address, defaultEnterpriseRpPrice.mul(testEnterpriseCount))
      let expectedRpToBeWithdrawn = BigNumber.from(0)
      const expectedTime = (await getLastTimestamp()) + 10
      for (let i = 0; i < testEnterpriseCount; i++) {
        const virtualBalanceBefore = await calculateVirtualBalance(i, expectedTime)
        expectedRpToBeWithdrawn = expectedRpToBeWithdrawn.add(virtualBalanceBefore)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setNextTimestamp(ethers.provider as any, expectedTime)

      await acquisitionRoyaleRPShop.connect(user).purchaseEnterprise(testEnterpriseCount)

      for (let i = 0; i < testEnterpriseCount; i++) {
        const virtualBalanceAfter = await acquisitionRoyale.getEnterpriseVirtualBalance(i)
        expect(virtualBalanceAfter).to.be.eq(0)
      }
      const expectedRpToBeBurnt = expectedRpToBeWithdrawn
        .mul(await acquisitionRoyale.getWithdrawalBurnPercentage())
        .div(PERCENT_DENOMINATOR)
      const expectedShopRpBalance = expectedRpToBeWithdrawn.sub(expectedRpToBeBurnt)
      expect(await runwayPoints.balanceOf(acquisitionRoyaleRPShop.address)).to.be.eq(
        expectedShopRpBalance
      )
    })
  })
})
