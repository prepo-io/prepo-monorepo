import { expect } from 'chai'
import { ethers } from 'hardhat'
import { parseEther } from '@ethersproject/units'
import { PPO } from '../types/generated'
import { ppoDeployFixture } from './fixtures/PPOFixture'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'

describe('PPO', async () => {
  let deployer: SignerWithAddress
  let ppo: PPO

  beforeEach(async () => {
    ;[deployer] = await ethers.getSigners()
    ppo = await ppoDeployFixture()
  })

  describe('Initialize', async () => {
    it('should initialize the values at PPO contract deployment', async () => {
      expect(await ppo.name()).to.eq('prePO Token')
      expect(await ppo.symbol()).to.eq('PPO')
      expect(await ppo.totalSupply()).to.eq(parseEther('1000000000'))
      expect(await ppo.owner()).to.eq(deployer.address)
    })
  })
})
