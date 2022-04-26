import { ethers } from 'ethers'
import { autorun, computed, makeObservable, observable, runInAction } from 'mobx'
import { ContractStore } from '@prepo-io/stores'
import { RootStore } from './RootStore'
import { ContractReturn } from './utils/class-utils'
import { CompeteV1Abi as CompeteV1, CompeteV1Abi__factory } from '../../generated'
import { SupportedContracts } from '../lib/supported-contracts'

type GetDamage = CompeteV1['functions']['getDamage']
type GetRpRequiredForDamage = CompeteV1['functions']['getRpRequiredForDamage']
export type GetDamageArray = ContractReturn<GetDamage>

export class CompeteV1ContractStore extends ContractStore<RootStore, SupportedContracts> {
  rpRequiredForDamage?: number

  constructor(root: RootStore) {
    super(root, 'COMPETE_V1', CompeteV1Abi__factory)
    makeObservable(this, {
      rpRequiredForDamage: observable,
      latestRpRequiredForDamage: computed,
    })
    autorun(() => {
      const { signerActiveEnterprise, competitionActiveEnterprise } = this.root.enterprisesStore
      const { competeAddress } = this.root.acquisitionRoyaleContractStore
      if (competeAddress !== undefined && this.contract?.address !== competeAddress) {
        this.updateAddress(competeAddress)
      }

      // getRpRequiredForDamage will return undefined for a brief moment on every block change
      // this is because RP is updated, and the new params aren't cached in multicall
      // hence if we check undefined value based on getRpRequiredForDamage,
      // the UI will sort of "blink" as no content can be shown while it's undefined
      // so we need to cache it manually to keep the UI nice
      if (!signerActiveEnterprise || !competitionActiveEnterprise) {
        runInAction(() => {
          this.rpRequiredForDamage = undefined
        })
      } else if (this.latestRpRequiredForDamage !== undefined) {
        runInAction(() => {
          this.rpRequiredForDamage = this.latestRpRequiredForDamage
        })
      }
    })
  }

  getDamage(...params: Parameters<GetDamage>): ContractReturn<GetDamage> {
    return this.call<GetDamage>('getDamage', params)
  }

  getRpRequiredForDamage(
    ...params: Parameters<GetRpRequiredForDamage>
  ): ContractReturn<GetRpRequiredForDamage> {
    const data = this.call<GetRpRequiredForDamage>('getRpRequiredForDamage', params)

    return data
  }

  get damage(): number | undefined {
    const { signerActiveEnterprise, competitionActiveEnterprise } = this.root.enterprisesStore
    const { competeRp } = this.root.acquisitionRoyaleContractStore
    if (signerActiveEnterprise === undefined || competitionActiveEnterprise === undefined) {
      return undefined
    }
    if (competeRp === '' || competeRp === '0') return 0
    const rawDamage = this.getDamage(
      signerActiveEnterprise.id,
      competitionActiveEnterprise.id,
      ethers.utils.parseEther(competeRp)
    )
    if (rawDamage?.[0] === undefined) return undefined
    return +ethers.utils.formatEther(rawDamage[0])
  }

  get latestRpRequiredForDamage(): number | undefined {
    const { signerActiveEnterprise, competitionActiveEnterprise } = this.root.enterprisesStore
    if (
      signerActiveEnterprise !== undefined &&
      competitionActiveEnterprise?.stats.rp !== undefined
    ) {
      const rpRequired = this.getRpRequiredForDamage(
        signerActiveEnterprise.id,
        competitionActiveEnterprise.id,
        ethers.utils.parseEther(`${competitionActiveEnterprise.stats.rp}`)
      )

      if (rpRequired?.[0] !== undefined) {
        return +ethers.utils.formatEther(rpRequired[0])
      }
    }
    return undefined
  }
}
