import { notification } from 'antd'
import { BigNumber, ethers } from 'ethers'
import { action, autorun, makeAutoObservable, observable, runInAction } from 'mobx'
import { RootStore } from './RootStore'
import { getRawEnterprise, getReadableEnterpriseBasic } from './utils/enterprise-utils'
import { calculateRpPerDay } from './utils/common-utils'
import { formatArt } from './utils/branding-utils'
import {
  Enterprise,
  EnterpriseBasic,
  EnterpriseDetails,
  Enterprises,
} from '../types/enterprise.types'
import { EMPTY_CONTRACT_ADDRESS, SEC_IN_MS } from '../lib/constants'
import { transformRawNumber } from '../utils/number-utils'

type LazyLoadUpdater = (enterprise: Enterprise, index: number, balance: number) => unknown
type LazyLoadOptions = {
  forceLoadBasic?: boolean
  loadUntil?: number
  updater?: LazyLoadUpdater
}

export class EnterpriseStore {
  root: RootStore
  competitionEnterprises?: Enterprises
  competitionActiveEnterpriseId?: number
  competitionSlides: number
  mergeTargetId?: number
  searchCompetitionQuery?: string
  signerEnterprises?: Enterprises
  signerActiveEnterpriseId?: number
  signerSlides: number

  constructor(root: RootStore) {
    this.root = root
    this.competitionSlides = 0
    this.signerSlides = 0
    makeAutoObservable(
      this,
      {
        clearCompetitionEnterprises: action.bound,
        clearSignerEnterprises: action.bound,
        competitionEnterprises: observable,
        noCompetition: action.bound,
        setCompetitionEnterpriseActiveId: action.bound,
        setMergeTargetId: action.bound,
        setSignerEnterpriseActiveId: action.bound,
        setSignerSlides: action.bound,
        signerEnterprises: observable,
        updateCompetitionEnterprises: action.bound,
        updateSignerEnterprises: action.bound,
      },
      { autoBind: true }
    )

    autorun(() => {
      this.loadSignerEnterprises()
      this.loadCompetitionEnterprises()
    })
  }

  clearCompetitionEnterprises(): void {
    this.competitionActiveEnterpriseId = undefined
    this.competitionEnterprises = undefined
    this.root.acquisitionRoyaleContractStore.setAcquireKeepId(undefined)
  }

  clearSignerEnterprises(): void {
    this.signerActiveEnterpriseId = undefined
    this.signerEnterprises = undefined
    this.setMergeTargetId(undefined)
  }

  // when this returns undefined, the address is changed, hence the cache should be cleared
  lazyLoadEnterprisesByAddress(
    address: string,
    { forceLoadBasic, loadUntil, updater }: LazyLoadOptions
  ): number | undefined {
    const { acquisitionRoyaleContractStore } = this.root
    const rawBalance = acquisitionRoyaleContractStore.balanceOf(address)
    if (rawBalance === undefined) return undefined
    const balance = rawBalance[0].toNumber()

    let shouldLoadUntil = balance

    // if forceLoadBasic is false, we can loop only those that are within loadUntil
    if (!forceLoadBasic && loadUntil !== undefined && balance > loadUntil) {
      shouldLoadUntil = loadUntil
    }
    // start lazy loading enterprises
    for (let i = 0; i < shouldLoadUntil; i++) {
      // every index in this loop will require at least the basic info
      // so we can fetch basic info
      // then check whether details is required
      const enterpriseBasic = this.getEnterpriseBasic(address, i)
      if (enterpriseBasic) {
        // once we get the basic info,
        // check whether we need details and get the details
        let enterpriseDetails: EnterpriseDetails = {}
        if (loadUntil === undefined || i < loadUntil) {
          // fetch details with basic info
          // update from here enterpriseDetails when we have everything
          const details = this.getEnterpriseDetails(enterpriseBasic)
          if (details) {
            enterpriseDetails = details
          }
        }

        // then use updater to update caller
        // so that caller can update their own data
        // e.g. signer's list will update signerEnterprises while competition list will update competitionEnterprises
        if (updater) {
          updater({ ...enterpriseBasic, ...enterpriseDetails }, i, balance)
        }
      }
    }

    return balance
  }

