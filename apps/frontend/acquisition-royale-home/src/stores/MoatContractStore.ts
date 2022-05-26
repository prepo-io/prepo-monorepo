import { ContractReturn, ContractStore } from '@prepo-io/stores'
import { makeObservable, reaction } from 'mobx'
import { RootStore } from './RootStore'
import { SupportedContracts } from '../lib/supported-contracts'
import { MoatAbi as Moat, MoatAbi__factory } from '../../generated'
import { transformRawEther, transformRawNumber } from '../utils/number-utils'

type EnterpriseHasMoat = Moat['functions']['enterpriseHasMoat']
type GetLastHadMoat = Moat['functions']['getLastHadMoat']
type GetMoatCountdown = Moat['functions']['getMoatCountdown']
type GetMoatImmunityPeriod = Moat['functions']['getMoatImmunityPeriod']
type GetMoatThreshold = Moat['functions']['getMoatThreshold']

export class MoatContractStore extends ContractStore<RootStore, SupportedContracts> {
  constructor(public root: RootStore) {
    super(root, 'MOAT', MoatAbi__factory)
    makeObservable(this, {})
    this.initContract()
  }

  initContract(): void {
    const disposer = reaction(
      () => this.root.acqrHookV1.moat,
      (moat) => {
        if (moat === undefined) return
        this.updateAddress(moat)
        disposer()
      }
    )
  }

  enterpriseHasMoat(...params: Parameters<EnterpriseHasMoat>): ContractReturn<EnterpriseHasMoat> {
    return this.call<EnterpriseHasMoat>('enterpriseHasMoat', params)
  }

  getLastHadMoat(...params: Parameters<GetLastHadMoat>): ContractReturn<GetLastHadMoat> {
    return this.call<GetLastHadMoat>('getLastHadMoat', params)
  }

  getMoatCountdown(...params: Parameters<GetMoatCountdown>): ContractReturn<GetMoatCountdown> {
    return this.call<GetMoatCountdown>('getMoatCountdown', params)
  }

  getMoatImmunityPeriod(
    ...params: Parameters<GetMoatImmunityPeriod>
  ): ContractReturn<GetMoatImmunityPeriod> {
    return this.call<GetMoatImmunityPeriod>('getMoatImmunityPeriod', params)
  }

  getMoatThreshold(...params: Parameters<GetMoatThreshold>): ContractReturn<GetMoatThreshold> {
    return this.call<GetMoatThreshold>('getMoatThreshold', params)
  }

  get moatImmunityPeriod(): number | undefined {
    return transformRawNumber(this.getMoatImmunityPeriod())
  }

  get moatThreshold(): number | undefined {
    return transformRawEther(this.getMoatThreshold())
  }
}
