import { UiStore } from './UiStore'
import { Web3Store } from './Web3Store'
import { MulticallStore } from './MulticallStore'
import { LocalStorageStore } from './LocalStorageStore'
import { AcquisitionRoyaleContractStore } from './AcquisitionRoyaleContractStore'
import { SectionStore } from '../features/landing-page/sections/SectionStore'
import { MerkleDropStore } from '../features/founding-component/MerkleDropStore'
import { Erc20Entity } from '../entities/Erc20.entity'
import { PartnershipStore } from '../features/partnership-purchase/stores/PartnershipStore'
import { AcquisitionRoyalePartnershipContractStore } from '../features/partnership-purchase/stores/AcquisitionRoyalePartnershipContractStore'

export class RootStore {
  uiStore: UiStore
  sectionStore: SectionStore
  merkleDropStore: MerkleDropStore
  web3Store: Web3Store
  multicallStore: MulticallStore
  localStorageStore: LocalStorageStore
  acquisitionRoyaleContractStore: AcquisitionRoyaleContractStore
  partnershipTokenContractStore: Erc20Entity
  partnershipStore: PartnershipStore
  acquisitionRoyalePartnershipContractStore: AcquisitionRoyalePartnershipContractStore

  constructor() {
    this.uiStore = new UiStore(this)
    this.sectionStore = new SectionStore(this)
    this.merkleDropStore = new MerkleDropStore(this)
    this.web3Store = new Web3Store(this)
    this.multicallStore = new MulticallStore(this)
    this.localStorageStore = new LocalStorageStore(this)
    this.acquisitionRoyaleContractStore = new AcquisitionRoyaleContractStore(this)
    this.partnershipTokenContractStore = new Erc20Entity(this, 'partnershipTokenContractStore')
    this.partnershipStore = new PartnershipStore(this)
    this.acquisitionRoyalePartnershipContractStore = new AcquisitionRoyalePartnershipContractStore(
      this
    )
  }
}
