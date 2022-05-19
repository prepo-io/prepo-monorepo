import { notification } from 'antd'
import { BigNumber } from 'ethers'
import { isAddress } from 'ethers/lib/utils'
import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { RootStore } from './RootStore'
import { Enterprise, Enterprises } from '../types/enterprise.types'
import { generateRandomInt } from '../utils/number-utils'

const MAX_IDS_PER_SEARCH = 80
export class CompetitionStore {
  activeEnterpriseId?: number
  localQuery: string
  randomIds: number[] = []
  searchCompetitionQuery?: string
  searchingRandom: boolean
  slides: number
  constructor(public root: RootStore) {
    this.slides = 1
    this.localQuery = ''
    this.searchingRandom = false
    makeAutoObservable(this, {}, { autoBind: true })
    this.updateCompetitionActiveEnterprise()

    this.initRandomIds()
    this.filterRandomEnterprise()
    this.selectAcquirableEnterprise()
  }

  initRandomIds(): void {
    const { acquisitionRoyaleContractStore, enterprisesStore } = this.root
    reaction(
      // do not destructure these otherwise they will lose observability
      () => ({
        valid:
          enterprisesStore.foundedEnterprisesCount !== undefined &&
          acquisitionRoyaleContractStore.auctionCount !== undefined &&
          acquisitionRoyaleContractStore.freeCount !== undefined &&
          acquisitionRoyaleContractStore.maxAuctioned !== undefined &&
          acquisitionRoyaleContractStore.maxFree !== undefined,
        randomIds: this.randomIds.length,
      }),
      ({ randomIds, valid }) => {
        // fill ids when remaining ids are less than 50% of max
        if (valid && randomIds < Math.ceil(MAX_IDS_PER_SEARCH / 2)) {
          this.generateIds()
        }
      }
    )
  }

  filterRandomEnterprise(): void {
    reaction(
      () => ({
        randomEnterprises: this.randomEnterprises,
        randomIds: this.randomIds,
        signerAddress: this.root.web3Store.signerState?.address,
      }),
      ({ randomEnterprises, randomIds, signerAddress }) => {
        runInAction(() => {
          if (randomEnterprises) {
            const ids = randomIds
            randomEnterprises.forEach((enterprise, index) => {
              const owned = Boolean(signerAddress) && signerAddress === enterprise.ownerOf
              if (enterprise.burned || owned) ids.splice(index, 1)
            })
            runInAction(() => {
              this.randomIds = ids
            })
          }
        })
      }
    )
  }

