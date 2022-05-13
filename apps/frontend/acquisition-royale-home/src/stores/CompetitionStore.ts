import { notification } from 'antd'
import { BigNumber } from 'ethers'
import { isAddress } from 'ethers/lib/utils'
import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { RootStore } from './RootStore'
import { Enterprise, Enterprises } from '../types/enterprise.types'
import { generateRandomInt } from '../utils/number-utils'

export class CompetitionStore {
  activeEnterpriseId?: number
  localQuery: string
  randomId?: number
  searchCompetitionQuery?: string
  slides: number
  searchingRandom: boolean
  constructor(public root: RootStore) {
    this.slides = 1
    this.localQuery = ''
    this.searchingRandom = false
    makeAutoObservable(this, {}, { autoBind: true })
    this.updateCompetitionActiveEnterprise()
    this.searchRandomEnterprise()
  }

  searchRandomEnterprise(): void {
    reaction(
      () => ({
        searchingRandom: this.searchingRandom,
        randomId: this.randomId,
        randomEnterprise: this.randomEnterprise,
      }),
      ({ searchingRandom, randomId, randomEnterprise }) => {
        if (!searchingRandom) return
        if (randomId === undefined) this.generateRandomId()
        if (randomEnterprise && randomEnterprise.burned !== undefined) {
          if (randomEnterprise.burned) {
            this.generateRandomId()
          } else {
            runInAction(() => {
              this.searchCompetitionQuery = `${this.randomId}`
              this.localQuery = `${this.randomId}`
              this.randomId = undefined
              this.searchingRandom = false
            })
          }
        }
      }
    )
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

  findRandomEnterprise(): void {
    this.localQuery = ''
    this.searchCompetitionQuery = undefined
    this.searchingRandom = true
  }

  generateRandomId(): void {
    let randomId
    const { auctionCount, freeCount, maxAuctioned, maxFree, reservedCount } =
      this.root.acquisitionRoyaleContractStore

    // range of 0 to totalSupply + total enterprises eliminated
    randomId = generateRandomInt(auctionCount + freeCount + reservedCount - 1)

    // in range of reserved enterprises
    if (randomId >= auctionCount + freeCount) {
      randomId = randomId + maxAuctioned + maxFree - auctionCount - freeCount

      // in range of free enterprises
    } else if (randomId >= auctionCount) {
      randomId = randomId + maxAuctioned - auctionCount
    }

    // in range of auctioned enterprises if didn't go into the if checks
    this.randomId = randomId
  }

  onSlidesChange({ enterpriseId, slides }: { enterpriseId?: number; slides: number }): void {
    this.setCompetitionEnterpriseActiveId(enterpriseId)
    if (slides > this.slides) this.slides = slides
  }

  setCompetitionEnterpriseActiveId(id?: number): void {
    this.activeEnterpriseId = id
  }

  setLocalQuery(query: string): void {
    if (!this.competitionLoading) this.localQuery = query
  }

  searchCompetition(): void {
    if (!this.validSearchQuery) return
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
      return this.searchingRandom ? undefined : []
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

  get competitionLoading(): boolean {
    return this.searchLoading || this.randomLoading
  }

  get randomEnterprise(): Enterprise | undefined {
    if (this.randomId === undefined) return undefined
    const { getEnterpriseById, getEnterpriseDetails } = this.root.enterprisesStore
    const enterpriseBasic = getEnterpriseById(BigNumber.from(this.randomId))
    if (enterpriseBasic) {
      const enterpriseDetails = getEnterpriseDetails(enterpriseBasic)
      if (enterpriseDetails && enterpriseDetails.burned !== undefined) {
        return { ...enterpriseBasic, ...enterpriseDetails }
      }
    }
    return undefined
  }

  get randomLoading(): boolean {
    const { auctionCount, freeCount, maxAuctioned, maxFree, reservedCount } =
      this.root.acquisitionRoyaleContractStore
    return (
      auctionCount === undefined ||
      freeCount === undefined ||
      maxAuctioned === undefined ||
      reservedCount === undefined ||
      maxFree === undefined ||
      this.searchingRandom
    )
  }

  get searchLoading(): boolean {
    return Boolean(this.searchCompetitionQuery) && this.competitionEnterprises === undefined
  }

  get searching(): boolean {
    return this.searchLoading || this.searchingRandom
  }

  get validSearchQuery(): boolean {
    return (
      this.localQuery.length > 0 && (/^\d+$/.test(this.localQuery) || isAddress(this.localQuery))
    )
  }
}
