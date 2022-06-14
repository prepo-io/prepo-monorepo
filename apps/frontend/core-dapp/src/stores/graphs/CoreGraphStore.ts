import { makeObservable, observable } from 'mobx'
import { GraphStore } from 'prepo-stores'
import { userPositionsQueryString } from './queries/core.queries'
import { SupportedContracts } from '../../lib/contract.types'
import { RootStore } from '../RootStore'
import { RootStore as CoreRootStore } from '../../../generated/mst-gql/core-dapp/RootStore'
import { PositionCostBasis } from '../../types/user.types'

export class CoreGraphStore extends GraphStore<RootStore, SupportedContracts> {
  constructor(public root: RootStore) {
    super(root, 'core', CoreRootStore)
    makeObservable(this, { positionsCostBasis: observable })
  }

  positionsCostBasis = (address: string): PositionCostBasis | undefined =>
    this.query<PositionCostBasis>(userPositionsQueryString, { address: address.toLowerCase() })
      ?.data
}
