import { notification } from 'antd'
import { BigNumber } from 'ethers'
import { isAddress } from 'ethers/lib/utils'
import { makeAutoObservable } from 'mobx'
import { RootStore } from './RootStore'
import { Enterprise, Enterprises } from '../types/enterprise.types'

export class CompetitionStore {
  activeEnterpriseId?: number
  searchCompetitionQuery?: string
  slides: number
  constructor(public root: RootStore) {
    this.slides = 0
    makeAutoObservable(this, {}, { autoBind: true })
  }

  clearEnterprises(): void {
    this.activeEnterpriseId = undefined
    this.root.acquisitionRoyaleContractStore.setAcquireKeepId(undefined)
    this.slides = 0
  }

  onSlidesChange({ enterpriseId, slides }: { enterpriseId?: number; slides: number }): void {
    this.setCompetitionEnterpriseActiveId(enterpriseId)
    if (slides > this.slides) this.slides = slides
  }

  setCompetitionEnterpriseActiveId(id?: number): void {
    this.activeEnterpriseId = id
  }

  searchCompetition(query: string): void {
    if (
      this.root.web3Store.signerState.address !== undefined &&
      query.toLowerCase() === this.root.web3Store.signerState.address.toLowerCase()
    ) {
      notification.error({ message: 'Cannot search your own address!' })
      return
    }
    this.clearEnterprises()
    this.searchCompetitionQuery = query
  }

  get competitionActiveEnterprise(): Enterprise | undefined {
    if (this.activeEnterpriseId !== undefined && this.competitionEnterprises) {
      const activeIndex = this.competitionEnterprises.findIndex(
        (enterprise) => enterprise && enterprise.id === this.activeEnterpriseId
      )
      return this.competitionEnterprises[activeIndex]
    }
    return undefined
  }

  get competitionEnterprises(): Enterprises | undefined {
    const { address } = this.root.web3Store
    if (
      this.searchCompetitionQuery === undefined ||
      this.searchCompetitionQuery.length === 0 ||
      (address && address.toLowerCase() === this.searchCompetitionQuery.toLowerCase())
    ) {
      return []
    }
    if (isAddress(this.searchCompetitionQuery))
      return this.root.enterprisesStore.lazyLoad(this.searchCompetitionQuery, this.slides)
    if (!Number.isNaN(+this.searchCompetitionQuery)) {
      const id = BigNumber.from(this.searchCompetitionQuery)
      const rawIsMinted = this.root.acquisitionRoyaleContractStore.isMinted(id)
      if (rawIsMinted === undefined) return undefined
      if (!rawIsMinted[0]) return []
      const enterpriseBasic = this.root.enterprisesStore.getEnterpriseById(
        BigNumber.from(this.searchCompetitionQuery)
      )
      if (!enterpriseBasic) return undefined
      const enterpriseDetails = this.root.enterprisesStore.getEnterpriseDetails(enterpriseBasic)
      if (!enterpriseDetails) return undefined
      return [{ ...enterpriseBasic, ...enterpriseDetails }]
    }
    return []
  }
}
