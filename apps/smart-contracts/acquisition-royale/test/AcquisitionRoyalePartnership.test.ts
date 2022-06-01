import { ethers } from 'hardhat'
import { expect } from 'chai'
import { utils, BigNumber } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { acquisitionRoyalePartnershipFixture } from './fixtures/AcquisitionRoyalePartnershipFixture'
import { mockERC20Fixture } from './fixtures/MockERC20Fixture'
import { AcquisitionRoyalePartnership } from '../typechain/AcquisitionRoyalePartnership'
import { MockERC20 } from '../typechain/MockERC20'

const { parseEther } = utils

describe('AcquistiionRoyalePartnership', () => {
  let deployer: SignerWithAddress
  let user: SignerWithAddress
  let testToken: MockERC20
  let testToken2: MockERC20
  let partnership: AcquisitionRoyalePartnership

  const TEST_PRICE = parseEther('10')
  const TEST_SUPPLY_LIMIT = BigNumber.from(15)

  beforeEach(async () => {
    ;[deployer, user] = await ethers.getSigners()
    testToken = await mockERC20Fixture('Test Token', 'TST')
    testToken2 = await mockERC20Fixture('Test Token 2', 'TST2')
    await testToken.connect(deployer).mint(user.address, parseEther('10000'))
    partnership = await acquisitionRoyalePartnershipFixture()
  })

  describe('# addPartnership', () => {
    it('should only be usable by the owner', async () => {
      await expect(
        partnership.connect(user).addPartnership(testToken.address, TEST_PRICE, TEST_SUPPLY_LIMIT)
      ).revertedWith('Ownable: caller is not the owner')
    })

    it('should assign the correct values for a partner', async () => {
      await partnership
        .connect(deployer)
        .addPartnership(testToken.address, TEST_PRICE, TEST_SUPPLY_LIMIT)

      expect(await partnership.getPartnerPrice(testToken.address)).to.eq(TEST_PRICE)
      expect(await partnership.getCounter()).to.eq(1)
    })

    it('should assign the correct id', async () => {
      await partnership
        .connect(deployer)
        .addPartnership(testToken.address, TEST_PRICE, TEST_SUPPLY_LIMIT)
      expect(await partnership.getPartnerId(testToken.address)).to.eq(0)

      await partnership
        .connect(deployer)
        .addPartnership(testToken2.address, TEST_PRICE, TEST_SUPPLY_LIMIT)

      expect(await partnership.getPartnerId(testToken2.address)).to.eq(1)

      const testToken3 = await mockERC20Fixture('Test Token 3', 'TST3')
      await partnership
        .connect(deployer)
        .addPartnership(testToken3.address, TEST_PRICE, TEST_SUPPLY_LIMIT)

      expect(await partnership.getPartnerId(testToken3.address)).to.eq(2)
    })

    it('should mint the specified supply of IOUs to the contract for distribution', async () => {
      expect(await partnership.balanceOf(partnership.address, 0)).to.eq(0)

      await partnership
        .connect(deployer)
        .addPartnership(testToken.address, TEST_PRICE, TEST_SUPPLY_LIMIT)

      expect(await partnership.balanceOf(partnership.address, 0)).to.eq(TEST_SUPPLY_LIMIT)
    })
  })

  describe('# purchase', () => {
    beforeEach(async () => {
      await partnership
        .connect(deployer)
        .addPartnership(testToken.address, TEST_PRICE, TEST_SUPPLY_LIMIT)
    })

    it('should not allow unsupported partners', async () => {
      expect(await partnership.getPartnerId(testToken2.address)).to.eq(0)

      await expect(partnership.purchase(testToken2.address, 1)).revertedWith('unsupported partner')
    })

    it('should not allow purchase with insufficient approvals', async () => {
      expect(await testToken.allowance(user.address, partnership.address)).to.eq(0)

      await expect(partnership.connect(user).purchase(testToken.address, 1)).revertedWith(
        'ERC20: transfer amount exceeds allowance'
      )
    })

    it('should not allow purchase with insufficient funds', async () => {
      await partnership
        .connect(deployer)
        .addPartnership(testToken2.address, TEST_PRICE, TEST_SUPPLY_LIMIT)
      await testToken2.connect(user).approve(partnership.address, TEST_PRICE)
      expect(await testToken2.balanceOf(user.address)).to.eq(0)

      await expect(partnership.connect(user).purchase(testToken2.address, 1)).revertedWith(
        'ERC20: transfer amount exceeds balance'
      )
    })

    it('should transfer over the requested amount of IOUs for the correct price', async () => {
      expect(await partnership.balanceOf(partnership.address, 0)).to.eq(TEST_SUPPLY_LIMIT)
      expect(await partnership.balanceOf(user.address, 0)).to.eq(0)
      await testToken.connect(user).approve(partnership.address, TEST_PRICE.mul(5))
      const balanceBefore = await testToken.balanceOf(user.address)

      await partnership.connect(user).purchase(testToken.address, 5)

      expect(await partnership.balanceOf(user.address, 0)).to.eq(5)
      expect(await partnership.balanceOf(partnership.address, 0)).to.eq(TEST_SUPPLY_LIMIT.sub(5))
      expect(await testToken.balanceOf(user.address)).to.eq(balanceBefore.sub(TEST_PRICE.mul(5)))
    })

    it('should not allow purchases that exceed the supply (done incrementally)', async () => {
      expect(await partnership.balanceOf(partnership.address, 0)).to.eq(TEST_SUPPLY_LIMIT)
      expect(await partnership.balanceOf(user.address, 0)).to.eq(0)
      const firstBatch = TEST_SUPPLY_LIMIT.div(2)
      await testToken.connect(user).approve(partnership.address, TEST_PRICE.mul(firstBatch))
      await partnership.connect(user).purchase(testToken.address, firstBatch)
      expect(await partnership.balanceOf(partnership.address, 0)).to.eq(
        TEST_SUPPLY_LIMIT.sub(firstBatch)
      )
      expect(await partnership.balanceOf(user.address, 0)).to.eq(firstBatch)
      const secondBatch = TEST_SUPPLY_LIMIT.add(1).sub(firstBatch)
      await testToken.connect(user).approve(partnership.address, secondBatch)

      await expect(partnership.connect(user).purchase(testToken.address, secondBatch)).revertedWith(
        'exceeds supply'
      )

      expect(await partnership.balanceOf(partnership.address, 0)).to.eq(
        TEST_SUPPLY_LIMIT.sub(firstBatch)
      )
      expect(await partnership.balanceOf(user.address, 0)).to.eq(firstBatch)
    })

    it('should not allow purchases that exceed the supply (done all at once)', async () => {
      expect(await partnership.balanceOf(partnership.address, 0)).to.eq(TEST_SUPPLY_LIMIT)
      expect(await partnership.balanceOf(user.address, 0)).to.eq(0)
      await testToken
        .connect(user)
        .approve(partnership.address, TEST_PRICE.mul(TEST_SUPPLY_LIMIT.add(1)))

      await expect(
        partnership.connect(user).purchase(testToken.address, TEST_SUPPLY_LIMIT.add(1))
      ).revertedWith('exceeds supply')

      expect(await partnership.balanceOf(partnership.address, 0)).to.eq(TEST_SUPPLY_LIMIT)
      expect(await partnership.balanceOf(user.address, 0)).to.eq(0)
    })
  })
})
