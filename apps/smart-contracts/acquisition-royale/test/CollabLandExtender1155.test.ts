import { ethers } from 'hardhat'
import chai, { expect } from 'chai'
import { solidity } from 'ethereum-waffle'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { mockERC1155Fixture } from './fixtures/MockERC1155Fixture'
import { collabLandExtender1155Fixture } from './fixtures/CollabLandExtenderFixture'
import { countOccurrences } from './utils'
import { MockERC1155 } from '../typechain/MockERC1155'
import { CollabLandExtender1155 } from '../typechain/CollabLandExtender1155'

chai.use(solidity)

describe('=> CollabLandExtender1155', () => {
  let deployer: SignerWithAddress
  let user: SignerWithAddress
  let user2: SignerWithAddress
  let mockNFT1: MockERC1155
  let mockNFT2: MockERC1155
  let collabLandExtender1155: CollabLandExtender1155

  beforeEach(async () => {
    ;[deployer, user, user2] = await ethers.getSigners()
    mockNFT1 = await mockERC1155Fixture('')
    mockNFT2 = await mockERC1155Fixture('')
    collabLandExtender1155 = await collabLandExtender1155Fixture()
  })

  describe('# addProjectsAndIds', () => {
    it('should revert if project array and tokenId array are different sizes', async () => {
      const projectSetLength3 = [mockNFT1.address, mockNFT2.address, mockNFT1.address]
      const idSetLength4 = [0, 1, 2, 3]
      await expect(
        collabLandExtender1155.addProjectsAndIds(projectSetLength3, idSetLength4)
      ).revertedWith('array lengths must match')
    })

    it('should add a ERC1155 address and token id to the eligibility set', async () => {
      const projectSet = [mockNFT1.address, mockNFT2.address, mockNFT1.address, mockNFT2.address]
      const idSet = [0, 1, 2, 3]
      const projectsBefore = await collabLandExtender1155.getProjects()
      projectSet.forEach(async (item, index) => {
        expect(projectsBefore.includes(item)).to.eq(false)
        const idsBefore = (await collabLandExtender1155.getIdsForProject(item)).map((id) =>
          id.toNumber()
        )
        expect(idsBefore.includes(idSet[index])).to.eq(false)
      })

      await collabLandExtender1155.addProjectsAndIds(projectSet, idSet)

      const projectsAfter = await collabLandExtender1155.getProjects()
      projectSet.forEach(async (item, index) => {
        expect(projectsAfter.includes(item)).to.eq(true)
        const idsAfter = (await collabLandExtender1155.getIdsForProject(item)).map((id) =>
          id.toNumber()
        )
        expect(idsAfter.includes(idSet[index])).to.eq(true)
      })
    })

    it("should not duplicate ERC1155 entry if it's already in the set", async () => {
      const projectSet = [mockNFT1.address, mockNFT2.address, mockNFT1.address, mockNFT2.address]
      const idSet = [0, 1, 2, 3]

      await collabLandExtender1155.addProjectsAndIds(projectSet, idSet)

      const projects = await collabLandExtender1155.getProjects()
      expect(countOccurrences(projects, mockNFT1.address)).to.eq(1)
      expect(countOccurrences(projects, mockNFT2.address)).to.eq(1)
    })

    it("should not duplicate id entry if it's already part of the ERC1155's eligible ids", async () => {
      const projectSet = [mockNFT1.address, mockNFT2.address, mockNFT1.address, mockNFT2.address]
      const idSet = [1, 1, 1, 1]

      await collabLandExtender1155.addProjectsAndIds(projectSet, idSet)

      const projects = await collabLandExtender1155.getProjects()
      projects.forEach(async (project: string) => {
        const idsForProject = (await collabLandExtender1155.getIdsForProject(project)).map((id) =>
          id.toNumber()
        )
        expect(countOccurrences(idsForProject, 1)).to.eq(1)
      })
    })
  })

  describe('# removeProjectsAndIds', () => {
    it('should revert if project array and tokenId array are different sizes', async () => {
      const projectSetLength3 = [mockNFT1.address, mockNFT2.address, mockNFT1.address]
      const idSetLength4 = [0, 1, 2, 3]
      await expect(
        collabLandExtender1155.removeProjectsAndIds(projectSetLength3, idSetLength4)
      ).revertedWith('array lengths must match')
    })

    it("should remove a token id from a ERC1155's eligibility set", async () => {
      const projectSet = [mockNFT1.address, mockNFT2.address, mockNFT1.address, mockNFT2.address]
      const idSet = [0, 0, 1, 1]
      await collabLandExtender1155.addProjectsAndIds(projectSet, idSet)
      const projectsBefore = await collabLandExtender1155.getProjects()
      projectsBefore.forEach(async (project: string) => {
        const idsForProject = (await collabLandExtender1155.getIdsForProject(project)).map((id) =>
          id.toNumber()
        )
        expect(idsForProject.includes(0)).to.eq(true)
      })

      await collabLandExtender1155.removeProjectsAndIds(
        [mockNFT1.address, mockNFT2.address],
        [0, 0]
      )

      const projectsAfter = await collabLandExtender1155.getProjects()
      projectsAfter.forEach(async (project: string) => {
        const idsForProject = (await collabLandExtender1155.getIdsForProject(project)).map((id) =>
          id.toNumber()
        )
        expect(idsForProject.includes(0)).to.eq(false)
      })
    })

    it('should not remove ERC1155 project if there is at least one id in its eligibility set', async () => {
      const projectSet = [mockNFT1.address, mockNFT2.address, mockNFT1.address, mockNFT2.address]
      const idSet = [0, 0, 1, 1]
      await collabLandExtender1155.addProjectsAndIds(projectSet, idSet)
      const projectsBefore = await collabLandExtender1155.getProjects()
      expect(projectsBefore.includes(mockNFT1.address)).to.eq(true)
      expect(projectsBefore.includes(mockNFT2.address)).to.eq(true)

      await collabLandExtender1155.removeProjectsAndIds(
        [mockNFT1.address, mockNFT2.address],
        [0, 0]
      )

      const projectsAfter = await collabLandExtender1155.getProjects()
      expect(projectsAfter.includes(mockNFT1.address)).to.eq(true)
      expect(projectsAfter.includes(mockNFT2.address)).to.eq(true)
    })

    it('should remove ERC1155 project if all ids in its eligiblity set are removed', async () => {
      const projectSet = [mockNFT1.address, mockNFT2.address, mockNFT1.address, mockNFT2.address]
      const idSet = [0, 0, 1, 1]
      await collabLandExtender1155.addProjectsAndIds(projectSet, idSet)
      const projectsBefore = await collabLandExtender1155.getProjects()
      expect(projectsBefore.includes(mockNFT1.address)).to.eq(true)
      expect(projectsBefore.includes(mockNFT2.address)).to.eq(true)

      await collabLandExtender1155.removeProjectsAndIds(
        [mockNFT1.address, mockNFT1.address],
        [0, 1]
      )

      const projectsAfter = await collabLandExtender1155.getProjects()
      expect(projectsAfter.includes(mockNFT1.address)).to.eq(false)
      expect(projectsAfter.includes(mockNFT2.address)).to.eq(true)
    })

    it('should do nothing if project is not part of the set', async () => {
      const projectSet = [mockNFT1.address, mockNFT1.address]
      const idSet = [0, 1]
      await collabLandExtender1155.addProjectsAndIds(projectSet, idSet)
      const projectsBefore = await collabLandExtender1155.getProjects()
      expect(projectsBefore.includes(mockNFT2.address)).to.eq(false)

      await collabLandExtender1155.removeProjectsAndIds([mockNFT2.address, mockNFT2.address], idSet)

      const projectsAfter = await collabLandExtender1155.getProjects()
      expect(projectsAfter.includes(mockNFT2.address)).to.eq(false)
    })

    it("should do nothing if id is not part of the ERC1155's id set", async () => {
      const projectSet = [mockNFT1.address, mockNFT1.address]
      const idSet = [0, 1]
      await collabLandExtender1155.addProjectsAndIds(projectSet, idSet)
      const idsBefore = (await collabLandExtender1155.getIdsForProject(mockNFT1.address)).map(
        (id) => id.toNumber()
      )
      expect(idsBefore.includes(2)).to.eq(false)

      await collabLandExtender1155.removeProjectsAndIds([mockNFT1.address], [2])

      const idsAfter = (await collabLandExtender1155.getIdsForProject(mockNFT1.address)).map((id) =>
        id.toNumber()
      )
      expect(idsAfter.includes(2)).to.eq(false)
    })
  })

  describe('# balanceOf', () => {
    it('should return the number of projects a user owns a part of', async () => {
      const projectSet = [mockNFT1.address, mockNFT2.address, mockNFT1.address, mockNFT2.address]
      const idSet = [0, 0, 1, 1]
      await collabLandExtender1155.addProjectsAndIds(projectSet, idSet)
      await mockNFT1.mint(user.address, 0, 5)
      await mockNFT1.mint(user.address, 1, 5)
      await mockNFT2.mint(user.address, 0, 5)
      await mockNFT2.mint(user.address, 1, 5)

      expect(await collabLandExtender1155.balanceOf(user.address)).to.eq(4)
    })
  })
})
