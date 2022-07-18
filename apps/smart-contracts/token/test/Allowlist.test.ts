import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { allowlistFixture } from './fixtures/AllowlistFixtures'
import { Allowlist } from '../types/generated'

describe('=> Allowlist', () => {
  let deployer: SignerWithAddress
  let owner: SignerWithAddress
  let user1: SignerWithAddress
  let allowlist: Allowlist

  const deployAllowlist = async (): Promise<void> => {
    ;[deployer, owner, user1] = await ethers.getSigners()
    allowlist = await allowlistFixture(owner.address)
  }

  const setupAllowlist = async (): Promise<void> => {
    await deployAllowlist()
    await allowlist.connect(owner).acceptOwnership()
  }

  describe('initial state', () => {
    beforeEach(async () => {
      await deployAllowlist()
    })

    it('sets nominee from initialize', async () => {
      expect(await allowlist.getNominee()).to.not.eq(deployer.address)
      expect(await allowlist.getNominee()).to.eq(owner.address)
    })

    it('sets owner to deployer', async () => {
      expect(await allowlist.owner()).to.eq(deployer.address)
    })
  })
})
