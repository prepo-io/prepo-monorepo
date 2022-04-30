import { notification } from 'antd'
import { BigNumber } from 'ethers'
import { isAddress } from 'ethers/lib/utils'
import { makeAutoObservable, reaction } from 'mobx'
import { RootStore } from './RootStore'
import { Enterprise, Enterprises } from '../types/enterprise.types'

export class CompetitionStore {
  activeEnterpriseId?: number
  localQuery: string
  searchCompetitionQuery?: string
  slides: number
  constructor(public root: RootStore) {
    this.slides = 1
    this.localQuery = ''
    makeAutoObservable(this, {}, { autoBind: true })
    this.updateCompetitionActiveEnterprise()
  }

  updateCompetitionActiveEnterprise(): void {
    reaction(
      () => this.competitionEnterprises,
      (enterprises) => {
        const { address } = this.root.web3Store
        const ownAddress = address === this.searchCompetitionQuery

        const enterprisesLoading =
          enterprises === undefined && this.activeEnterpriseId !== undefined

        const validSearch =
          this.competitionEnterprises !== undefined && this.competitionEnterprises.length > 0

        if (ownAddress || enterprisesLoading) this.clearEnterprises()
        if (validSearch && this.activeEnterpriseId === undefined)
          this.setCompetitionEnterpriseActiveId(enterprises[0].id)
      }
    )
  }

  clearEnterprises(): void {
    this.activeEnterpriseId = undefined
    this.root.acquisitionRoyaleContractStore.setAcquireKeepId(undefined)
    this.slides = 1
  }

  onSlidesChange({ enterpriseId, slides }: { enterpriseId?: number; slides: number }): void {
    this.setCompetitionEnterpriseActiveId(enterpriseId)
    if (slides > this.slides) this.slides = slides
  }

  setCompetitionEnterpriseActiveId(id?: number): void {
    this.activeEnterpriseId = id
  }

  setLocalQuery(query: string): void {
    this.localQuery = query
  }

  searchCompetition(): void {
    if (
      this.root.web3Store.signerState.address !== undefined &&
      this.localQuery.toLowerCase() === this.root.web3Store.signerState.address.toLowerCase()
    ) {
      notification.error({ message: 'Cannot search your own address!' })
      return
    }
    this.clearEnterprises()
    this.searchCompetitionQuery = this.localQuery
  }

  get activeIndex(): number | undefined {
    return this.competitionEnterprises?.findIndex(({ id }) => id === this.activeEnterpriseId)
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
      const ownIndex = this.root.signerStore.signerEnterprises?.findIndex(
        ({ id: enterpriseId }) => enterpriseId === id.toNumber()
      )
      // cannot search own enterprise
      if (ownIndex !== undefined && ownIndex >= 0) return []
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
