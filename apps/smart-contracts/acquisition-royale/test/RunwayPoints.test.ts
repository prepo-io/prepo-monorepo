import chai, { expect } from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { runwayPointsFixture } from './fixtures/RunwayPointsFixture'
import { RunwayPoints } from '../typechain/RunwayPoints'

chai.use(solidity)

describe('=> RunwayPoints', () => {
  let runwayPoints: RunwayPoints
  let deployer: SignerWithAddress
  let royale: SignerWithAddress
  let user: SignerWithAddress
  let user2: SignerWithAddress

  beforeEach(async () => {
    ;[deployer, royale, user, user2] = await ethers.getSigners()
    runwayPoints = await runwayPointsFixture(royale.address)
  })

  describe('# initialize', () => {
    it('should be initialized with correct values', async () => {
      expect(await runwayPoints.name()).to.eq('Runway Points (prePO Acquisition Royale)')
      expect(await runwayPoints.symbol()).to.eq('RP')
    })

    it('should mint 1 million tokens for deployer', async () => {
      expect(await runwayPoints.balanceOf(deployer.address)).to.eq(
        ethers.utils.parseEther('1000000')
      )
    })

    it('owner should be set to Acquisition Royale', async () => {
      expect(await runwayPoints.owner()).to.eq(royale.address)
    })
  })

  describe('# mint', () => {
    it('should only usable by the owner', async () => {
      await expect(runwayPoints.connect(user).mint(user.address, 1)).to.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should allow owner to mint tokens for another user', async () => {
      await runwayPoints.connect(royale).mint(user.address, 1)
      expect(await runwayPoints.balanceOf(user.address)).to.eq(1)
    })

    it('should allow owner to mint tokens for themselves', async () => {
      await runwayPoints.connect(royale).mint(royale.address, 1)
      expect(await runwayPoints.balanceOf(royale.address)).to.eq(1)
    })
  })

  describe('# transferFrom', () => {
    it('should allow owner to transfer tokens between users without approval', async () => {
      await runwayPoints.connect(deployer).transfer(user.address, 1)
      await runwayPoints.connect(royale).transferFrom(user.address, user2.address, 1)

      expect(await runwayPoints.balanceOf(user2.address)).to.eq(1)
    })

    it('should not allow a user to transfer tokens without approval', async () => {
      await runwayPoints.connect(deployer).transfer(user.address, 1)

      await expect(
        runwayPoints.connect(user2).transferFrom(user.address, user2.address, 1)
      ).revertedWith('ERC20: transfer amount exceeds allowance')
    })

    it('should allow a user to transfer tokens with approval ', async () => {
      await runwayPoints.connect(deployer).transfer(user.address, 1)
      await runwayPoints.connect(user).approve(user2.address, 1)

      await runwayPoints.connect(user2).transferFrom(user.address, user2.address, 1)

      expect(await runwayPoints.balanceOf(user2.address)).to.eq(1)
    })
  })

  describe('# burnFrom', () => {
    it('should only usable by the owner', async () => {
      await runwayPoints.connect(deployer).transfer(user.address, 1)

      await expect(runwayPoints.connect(user2).burnFrom(user.address, 1)).to.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should allow owner to transfer tokens between users without approval', async () => {
      await runwayPoints.connect(deployer).transfer(user.address, 1)
      await runwayPoints.connect(royale).burnFrom(user.address, 1)

      expect(await runwayPoints.balanceOf(user.address)).to.eq(0)
    })
  })
})
