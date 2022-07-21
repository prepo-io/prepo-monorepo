import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { ZERO_ADDRESS, JUNK_ADDRESS } from 'prepo-constants'
import { tokenWrapperFixture } from './fixtures/TokenWrapperFixture'
import { TokenWrapper } from '../types/generated'

describe('Token', () => {
  let deployer: SignerWithAddress
  let owner: SignerWithAddress
  let user1: SignerWithAddress
  let user2: SignerWithAddress
  let token: TokenWrapper

  const setupToken = async (): Promise<void> => {
    ;[deployer, user1, user2] = await ethers.getSigners()
    owner = deployer
    token = await tokenWrapperFixture()
  }

  describe('initial state', () => {
    beforeEach(async () => {
      await setupToken()
    })

    it('sets owner to deployer', async () => {
      expect(await token.owner()).to.eq(deployer.address)
    })

    it('sets nominee to zero address', async () => {
      expect(await token.getNominee()).to.eq(ZERO_ADDRESS)
    })
  })

  describe('# setToken', () => {
    beforeEach(async () => {
      await setupToken()
    })

    it('reverts if not owner', async () => {
      expect(await token.owner()).to.not.eq(user1.address)

      await expect(token.connect(user1).setToken(JUNK_ADDRESS)).revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('sets to non-zero address', async () => {
      expect(await token.getToken()).to.not.eq(JUNK_ADDRESS)

      await token.connect(owner).setToken(JUNK_ADDRESS)

      expect(await token.getToken()).to.eq(JUNK_ADDRESS)
      expect(await token.getToken()).to.not.eq(ZERO_ADDRESS)
    })

    it('sets to zero address', async () => {
      await token.connect(owner).setToken(JUNK_ADDRESS)
      expect(await token.getToken()).to.not.eq(ZERO_ADDRESS)

      await token.connect(owner).setToken(ZERO_ADDRESS)

      expect(await token.getToken()).to.eq(ZERO_ADDRESS)
    })

    it('is idempotent', async () => {
      expect(await token.getToken()).to.not.eq(JUNK_ADDRESS)

      await token.connect(owner).setToken(JUNK_ADDRESS)

      expect(await token.getToken()).to.eq(JUNK_ADDRESS)

      await token.connect(owner).setToken(JUNK_ADDRESS)

      expect(await token.getToken()).to.eq(JUNK_ADDRESS)
    })
  })

  describe('# testTokenModifier', async () => {
    let genericToken: SignerWithAddress
    beforeEach(async () => {
      await setupToken()
      genericToken = user1
      await token.connect(owner).setToken(genericToken.address)
    })

    it('reverts if not token', async () => {
      expect(await token.getToken()).to.not.eq(user2.address)

      await expect(token.connect(user2).testTokenModifier()).revertedWith('msg.sender != token')
    })

    it('succeeds if token', async () => {
      expect(await token.getToken()).to.eq(genericToken.address)

      await expect(token.connect(genericToken).testTokenModifier()).to.not.reverted
    })
  })
})
