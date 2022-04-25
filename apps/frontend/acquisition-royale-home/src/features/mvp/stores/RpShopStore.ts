import { ButtonProps } from 'antd'
import { RootStore } from '../../../stores/RootStore'
import { Consumables } from '../../../types/consumables.type'
import {
  getCorrectConsumableBalance,
  INSUFFICIENT_RP,
  LOADING,
  makeRPCostBalance,
  WALLET_BALANCE,
} from '../../../utils/common-utils'
import { CostBalance } from '../ActionCard'
import { ComparisonProps } from '../StatsComparison'

export class RpShopStore {
  root: RootStore
  constructor(root: RootStore) {
    this.root = root
  }

  get rpShopBalances(): CostBalance[] {
    const { balance } = this.root.runwayPointsContractStore
    return [makeRPCostBalance(balance || 0)]
  }

  get rpShopButtonProps(): ButtonProps {
    const { balance } = this.root.runwayPointsContractStore
    const { insufficientSupply, quantity, needsApproval, rpCost, selectedConsumable } =
      this.root.acquisitionRoyaleRPShopContractStore
    if (!selectedConsumable) {
      return { disabled: true, children: 'Select an item to purchase' }
    }
    if (+quantity <= 0) {
      return { disabled: true, children: 'Please enter valid amount' }
    }
    if (rpCost === undefined || balance === undefined || insufficientSupply === undefined) {
      return LOADING
    }
    if (insufficientSupply) {
      return { disabled: true, children: 'Not enough supply available!' }
    }
    if (rpCost > balance) {
      return { disabled: true, children: INSUFFICIENT_RP }
    }
    if (needsApproval) {
      return { children: 'Approve RP' }
    }
    let actionText = 'Purchase'
    if (selectedConsumable === Consumables.Enterprise) {
      actionText = 'Found'
    }
    return {
      children: `${actionText} ${quantity} ${selectedConsumable} for ${rpCost.toFixed(2)} RP`,
    }
  }

  get rpShopComparisons(): ComparisonProps[] | undefined {
    const { balance } = this.root.runwayPointsContractStore
    const { rebrandBalance, renameBalance, reviveBalance } = this.root.consumablesContractStore
    const { enterprisesBalance } = this.root.enterprisesStore
    const { quantity, rpCost, selectedConsumable } = this.root.acquisitionRoyaleRPShopContractStore
    if (!selectedConsumable || balance === undefined || rpCost === undefined) return undefined
    const { name, balance: consumableBalance } = getCorrectConsumableBalance(selectedConsumable, {
      enterprisesBalance,
      rebrandBalance,
      renameBalance,
      reviveBalance,
    })
    if (consumableBalance === undefined) return undefined
    return [
      {
        id: 0,
        name,
        stats: [{ after: consumableBalance + +quantity, before: consumableBalance }],
      },
      {
        id: 1,
        name: WALLET_BALANCE,
        stats: [
          {
            after: balance - rpCost,
            formatAfter: (after): string => after.toFixed(2),
            before: balance,
          },
        ],
      },
    ]
  }

  get rpShopCosts(): CostBalance[] | undefined {
    const { rpCost } = this.root.acquisitionRoyaleRPShopContractStore
    if (rpCost === undefined) return undefined
    return [makeRPCostBalance(rpCost)]
  }
}
