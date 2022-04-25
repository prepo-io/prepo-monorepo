import { makeObservable } from 'mobx'
import { ContractStore } from '@prepo-io/stores'
import { RootStore } from './RootStore'
import { ContractReturn } from './utils/class-utils'
import { BrandingAbi as Branding, BrandingAbi__factory } from '../../generated'
import { SupportedContracts } from '../lib/supported-contracts'

type GetArt = Branding['functions']['getArt']
export type ArtArray = ContractReturn<GetArt>

export class BrandingContractStore extends ContractStore<RootStore, SupportedContracts> {
  constructor(root: RootStore) {
    super(root, 'BRANDING', BrandingAbi__factory)
    makeObservable(this, {})
  }

  getArt(...params: Parameters<GetArt>): ContractReturn<GetArt> {
    return this.call<GetArt>('getArt', params)
  }
}
