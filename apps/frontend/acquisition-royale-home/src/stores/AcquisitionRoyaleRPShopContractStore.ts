import { BigNumber, ethers } from 'ethers'
import { action, makeObservable, observable, runInAction } from 'mobx'
import { ContractStore } from '@prepo-io/stores'
import { RootStore } from './RootStore'
import { ContractReturn } from './utils/class-utils'
import {
  AcquisitionRoyaleRPShopAbi as RPShop,
  AcquisitionRoyaleRPShopAbi__factory,
} from '../../generated'
import { transformRawEther, transformRawNumber } from '../utils/number-utils'
import { Consumables } from '../types/consumables.type'
import {
  consumablesBalanceMap,
  consumableCostMap,
  consumablesTokenId,
} from '../utils/consumables-utils'
import { SupportedContracts } from '../lib/supported-contracts'

type PurchaseConsumable = RPShop['functions']['purchaseConsumable']
type PurchaseEnterprise = RPShop['functions']['purchaseEnterprise']
type GetEnterpriseRpPrice = RPShop['functions']['getEnterpriseRpPrice']
type GetRebrandTokenRpPrice = RPShop['functions']['getRebrandTokenRpPrice']
type GetRenameTokenRpPrice = RPShop['functions']['getRenameTokenRpPrice']
type GetReviveTokenRpPrice = RPShop['functions']['getReviveTokenRpPrice']

export class AcquisitionRoyaleRPShopContractStore extends ContractStore<
  RootStore,
  SupportedContracts
