import { expect } from 'chai'
import { ethers } from 'hardhat'
import { MockPregenPass } from '../types/generated'
import { mockPregenPassFixture } from './fixtures/PregenPassFixtures'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { revertReason } from './utils'

describe('PregenPass', async () => {
  let deployer: SignerWithAddress
  let owner: SignerWithAddress
  let user: SignerWithAddress
  let user2: SignerWithAddress
  let pregenPass: MockPregenPass
  const EMPTY_BYTES = ethers.utils.formatBytes32String('')
  const URI = 'https://newBaseURI/'
  const URI_2 = 'https://newBaseURI2/'

  const setupPregenPass = async (): Promise<void> => {
    ;[deployer, owner, user, user2] = await ethers.getSigners()
    pregenPass = await mockPregenPassFixture(owner.address, URI)
  }

  describe('constructor', async () => {
    before(async () => {
      await setupPregenPass()
    })

    it('sets URI from constructor', async () => {
      expect(await pregenPass.tokenURI(0)).to.eq(URI)
    })

    it('initializes name at deployment', async () => {
      expect(await pregenPass.name()).to.eq('Pregen Pass')
    })

    it('initializes symbol at deployment', async () => {
      expect(await pregenPass.symbol()).to.eq('PREGENPASS')
    })

    it('sets owner from constructor', async () => {
      expect(await pregenPass.owner()).to.eq(owner.address)
    })
  })

  describe('# setURI', async () => {
    beforeEach(async () => {
      await setupPregenPass()
    })

    it('reverts if not owner', async () => {
      expect(pregenPass.connect(user).setURI(URI_2)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('sets URI to non-empty string', async () => {
      expect(await pregenPass.tokenURI(0)).to.eq(URI)

      await pregenPass.connect(owner).setURI(URI_2)

      expect(await pregenPass.tokenURI(0)).to.eq(URI_2)
    })

    it('is idempotent', async () => {
      expect(await pregenPass.tokenURI(0)).to.eq(URI)

      await pregenPass.connect(owner).setURI(URI_2)

      expect(await pregenPass.tokenURI(0)).to.eq(URI_2)

      await pregenPass.connect(owner).setURI(URI_2)

      expect(await pregenPass.tokenURI(0)).to.eq(URI_2)
    })

    it('sets URI to empty string', async () => {
      expect(await pregenPass.tokenURI(0)).to.eq(URI)

      await pregenPass.connect(owner).setURI('')

      expect(await pregenPass.tokenURI(0)).to.eq('')
    })
  })

  describe('# mint', async () => {
    beforeEach(async () => {
      await setupPregenPass()
    })

    it('reverts if not owner', async () => {
      expect(pregenPass.connect(user).mint(user.address)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('increments user balance by 1', async () => {
      expect(await pregenPass.balanceOf(user.address)).to.eq(0)

      await pregenPass.connect(owner).mint(user.address)

      expect(await pregenPass.balanceOf(user.address)).to.eq(1)
    })

    it('sets tokenId owner', async () => {
      expect(await pregenPass.balanceOf(user.address)).to.eq(0)

      await pregenPass.connect(owner).mint(user.address)

      expect(await pregenPass.ownerOf(0)).to.eq(user.address)
    })
  })

  describe('# mintBatch', async () => {
    beforeEach(async () => {
      await setupPregenPass()
    })

    it('reverts if not owner', async () => {
      expect(pregenPass.connect(user).mintBatch([user.address, user2.address])).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('succeeds if empty batch', async () => {
      expect(await pregenPass.balanceOf(user.address)).to.eq(0)

      await pregenPass.connect(owner).mintBatch([])

      expect(await pregenPass.balanceOf(user.address)).to.eq(0)
    })

    it('succeeds if single item batch', async () => {
      expect(await pregenPass.balanceOf(user.address)).to.eq(0)

      await pregenPass.connect(owner).mintBatch([user.address])

      expect(await pregenPass.balanceOf(user.address)).to.eq(1)
    })

    it('increments user balances by 1', async () => {
      expect(await pregenPass.balanceOf(user.address)).to.eq(0)
      expect(await pregenPass.balanceOf(user2.address)).to.eq(0)

      await pregenPass.connect(owner).mintBatch([user.address, user2.address])

      expect(await pregenPass.balanceOf(user.address)).to.eq(1)
      expect(await pregenPass.balanceOf(user2.address)).to.eq(1)
    })

    it('sets tokenId owner', async () => {
      expect(await pregenPass.balanceOf(user.address)).to.eq(0)
      expect(await pregenPass.balanceOf(user2.address)).to.eq(0)

      await pregenPass.connect(owner).mintBatch([user.address, user2.address])

      expect(await pregenPass.ownerOf(0)).to.eq(user.address)
      expect(await pregenPass.ownerOf(1)).to.eq(user2.address)
    })
  })

  describe('# burn', async () => {
    beforeEach(async () => {
      await setupPregenPass()
    })

    it('reverts if not owner', async () => {
      expect(pregenPass.connect(user).mint(user.address)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('reverts if nonexistent token', async () => {
      expect(pregenPass.connect(owner).burn(1)).revertedWith(
        revertReason('ERC721: owner query for nonexistent token')
      )
    })

    it('decrements user balance by 1', async () => {
      await pregenPass.connect(owner).mint(user.address)
      expect(await pregenPass.balanceOf(user.address)).to.eq(1)

      await pregenPass.connect(owner).burn(0)

      expect(await pregenPass.balanceOf(user.address)).to.eq(0)
    })

    it('deletes tokenId owner', async () => {
      await pregenPass.connect(owner).mint(user.address)
      expect(await pregenPass.ownerOf(0)).to.eq(user.address)

      await pregenPass.connect(owner).burn(0)

      expect(pregenPass.connect(owner).ownerOf(0)).revertedWith(
        revertReason('ERC721: owner query for nonexistent token')
      )
    })
  })

  describe('# burnBatch', async () => {
    beforeEach(async () => {
      await setupPregenPass()
    })

    it('reverts if not owner', async () => {
      await pregenPass.connect(owner).mint(user.address)
      await pregenPass.connect(owner).mint(user2.address)

      expect(pregenPass.connect(user).burnBatch([0, 1])).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('reverts if non existent token', async () => {
      expect(pregenPass.connect(owner).burnBatch([1, 2])).revertedWith(
        revertReason('ERC721: owner query for nonexistent token')
      )
    })

    it('succeeds if single item batch', async () => {
      await pregenPass.connect(owner).mint(user.address)
      expect(await pregenPass.balanceOf(user.address)).to.eq(1)

      await pregenPass.connect(owner).burnBatch([0])

      expect(await pregenPass.balanceOf(user.address)).to.eq(0)
    })

    it('decrements user balances by 1', async () => {
      await pregenPass.connect(owner).mint(user.address)
      await pregenPass.connect(owner).mint(user2.address)
      expect(await pregenPass.balanceOf(user.address)).to.eq(1)
      expect(await pregenPass.balanceOf(user2.address)).to.eq(1)

      await pregenPass.connect(owner).burnBatch([0, 1])

      expect(await pregenPass.balanceOf(user.address)).to.eq(0)
      expect(await pregenPass.balanceOf(user2.address)).to.eq(0)
    })

    it('deletes tokenId owner', async () => {
      await pregenPass.connect(owner).mint(user.address)
      await pregenPass.connect(owner).mint(user2.address)
      expect(await pregenPass.ownerOf(0)).to.eq(user.address)
      expect(await pregenPass.ownerOf(1)).to.eq(user2.address)

      await pregenPass.connect(owner).burnBatch([0, 1])

      expect(pregenPass.connect(owner).ownerOf(0)).revertedWith(
        revertReason('ERC721: owner query for nonexistent token')
      )
      expect(pregenPass.connect(owner).ownerOf(1)).revertedWith(
        revertReason('ERC721: owner query for nonexistent token')
      )
    })
  })

  describe('# _beforeTokenTransfer', async () => {
    beforeEach(async () => {
      await setupPregenPass()
    })

    it('reverts if not owner', async () => {
      expect(
        pregenPass.connect(user).beforeTokenTransfer(user.address, user2.address, 0)
      ).revertedWith(revertReason('Ownable: caller is not the owner'))
    })

    it('reverts token transfer if not owner', async () => {
      expect(await pregenPass.balanceOf(user.address)).to.eq(0)
      await pregenPass.connect(owner).mint(user.address)
      expect(await pregenPass.balanceOf(user.address)).to.eq(1)
      expect(await pregenPass.owner()).to.not.eq(user.address)

      expect(pregenPass.connect(user).transferFrom(user.address, user2.address, 0)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('succeeds if owner', async () => {
      await pregenPass.connect(owner).mint(owner.address)

      await expect(pregenPass.connect(owner).beforeTokenTransfer(owner.address, user2.address, 0))
        .not.reverted
    })

    it('transfers token if owner', async () => {
      expect(await pregenPass.balanceOf(owner.address)).to.eq(0)
      await pregenPass.connect(owner).mint(owner.address)
      expect(await pregenPass.balanceOf(owner.address)).to.eq(1)
      expect(await pregenPass.balanceOf(user.address)).to.eq(0)
      expect(await pregenPass.owner()).to.not.eq(user.address)

      await pregenPass.connect(owner).transferFrom(owner.address, user.address, 0)

      expect(await pregenPass.balanceOf(owner.address)).to.eq(0)
      expect(await pregenPass.balanceOf(user.address)).to.eq(1)
    })
  })
})