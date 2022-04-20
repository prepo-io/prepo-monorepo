import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { MerkleProofVerifier } from '../../typechain/MerkleProofVerifier'

chai.use(solidity)

export async function merkleProofVerifierFixture(root: string): Promise<MerkleProofVerifier> {
  const merkleProofVerifier = await ethers.getContractFactory('MerkleProofVerifier')
  return (await merkleProofVerifier.deploy(root)) as MerkleProofVerifier
}
