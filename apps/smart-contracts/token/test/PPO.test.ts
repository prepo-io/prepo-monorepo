import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { ZERO_ADDRESS } from 'prepo-constants'
import { ppoFixture } from './fixtures/PPOFixtures'
import { PPO } from '../types/generated'

describe('=> PPO', () => {
  let deployer: SignerWithAddress
  let owner: SignerWithAddress
  let user1: SignerWithAddress
  let ppo: PPO

  const setupSafeOwnableUpgradeable = async (): Promise<void> => {
    ;[deployer, owner, user1] = await ethers.getSigners()
    owner = deployer
    ppo = await ppoFixture(owner.address)
  }

  describe('initial state', () => {
    beforeEach(async () => {
      await setupSafeOwnableUpgradeable()
    })

    it('sets nominee from initialize', async () => {
      expect(await ppo.getNominee()).to.not.eq(deployer.address)
      expect(await ppo.getNominee()).to.eq(owner.address)
    })

    it('sets owner to deployer', async () => {
      expect(await ppo.owner()).to.eq(deployer.address)
    })

    // it('sets transfer hook as zero address', async () => {
    //   expect(await ppo.getTransferHook().to.eq(ZERO_ADDRESS))
    // })
  })
})