  loadCompetitionEnterprises(): void {
    if (this.searchCompetitionQuery === undefined || this.searchCompetitionQuery.length === 0) {
      this.clearCompetitionEnterprises()
      return
    }
    if (ethers.utils.isAddress(this.searchCompetitionQuery)) {
      // empty list if searching own address
      if (this.root.web3Store.address === this.searchCompetitionQuery) {
        this.noCompetition()
      } else {
        this.lazyLoadEnterprisesByAddress(this.searchCompetitionQuery, {
          forceLoadBasic: false,
          loadUntil: this.competitionSlides,
          updater: this.updateCompetitionEnterprises,
        })
      }
    } else if (!Number.isNaN(+this.searchCompetitionQuery)) {
      const rawIsMinted = this.root.acquisitionRoyaleContractStore.isMinted(
        BigNumber.from(this.searchCompetitionQuery)
      )
      if (rawIsMinted === undefined) return
      // if id that's being searched is not minted, don't need to proceed
      if (!rawIsMinted[0]) {
        this.noCompetition()
      } else {
        const enterpriseBasic = this.getEnterpriseById(BigNumber.from(this.searchCompetitionQuery))
        if (enterpriseBasic) {
          const enterpriseDetails = this.getEnterpriseDetails(enterpriseBasic)
          if (enterpriseDetails) {
            runInAction(() => {
              this.competitionEnterprises = [{ ...enterpriseBasic, ...enterpriseDetails }]
              this.competitionActiveEnterpriseId = enterpriseBasic.id
            })
          }
        }
      }
    }
  }

  loadSignerEnterprises(): void {
    const { address } = this.root.web3Store
    if (address) {
      const enterpriseBalance = this.lazyLoadEnterprisesByAddress(address, {
        forceLoadBasic: true,
        loadUntil: this.signerSlides,
        updater: this.updateSignerEnterprises,
      })
      if (enterpriseBalance === undefined) this.clearCompetitionEnterprises()
      // updater will not update anything if enterpriseBalance is 0 because there's nothing to update
      // but we must update this.signerEnterprises to [] so the UI does not stay in loading state
      if (enterpriseBalance === 0) {
        runInAction(() => {
          this.signerEnterprises = []
        })
      }
    }
  }
  // to get complete information of an enterprise, we will group an enterprise's required calls into 2 functions
  // getEnterpriseBasic will get the id, name and rp (and other info that don't require API call) of an Enterprise
  // getEnterpriseDetails will get rest of the information like art, immunity and so on
  // this is because for Merge action, we cannot lazy load Enterprise's name as we need complete list for them to choose from
  // but we can lazy load the enterprise's NFT and other stats as those are only used if user selects them from the list
  // as for competition analysis, we can basically lazy load everything

  getEnterpriseBasic(address: string, index: number): EnterpriseBasic | undefined {
    const { acquisitionRoyaleContractStore } = this.root
    const rawId = acquisitionRoyaleContractStore.tokenOfOwnerByIndex(address, index)
    if (!rawId) return undefined
    const id = rawId[0]
    return this.getEnterpriseById(id)
  }

  getEnterpriseById(id: BigNumber): EnterpriseBasic | undefined {
    const { acquisitionRoyaleContractStore } = this.root
    const { passiveRpPerDay } = acquisitionRoyaleContractStore
    if (passiveRpPerDay === undefined) return undefined
    const rawEnterprise = getRawEnterprise(acquisitionRoyaleContractStore.getEnterprise(id))
    const virtualRpBalance = acquisitionRoyaleContractStore.getEnterpriseVirtualBalance(id)
    if (rawEnterprise === undefined) return undefined
    const immuneUntil = acquisitionRoyaleContractStore.getEnterpriseImmunityUntil(rawEnterprise)
    if (immuneUntil === undefined || !virtualRpBalance) return undefined
    const rp = +ethers.utils.formatEther(virtualRpBalance[0])
    const rpPerDay = calculateRpPerDay(passiveRpPerDay, rawEnterprise)
    return getReadableEnterpriseBasic({
      id,
      // 1000 to push timestamp forward to current time. Else it will be pointing to 1970
      immuneUntil: immuneUntil * SEC_IN_MS,
      rawEnterprise,
      rp,
      rpPerDay,
    })
  }

