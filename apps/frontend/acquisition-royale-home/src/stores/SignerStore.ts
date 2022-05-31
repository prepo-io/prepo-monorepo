import { makeAutoObservable, reaction } from 'mobx'
import { RootStore } from './RootStore'
import { Enterprise, Enterprises } from '../types/enterprise.types'
import { transformRawNumber } from '../utils/number-utils'

export class SignerStore {
  activeEnterpriseId?: number
  mergeTargetId?: number
  searchCompetitionQuery?: string
  slides: number
  constructor(public root: RootStore) {
    this.slides = 1
    makeAutoObservable(this, {}, { autoBind: true })

    this.updateSignerActiveEnterprise()
  }

  updateSignerActiveEnterprise(): void {
    reaction(
      () => this.signerEnterprises,
      (enterprises) => {
        if (enterprises === undefined) {
          if (this.activeEnterpriseId !== undefined) this.clearEnterprises()
        } else if (this.activeEnterpriseId === undefined) {
          this.setSignerEnterpriseActiveId(enterprises[0].id)
        }
      }
    )
  }

  clearEnterprises(): void {
    this.setSignerEnterpriseActiveId(undefined)
    this.setMergeTargetId(undefined)
    this.slides = 1
  }

  onSignerSlidesChange({ enterpriseId, slides }: { enterpriseId?: number; slides: number }): void {
    this.setSignerEnterpriseActiveId(enterpriseId)
    if (slides > this.slides) this.slides = slides
  }

  setMergeTargetId(id?: number): void {
    this.mergeTargetId = id
  }

  setSignerEnterpriseActiveId(id?: number): void {
    this.activeEnterpriseId = id
    this.root.acquisitionRoyaleContractStore.setAcquireKeepId(undefined)
    if (id !== undefined && this.mergeTargetId === id) {
      this.setMergeTargetId(undefined)
    }
  }

  get activeIndex(): number | undefined {
    return this.signerEnterprises?.findIndex(({ id }) => id === this.activeEnterpriseId)
  }

  get enterprisesBalance(): number | undefined {
    const { address } = this.root.web3Store
    if (address === undefined) return undefined
    return transformRawNumber(this.root.acquisitionRoyaleContractStore.balanceOf(address))
  }

  get mergeTargetEnterprise(): Enterprise | undefined {
    if (this.mergeTargetId !== undefined && this.signerEnterprises) {
      const mergeIndex = this.signerEnterprises?.findIndex(
        (enterprise) => enterprise && enterprise.id === this.mergeTargetId
      )
      return this.signerEnterprises[mergeIndex]
    }
    return undefined
  }

  get signerActiveEnterprise(): Enterprise | undefined {
    if (this.activeEnterpriseId !== undefined && this.signerEnterprises) {
      const activeIndex = this.signerEnterprises.findIndex(
        (enterprise) => enterprise && enterprise.id === this.activeEnterpriseId
      )
      return this.signerEnterprises[activeIndex]
    }
    return undefined
  }

  get signerEnterprises(): Enterprises | undefined {
    const { address } = this.root.web3Store
    if (!address) return []
    return this.root.enterprisesStore.lazyLoad(address, this.slides)
  }
}
