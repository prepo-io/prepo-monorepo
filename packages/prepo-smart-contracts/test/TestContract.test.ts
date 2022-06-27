import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'

describe('TestContract', () => {
  let deployer: SignerWithAddress

  beforeEach(async () => {
    ;[deployer] = await ethers.getSigners()
  })

  describe('Initialize', () => {
    it('should do a test', () => {
      expect('test').to.eq('test')
    })
  })
})