  getEnterpriseDetails({ id }: EnterpriseBasic): EnterpriseDetails | undefined {
    const { acquisitionRoyaleContractStore, brandingContractStore } = this.root
    const art = formatArt(brandingContractStore.getArt(id))
    const rawOwnerOf = acquisitionRoyaleContractStore.ownerOf(id)
    const rawImmune = acquisitionRoyaleContractStore.isEnterpriseImmune(id)

    if (art && rawImmune && rawOwnerOf) {
      const burned = rawOwnerOf[0] === EMPTY_CONTRACT_ADDRESS
      return {
        art,
        burned,
        immune: rawImmune[0],
      }
    }
    return undefined
  }

  noCompetition(): void {
    this.competitionActiveEnterpriseId = undefined
    this.competitionEnterprises = []
  }

  searchCompetition(query: string): void {
    if (
      this.root.web3Store.signerState.address !== undefined &&
      query === this.root.web3Store.signerState.address
    ) {
      notification.error({ message: 'Cannot search your own address!' })
      return
    }
    this.clearCompetitionEnterprises()
    this.searchCompetitionQuery = query
  }

  setCompetitionEnterpriseActiveId(id?: number): void {
    this.competitionActiveEnterpriseId = id
  }

  setCompetitionSlides(slides: number): void {
    this.competitionSlides = slides
  }

  setMergeTargetId(id?: number): void {
    this.mergeTargetId = id
  }

  setSignerEnterpriseActiveId(id?: number): void {
    this.signerActiveEnterpriseId = id
    if (id !== undefined && this.mergeTargetId === id) {
      this.setMergeTargetId(undefined)
    }
  }

  setSignerSlides(slides: number): void {
    this.signerSlides = slides
  }

  updateCompetitionEnterprises(enterprise: Enterprise, index: number, balance: number): void {
    this.competitionEnterprises = this.competitionEnterprises || []
    this.competitionEnterprises.length = balance
    // auto select first result
    const shouldAutoSelect = index === 0 && this.competitionActiveEnterpriseId === undefined
    this.competitionActiveEnterpriseId = shouldAutoSelect
      ? enterprise.id
      : this.competitionActiveEnterpriseId
    this.competitionEnterprises[index] = {
      ...this.competitionEnterprises[index],
      ...enterprise,
    }
  }

  updateSignerEnterprises(enterprise: Enterprise, index: number, balance: number): void {
    this.signerEnterprises = this.signerEnterprises || []
    this.signerEnterprises.length = balance
    const shouldAutoSelect = index === 0 && this.signerActiveEnterpriseId === undefined
    this.signerActiveEnterpriseId = shouldAutoSelect ? enterprise.id : this.signerActiveEnterpriseId
    this.signerEnterprises[index] = { ...this.signerEnterprises[index], ...enterprise }
  }

  get enterprisesBalance(): number | undefined {
    const { address } = this.root.web3Store
    if (address === undefined) return undefined
    return transformRawNumber(this.root.acquisitionRoyaleContractStore.balanceOf(address))
  }
  get competitionActiveEnterprise(): Enterprise | undefined {
    if (this.competitionActiveEnterpriseId !== undefined && this.competitionEnterprises) {
      const activeIndex = this.competitionEnterprises.findIndex(
        (enterprise) => enterprise && enterprise.id === this.competitionActiveEnterpriseId
      )
      return this.competitionEnterprises[activeIndex]
    }
    return undefined
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
    if (this.signerActiveEnterpriseId !== undefined && this.signerEnterprises) {
      const activeIndex = this.signerEnterprises.findIndex(
        (enterprise) => enterprise && enterprise.id === this.signerActiveEnterpriseId
      )
      return this.signerEnterprises[activeIndex]
    }
    return undefined
  }
}