> {
  approving: boolean
  buying: boolean
  cachedPrice: {
    [key: string]: number | undefined
  }
  quantity: string
  selectedConsumable?: Consumables

  constructor(root: RootStore) {
    super(root, 'ACQUISITION_ROYALE_RP', AcquisitionRoyaleRPShopAbi__factory)
    this.approving = false
    this.buying = false
    this.cachedPrice = {}
    this.quantity = ''
    makeObservable(this, {
      approving: observable,
      approveSpending: action.bound,
      buying: observable,
      cachedPrice: observable,
      purchase: action.bound,
      quantity: observable,
      selectedConsumable: observable,
      setQuantity: action.bound,
      setSelectedConsumable: action.bound,
    })
  }

  setQuantity(quantity: string): void {
    this.quantity = quantity
  }

  setSelectedConsumable(consumable: Consumables | undefined): void {
    this.selectedConsumable = consumable
  }

  getEnterpriseRpPrice(
    ...params: Parameters<GetEnterpriseRpPrice>
  ): ContractReturn<GetEnterpriseRpPrice> {
    return this.call<GetEnterpriseRpPrice>('getEnterpriseRpPrice', params)
  }

  getRebrandTokenRpPrice(
    ...params: Parameters<GetRebrandTokenRpPrice>
  ): ContractReturn<GetRebrandTokenRpPrice> {
    return this.call<GetRebrandTokenRpPrice>('getRebrandTokenRpPrice', params)
  }

  getRenameTokenRpPrice(
    ...params: Parameters<GetRenameTokenRpPrice>
  ): ContractReturn<GetRenameTokenRpPrice> {
    return this.call<GetRenameTokenRpPrice>('getRenameTokenRpPrice', params)
  }

  getReviveTokenRpPrice(
    ...params: Parameters<GetReviveTokenRpPrice>
  ): ContractReturn<GetReviveTokenRpPrice> {
    return this.call<GetReviveTokenRpPrice>('getReviveTokenRpPrice', params)
  }

  async approveSpending(): Promise<boolean | undefined> {
    try {
      if (this.address !== undefined) {
        this.approving = true
        const { approve } = this.root.runwayPointsContractStore
        const tx = await approve(this.address, ethers.utils.parseEther(`${this.rpCost}`))
        await tx.wait()
        return true
      }
    } catch (error) {
      this.root.toastStore.errorToast('approve RP', error)
      return false
    } finally {
      runInAction(() => {
        this.approving = false
      })
    }
    return undefined
  }

  async purchase(): Promise<{ cost: number; successful: boolean } | undefined> {
    if (this.rpCost === undefined) return undefined
    const cost = this.rpCost
    try {
      if (this.address && +this.quantity > 0 && this.selectedConsumable !== undefined) {
        this.buying = true
        const tx = await (this.selectedConsumable === Consumables.Enterprise
          ? this.sendTransaction<PurchaseEnterprise>('purchaseEnterprise', [
              BigNumber.from(this.quantity),
            ])
          : this.sendTransaction<PurchaseConsumable>('purchaseConsumable', [
              consumablesTokenId[this.selectedConsumable],
              BigNumber.from(this.quantity),
            ]))

        await tx.wait()
        return {
          cost,
          successful: true,
        }
      }
    } catch (error) {
      this.root.toastStore.errorToast('purchase', error)
      return {
        cost,
        successful: false,
      }
    } finally {
      runInAction(() => {
        this.buying = false
      })
    }
    return undefined
  }

  get allowedRpSpending(): number | undefined {
    return this.root.runwayPointsContractStore.approvedAmount(this.address)
  }

  get enterpriseBalance(): number | undefined {
    if (!this.address) return undefined
    return transformRawNumber(this.root.acquisitionRoyaleContractStore.balanceOf(this.address))
  }

  get enterpriseRpPrice(): number | undefined {
    const price = transformRawEther(this.getEnterpriseRpPrice())
    if (price !== undefined) {
      runInAction(() => {
        this.cachedPrice.enterpriseRpPrice = price
      })
    }
    return this.cachedPrice.enterpriseRpPrice
  }

  get insufficientSupply(): boolean | undefined {
    if (
      this.enterpriseBalance === undefined ||
      this.rebrandTokenBalance === undefined ||
      this.renameTokenBalance === undefined ||
      this.reviveTokenBalance === undefined ||
      this.selectedConsumable === undefined
    )
      return undefined
    if (+this.quantity <= 0) return false
    const balance = this[consumablesBalanceMap[this.selectedConsumable]]
    if (balance === undefined) return undefined
    return balance < +this.quantity
  }

  get needsApproval(): boolean | undefined {
    if (this.rpCost === undefined || this.allowedRpSpending === undefined) return undefined
    return this.allowedRpSpending < this.rpCost
  }

  get rebrandTokenBalance(): number | undefined {
    if (!this.address) return undefined
    return transformRawNumber(
      this.root.consumablesContractStore.balanceOf(
        this.address,
        consumablesTokenId[Consumables.RebrandToken]
      )
    )
  }

  get rebrandTokenRpPrice(): number | undefined {
    const price = transformRawEther(this.getRebrandTokenRpPrice())
    if (price !== undefined) {
      runInAction(() => {
        this.cachedPrice.rebrandTokenRpPrice = price
      })
    }
    return this.cachedPrice.rebrandTokenRpPrice
  }

  get renameTokenBalance(): number | undefined {
    if (!this.address) return undefined
    return transformRawNumber(
      this.root.consumablesContractStore.balanceOf(
        this.address,
        consumablesTokenId[Consumables.RenameToken]
      )
    )
  }

  get renameTokenRpPrice(): number | undefined {
    const price = transformRawEther(this.getRenameTokenRpPrice())
    if (price !== undefined) {
      runInAction(() => {
        this.cachedPrice.renameTokenRpPrice = price
      })
    }
    return this.cachedPrice.renameTokenRpPrice
  }

  get reviveTokenBalance(): number | undefined {
    if (!this.address) return undefined
    return transformRawNumber(
      this.root.consumablesContractStore.balanceOf(
        this.address,
        consumablesTokenId[Consumables.ReviveToken]
      )
    )
  }

  get reviveTokenRpPrice(): number | undefined {
    const price = transformRawEther(this.getReviveTokenRpPrice())
    if (price !== undefined) {
      runInAction(() => {
        this.cachedPrice.reviveTokenRpPrice = price
      })
    }
    return this.cachedPrice.reviveTokenRpPrice
  }

  get rpCost(): number | undefined {
    if (!this.selectedConsumable) return undefined
    const cost = this[consumableCostMap[this.selectedConsumable]]
    if (cost === undefined) return undefined
    return +this.quantity * cost
  }
}
