import { BigNumber, ethers } from 'ethers'
import { makeAutoObservable } from 'mobx'
import { RootStore } from './RootStore'
import { getRawEnterprise, getReadableEnterpriseBasic } from './utils/enterprise-utils'
import { calculateRpPerDay } from './utils/common-utils'
import { formatArt } from './utils/branding-utils'
import { EnterpriseBasic, EnterpriseDetails, Enterprises } from '../types/enterprise.types'
import { SEC_IN_MS } from '../lib/constants'

export class EnterpriseStore {
  root: RootStore
  competitionActiveEnterpriseId?: number
  competitionSlides: number
  mergeTargetId?: number
  searchCompetitionQuery?: string
  signerActiveEnterpriseId?: number
  signerSlides: number

  constructor(root: RootStore) {
    this.root = root
    this.competitionSlides = 0
    this.signerSlides = 0
    makeAutoObservable(this, {}, { autoBind: true })
  }

  getEnterpriseBasic(address: string, index: number): EnterpriseBasic | undefined {
    const { acquisitionRoyaleContractStore } = this.root
    const rawId = acquisitionRoyaleContractStore.tokenOfOwnerByIndex(address, index)
    if (!rawId) return undefined
    const id = rawId[0]
    return this.getEnterpriseById(id)
  }

  getEnterpriseById(id: BigNumber): EnterpriseBasic | undefined {
    const { acquisitionRoyaleContractStore, moatContractStore } = this.root
    const { passiveRpPerDay } = acquisitionRoyaleContractStore
    const rawEnterprise = getRawEnterprise(acquisitionRoyaleContractStore.getEnterprise(id))
    if (rawEnterprise === undefined) return undefined

    // retrieve basic info on an enterprise
    const immuneUntil = acquisitionRoyaleContractStore.getEnterpriseImmunityUntil(rawEnterprise)
    const rawImmune = acquisitionRoyaleContractStore.isEnterpriseImmune(id)
    const rawOwnerOf = acquisitionRoyaleContractStore.ownerOf(id)
    const virtualRpBalance = acquisitionRoyaleContractStore.getEnterpriseVirtualBalance(id)
    const enterpriseHasMoat = moatContractStore.enterpriseHasMoat(id)
    const lastHadMoat = moatContractStore.getLastHadMoat(id)
    const moatCountdown = moatContractStore.getMoatCountdown(id)
    if (
      passiveRpPerDay === undefined ||
      immuneUntil === undefined ||
      rawImmune === undefined ||
      rawOwnerOf === undefined ||
      virtualRpBalance === undefined ||
      enterpriseHasMoat === undefined ||
      lastHadMoat === undefined ||
      moatCountdown === undefined
    )
      return undefined
    const rp = +ethers.utils.formatEther(virtualRpBalance[0])
    const rpPerDay = calculateRpPerDay(passiveRpPerDay, rawEnterprise)

    return getReadableEnterpriseBasic({
      id,
      immuneUntil: immuneUntil * SEC_IN_MS,
      rawEnterprise,
      rawImmune,
      rawOwnerOf,
      rp,
      rpPerDay,
      enterpriseHasMoat,
      lastHadMoat,
      moatCountdown,
    })
  }

  getEnterpriseDetails({ id }: EnterpriseBasic): EnterpriseDetails | undefined {
    const { brandingContractStore } = this.root
    const art = formatArt(brandingContractStore.getArt(id))

    if (art) {
      return {
        art,
      }
    }
    return undefined
  }

  lazyLoad(address: string, loadUntil: number): Enterprises | undefined {
    const { acquisitionRoyaleContractStore } = this.root
    const rawBalance = acquisitionRoyaleContractStore.balanceOf(address)
    if (rawBalance === undefined) return undefined
    const balance = rawBalance[0].toNumber()

    const enterprises = []
    for (let i = 0; i < balance; i++) {
      const basic = this.getEnterpriseBasic(address, i)
      if (basic) {
        let enterprise = basic
        if (i < loadUntil) {
          const details = this.getEnterpriseDetails(basic)
          if (details !== undefined) enterprise = { ...basic, ...details }
        }
        enterprises.push(enterprise)
      }
    }
    if (enterprises.length !== balance) return undefined
    return enterprises
  }

  localIsMinted(id: number): boolean | undefined {
    const { auctionCount, maxAuctioned, freeCount, maxFree, reservedCount } =
      this.root.acquisitionRoyaleContractStore
    const auctioned = id < auctionCount
    const free = id >= maxAuctioned && id < freeCount + maxAuctioned
    const reservedStart = maxFree + maxAuctioned
    const reserved = id >= reservedStart && id < reservedCount + reservedStart
    return auctioned || free || reserved
  }

  get foundedEnterprisesCount(): number | undefined {
    const { auctionCount, freeCount, reservedCount } = this.root.acquisitionRoyaleContractStore
    if (auctionCount === undefined || freeCount === undefined || reservedCount === undefined)
      return undefined
    return auctionCount + freeCount + reservedCount - 1
  }
}
