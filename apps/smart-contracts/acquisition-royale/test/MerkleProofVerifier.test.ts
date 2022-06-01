/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { expect } from 'chai'
import { MerkleTree } from 'merkletreejs'
import { merkleProofVerifierFixture } from './fixtures/MerkleProofVerifierFixture'
import { hashAddress, generateMerkleTree } from './utils'
import { MerkleProofVerifier } from '../typechain/MerkleProofVerifier'

describe('=> MerkleProofVerifier', function () {
  let merkleTree: MerkleTree
  let merkleProofVerifier: MerkleProofVerifier
  const eligibleAddresses = [
    '0xE8D51A6E02c16f975Ad1C698E5aD0717E50D4bA3',
    '0x6cc8dCbCA746a6E4Fdefb98E1d0DF903b107fd21',
    '0x65B9A76C9691fE717E3c2cf9400082cb13b55893',
  ]
  const ineligibleAddresses = [
    '0x67663F0c6995412E1aB67e6E860F986013e0f4F8',
    '0x7b7A7bB315464585c04726182eEAdf7FeCaCF96F',
    '0xD6e94e98d2515b466E42CFe73Ff9bC0cBb4C4a63',
  ]
  beforeEach(async () => {
    merkleTree = generateMerkleTree(eligibleAddresses)
    merkleProofVerifier = await merkleProofVerifierFixture(merkleTree.getHexRoot())
  })

  describe('# initialize', () => {
    it('should be initialized with correct values', async () => {
      expect(await merkleProofVerifier.root()).to.eq(merkleTree.getHexRoot())
    })
  })

  describe('# verify', () => {
    it('should return true for eligible addresses', async () => {
      for (const address of eligibleAddresses) {
        const proof = merkleTree.getHexProof(hashAddress(address))

        expect(await merkleProofVerifier.verify(address, proof)).to.eq(true)
      }
    })

    it('should return false for ineligible addresses', async () => {
      for (const address of ineligibleAddresses) {
        const proof = merkleTree.getHexProof(hashAddress(address))

        expect(await merkleProofVerifier.verify(address, proof)).to.eq(false)
      }
    })
  })
})
