import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { CollabLandExtender721 } from '../../typechain/CollabLandExtender721'
import { CollabLandExtender1155 } from '../../typechain/CollabLandExtender1155'

chai.use(solidity)

export async function collabLandExtender721Fixture(): Promise<CollabLandExtender721> {
  const contract = await ethers.getContractFactory('CollabLandExtender721')
  return (await contract.deploy()) as CollabLandExtender721
}

export async function collabLandExtender1155Fixture(): Promise<CollabLandExtender1155> {
  const contract = await ethers.getContractFactory('CollabLandExtender1155')
  return (await contract.deploy()) as CollabLandExtender1155
}
