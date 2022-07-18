import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { ZERO_ADDRESS, JUNK_ADDRESS } from 'prepo-constants'
import { accountListFixture } from './fixtures/AccountListFixtures'
import { AccountList } from '../types/generated'

describe('=> AccountList', () => {
  let deployer: SignerWithAddress
  let owner: SignerWithAddress
  let user1: SignerWithAddress
  let user2: SignerWithAddress
  let accountList: AccountList

  const deployAccountList = async (): Promise<void> => {
    ;[deployer, owner, user1, user2] = await ethers.getSigners()
    accountList = await accountListFixture(owner.address)
  }

  const setupAccountList = async (): Promise<void> => {
    await deployAccountList()
    await accountList.connect(owner).acceptOwnership()
  }

  describe('initial state', () => {
    beforeEach(async () => {
      await deployAccountList()
    })

    it('sets nominee from initialize', async () => {
      expect(await accountList.getNominee()).to.not.eq(deployer.address)
      expect(await accountList.getNominee()).to.eq(owner.address)
    })

    it('sets owner to deployer', async () => {
      expect(await accountList.owner()).to.eq(deployer.address)
    })
  })
})
