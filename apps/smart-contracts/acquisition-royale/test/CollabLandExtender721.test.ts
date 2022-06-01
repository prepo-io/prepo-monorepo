/* eslint-disable no-await-in-loop */
import { ethers } from 'hardhat'
import chai, { expect } from 'chai'
import { solidity } from 'ethereum-waffle'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { mockERC721Fixture } from './fixtures/MockERC721Fixture'
import { collabLandExtender721Fixture } from './fixtures/CollabLandExtenderFixture'
import { countOccurrences } from './utils'
import { MockERC721 } from '../typechain/MockERC721'
import { CollabLandExtender721 } from '../typechain/CollabLandExtender721'

chai.use(solidity)

describe('=> CollabLandExtender721', () => {
  let deployer: SignerWithAddress
  let user: SignerWithAddress
  let user2: SignerWithAddress
  let mockNFT1: MockERC721
  let mockNFT2: MockERC721
  let collabLandExtender721: CollabLandExtender721

  beforeEach(async () => {
    ;[deployer, user, user2] = await ethers.getSigners()
    mockNFT1 = await mockERC721Fixture('Mock NFT 1', 'MCK1')
    mockNFT2 = await mockERC721Fixture('Mock NFT 2', 'MCK2')
    collabLandExtender721 = await collabLandExtender721Fixture()
  })

  describe('# addProjects', () => {
    it('should add a project to the eligibility set (single)', async () => {
      const set = [mockNFT1.address, mockNFT2.address]
      const projectsBefore = await collabLandExtender721.getProjects()
      set.forEach((item) => {
        expect(projectsBefore.includes(item)).to.eq(false)
      })

      await collabLandExtender721.addProjects([set[0]])

      const projectsAfter = await collabLandExtender721.getProjects()
      expect(projectsAfter.includes(set[0])).to.eq(true)
      expect(projectsAfter.includes(set[1])).to.eq(false)
    })

    it('should add a project to the eligibility set (multiple)', async () => {
      const set = [mockNFT1.address, mockNFT2.address]
      const projectsBefore = await collabLandExtender721.getProjects()
      set.forEach((item) => {
        expect(projectsBefore.includes(item)).to.eq(false)
      })

      await collabLandExtender721.addProjects(set)

      const projectsAfter = await collabLandExtender721.getProjects()
      set.forEach((item) => {
        expect(projectsAfter.includes(item)).to.eq(true)
      })
    })

    it("should not duplicate a project if it's already in the set", async () => {
      const set = [mockNFT1.address, mockNFT2.address]
      await collabLandExtender721.addProjects(set)
      const projectsBefore = await collabLandExtender721.getProjects()
      expect(countOccurrences(projectsBefore, mockNFT1.address)).to.eq(1)
      expect(countOccurrences(projectsBefore, mockNFT2.address)).to.eq(1)

      await collabLandExtender721.addProjects(set)

      const projectsAfter = await collabLandExtender721.getProjects()
      expect(countOccurrences(projectsAfter, mockNFT1.address)).to.eq(1)
      expect(countOccurrences(projectsAfter, mockNFT2.address)).to.eq(1)
    })
  })

  describe('# removeProjects', () => {
    it('should remove a project if it is part of the eligibility set (single)', async () => {
      const set = [mockNFT1.address, mockNFT2.address]
      await collabLandExtender721.addProjects(set)
      const projectsBefore = await collabLandExtender721.getProjects()
      set.forEach((item) => {
        expect(projectsBefore.includes(item)).to.eq(true)
      })

      await collabLandExtender721.removeProjects([set[0]])

      const projectsAfter = await collabLandExtender721.getProjects()
      expect(projectsAfter.includes(set[0])).to.eq(false)
      expect(projectsAfter.includes(set[1])).to.eq(true)
    })

    it('should remove a project if it is part of the eligibility set (multiple)', async () => {
      const set = [mockNFT1.address, mockNFT2.address]
      await collabLandExtender721.addProjects(set)
      const projectsBefore = await collabLandExtender721.getProjects()
      set.forEach((item) => {
        expect(projectsBefore.includes(item)).to.eq(true)
      })

      await collabLandExtender721.removeProjects(set)

      const projectsAfter = await collabLandExtender721.getProjects()
      set.forEach((item) => {
        expect(projectsAfter.includes(item)).to.eq(false)
      })
    })

    it('should do nothing if project is not part of the set', async () => {
      const set = [mockNFT1.address, mockNFT2.address]
      const projectsBefore = await collabLandExtender721.getProjects()
      set.forEach((item) => {
        expect(projectsBefore.includes(item)).to.eq(false)
      })

      await collabLandExtender721.removeProjects(set)

      const projectsAfter = await collabLandExtender721.getProjects()
      set.forEach((item) => {
        expect(projectsAfter.includes(item)).to.eq(false)
      })
    })
  })

  describe('# balanceOf', () => {
    it('should return the number of projects a user owns', async () => {
      await collabLandExtender721.addProjects([mockNFT1.address, mockNFT2.address])
      for (let i = 0; i < 5; i++) {
        await mockNFT1.mint(user.address, i)
        await mockNFT2.mint(user.address, i)
      }

      expect(await collabLandExtender721.balanceOf(user.address)).to.eq(2)
    })
  })
})