  selectAcquirableEnterprise(): void {
    reaction(
      () => ({
        randomIds: this.randomIds,
        randomEnterprises: this.randomEnterprises,
        searchingRandom: this.searchingRandom,
        signerAddress: this.root.web3Store.signerState?.address,
      }),
      ({ randomIds, randomEnterprises, searchingRandom, signerAddress }) => {
        if (!searchingRandom || !randomEnterprises || randomEnterprises.length === 0) return
        const { signerActiveEnterprise } = this.root.signerStore
        let selectedIndex = 0
        for (let i = 0; i < randomEnterprises.length; i++) {
          const {
            burned,
            ownerOf,
            immune,
            stats: { rp },
          } = randomEnterprises[i]
          const insufficientRp =
            Boolean(signerActiveEnterprise) && signerActiveEnterprise.stats.rp < rp
          const owned = Boolean(signerAddress) && signerAddress === ownerOf
          const selectedEnterprise = randomEnterprises[selectedIndex]
          // minimum requirement for enterprise to be selected, otherwise they will be removed from the list by filterRandomEnterprise
          if (!owned && !burned) {
            // unprotected ones are prioritized
            if (selectedEnterprise.immune && !immune) selectedIndex = i

            // Acquirable Enterprise
            if (!insufficientRp) {
              selectedIndex = i
              // Non-acquirable Enterprise (lowest RP difference order)
            } else {
              selectedIndex = selectedEnterprise.stats.rp > rp ? i : selectedIndex
            }

            // can stop the loop once we find acquirable unprotected enterprise
            if (!immune && !insufficientRp) {
              selectedIndex = i
              break
            }
          }
        }
        const idString = `${randomEnterprises[selectedIndex]?.id}`
        runInAction(() => {
          this.localQuery = idString
          this.searchCompetitionQuery = idString
          this.searchingRandom = false
          const ids = randomIds
          ids.splice(selectedIndex, 1)
          this.randomIds = ids
        })
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
    this.clearEnterprises()
    this.searchCompetitionQuery = ''
    this.localQuery = ''
    this.searchingRandom = true
  }

  generateIds(): void {
    const ids = this.randomIds
    while (ids.length < MAX_IDS_PER_SEARCH) {
      let id = this.generateRandomId()
      while (ids.includes(id)) {
        id = this.generateRandomId()
      }
      ids.push(id)
    }
    this.randomIds = ids
  }

  generateRandomId(): number {
    let randomId = 0
    const { auctionCount, freeCount, maxAuctioned, maxFree } =
      this.root.acquisitionRoyaleContractStore

    const { foundedEnterprisesCount } = this.root.enterprisesStore
    if (foundedEnterprisesCount === undefined) return randomId
    // range of 0 to totalSupply + total enterprises eliminated
    randomId = generateRandomInt(foundedEnterprisesCount)

    // in range of reserved enterprises
    if (randomId >= auctionCount + freeCount) {
      randomId = randomId + maxAuctioned + maxFree - auctionCount - freeCount

      // in range of free enterprises
    } else if (randomId >= auctionCount) {
      randomId = randomId + maxAuctioned - auctionCount
    }

    // in range of auctioned enterprises if didn't go into the if checks
    return randomId
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
    )
      return []

    if (isAddress(this.searchCompetitionQuery))
      return this.root.enterprisesStore.lazyLoad(this.searchCompetitionQuery, this.slides)
    if (!Number.isNaN(+this.searchCompetitionQuery)) {
      const id = BigNumber.from(this.searchCompetitionQuery)
      const ownIndex = this.root.signerStore.signerEnterprises?.findIndex(
        ({ id: enterpriseId }) => enterpriseId === id.toNumber()
      )
      // cannot search own enterprise
      if (ownIndex !== undefined && ownIndex >= 0) return []
      const minted = this.root.enterprisesStore.localIsMinted(id.toNumber())
      if (minted === undefined) return undefined
      if (!minted) return []
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
    return this.searchLoading || this.searchingRandom
  }

  get randomEnterprise(): Enterprise | undefined {
    if (this.randomEnterprises === undefined || this.randomEnterprises.length < 1) return undefined
    // show loading ui while reaction finds the next valid enterprise
    if (this.randomEnterprises[0].immune || this.randomEnterprises[0].burned) return undefined
    return this.randomEnterprises[0]
  }

  get randomEnterprises(): Enterprises | undefined {
    const enterprises = []
    if (!this.randomIds) return enterprises
    const { getEnterpriseById, getEnterpriseDetails } = this.root.enterprisesStore
    for (let i = 0; i < this.randomIds.length; i++) {
      const basic = getEnterpriseById(BigNumber.from(this.randomIds[i]))
      let enterprise = basic
      // preload 5 enterprises so when random is clicked again, the next Enterprise's NFT is already loaded
      if (i < 5 && basic) {
        const details = getEnterpriseDetails(basic)
        if (details !== undefined) enterprise = { ...basic, ...details }
      }
      if (enterprise) enterprises.push(enterprise)
    }
    if (enterprises.length !== this.randomIds.length) return undefined
    return enterprises
  }

  get searchDisabled(): boolean {
    return this.competitionLoading || !this.validSearchQuery
  }

  get searchLoading(): boolean {
    return Boolean(this.searchCompetitionQuery) && this.competitionEnterprises === undefined
  }

  get validSearchQuery(): boolean {
    return (
      this.localQuery.length > 0 && (/^\d+$/.test(this.localQuery) || isAddress(this.localQuery))
    )
  }
}
