import { makeAutoObservable } from 'mobx'
import { MerkleTree } from 'merkletreejs'
import { ethers } from 'ethers'
import keccak256 from 'keccak256'
import { RootStore } from '../../stores/RootStore'
import { isBrowser, SupportedNetworks } from '../../lib/constants'
import config from '../../lib/config'
import { handleError } from '../../utils/exception-handling'

export function hashAddress(address: string): Buffer {
  return Buffer.from(ethers.utils.solidityKeccak256(['address'], [address]).slice(2), 'hex')
}

// Get from local store, or fetch from remote
async function getMerkleLeaves(network: SupportedNetworks): Promise<string[]> {
  const key = `merkleDropLeaves:${network}`
  const storeVal = window.localStorage.getItem(key)
  if (storeVal) return JSON.parse(storeVal)

  const remoteVal = await fetch(`/merkle-drop/${network}/leaves`).then((r) => r.json())
  window.localStorage.setItem(key, JSON.stringify(remoteVal))
  return remoteVal
}

export class MerkleDropStore {
  root: RootStore
  merkleTree: MerkleTree | undefined = undefined

  constructor(root: RootStore) {
    this.root = root
    makeAutoObservable(this)
  }

  async initMerkleTree(): Promise<void> {
    if (!isBrowser) return
    // Fetch data async because it's too large to include in bundle
    const [merkleLeaves, expectedMerkleRoot] = await Promise.all([
      getMerkleLeaves(config.NETWORK),
      fetch(`/merkle-drop/${config.NETWORK}/root`).then((r) => r.text()),
    ])

    // Build the tree
    this.merkleTree = new MerkleTree(merkleLeaves, keccak256, { sortPairs: true })

    // Check tree validity
    if (this.merkleTree.getHexRoot() !== expectedMerkleRoot) {
      handleError('Merkle tree error', new Error('Merkle root mismatch'))
    }
  }

  get signerIsVip(): boolean | undefined {
    const { address } = this.root.web3Store.signerState
    if (address === undefined) return undefined
    const proof = this.getProof(address)
    if (proof === undefined) return undefined
    return Array.isArray(proof)
  }

  // Returns proof array, or false if address ineligible
  getProof(address: string): string[] | false {
    if (this.merkleTree === undefined) {
      handleError(
        'Merkle tree error',
        new Error('getProof cannot be called before merkleTree initialized')
      )
      return false
    }

    const proof = this.merkleTree.getHexProof(hashAddress(address))
    if (proof.length === 0) return false
    return proof
  }
}
