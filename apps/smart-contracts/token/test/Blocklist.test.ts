import { expect } from 'chai'
import { blocklistFixture } from './fixtures/BlocklistFixtures'
import { Blocklist } from '../types/generated'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'

describe('=> Blocklist', () => {
  let deployer: SignerWithAddress
  let owner: SignerWithAddress
  let user1: SignerWithAddress
  let blocklist: Blocklist

  const deployBlocklist = async (): Promise<void> => {
    ;[deployer, owner, user1] = await ethers.getSigners()
    blocklist = await blocklistFixture(owner.address)
  }

  const setupBlocklist = async (): Promise<void> => {
    await deployBlocklist()
    await blocklist.connect(owner).acceptOwnership()
  }

  describe('initial state', () => {
    beforeEach(async () => {
      await deployBlocklist()
    })

    it('sets nominee from initialize', async () => {
      expect(await blocklist.getNominee()).to.not.eq(deployer.address)
      expect(await blocklist.getNominee()).to.eq(owner.address)
    })

    it('sets owner to deployer', async () => {
      expect(await blocklist.owner()).to.eq(deployer.address)
    })

    it('sets blocked accounts index to zero', async () => {
      expect(await blocklist.getBlockedAllountsIndex()).to.eq(0)
    })
  })
})
