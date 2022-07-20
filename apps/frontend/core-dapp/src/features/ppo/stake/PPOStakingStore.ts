import { BigNumber } from 'ethers'
import { action, makeObservable, observable, reaction, runInAction } from 'mobx'
import { ContractReturn, Factory } from 'prepo-stores'
import { PPOStakingAbi, PPOStakingAbi__factory } from '../../../../generated/typechain'
import { BalanceStructOutput } from '../../../../generated/typechain/PPOStakingAbi'
import { Erc20Store } from '../../../stores/entities/Erc20.entity'
import { RootStore } from '../../../stores/RootStore'

type Stake = PPOStakingAbi['functions']['stake']
type BalanceData = PPOStakingAbi['functions']['balanceData']

// use this key to store balance in localStorage, while there's no SC
const MOCK_KEY = 'MOCK_BALANCE_DATA'

const TOKEN_SYMBOL = 'PPO_STAKING'

// Storing data in localStorage - will allow us to test withdraw/startCooldown functionality
function getMockedBalance(address: string): BalanceStructOutput | undefined {
  const data = localStorage.getItem(MOCK_KEY)
  if (!data) return undefined
  const parsedData = JSON.parse(data) as { [key: string]: BalanceStructOutput }
  return parsedData[address]
}

export class PPOStakingStore extends Erc20Store {
  staking = false
  stakingHash?: string
  mockRawBalance?: BigNumber
  constructor(root: RootStore) {
    super({ root, tokenName: TOKEN_SYMBOL, factory: PPOStakingAbi__factory as unknown as Factory })
    this.symbolOverride = TOKEN_SYMBOL
    makeObservable(this, {
      staking: observable,
      stakingHash: observable,
      stake: action.bound,
      mockRawBalance: observable,
      getBalanceData: observable,
    })
    this.subscribe()
  }

  // eslint-disable-next-line class-methods-use-this
  getBalanceData(...params: Parameters<BalanceData>): ContractReturn<BalanceData> {
    // return this.call<BalanceData>('balanceData', params)
    // Once SC is implemented uncomment above line, and remove lines below
    const balance = getMockedBalance(params[0])
    if (!balance) return undefined
    return [balance]
  }

  get balanceData(): BalanceStructOutput | undefined {
    const { address } = this.root.web3Store
    if (!address) {
      return undefined
    }
    const result = this.getBalanceData(address)
    if (result === undefined) return undefined
    return result[0]
  }

  async stake(amount: number): Promise<{ success: boolean; error?: string }> {
    try {
      runInAction(() => {
        this.staking = true
        this.stakingHash = undefined
      })
      const { address } = this.root.web3Store
      if (!address) {
        return {
          success: false,
          error: 'wallet is not connected',
        }
      }
      // const { hash, wait } = await this.sendTransaction<Stake>('stake', [address, amount])
      // Once SC is implemented uncomment above line, and remove lines below
      const mockStakeCall = (
        params: Parameters<Stake>
      ): Promise<{ hash: string; wait: () => Promise<void> }> =>
        Promise.resolve({
          hash: 'SOME_MOCKED_HASH',
          wait: () => {
            const balance = getMockedBalance(address)
            const hexAmount = BigNumber.from(params[1])
            if (balance) {
              const record = { raw: BigNumber.from(balance.raw).add(hexAmount) }
              const map = JSON.parse(localStorage.getItem(MOCK_KEY) ?? '{}')
              map[address] = record
              localStorage.setItem(MOCK_KEY, JSON.stringify(map))
            } else {
              localStorage.setItem(MOCK_KEY, JSON.stringify({ [address]: { raw: hexAmount } }))
            }
            return Promise.resolve()
          },
        })
      const { hash, wait } = await mockStakeCall([address, amount])
      runInAction(() => {
        this.stakingHash = hash
      })
      await wait()
      return {
        success: true,
      }
    } catch (error) {
      this.root.toastStore.errorToast(`Error calling stake`, error)
      return {
        success: false,
        error: (error as Error).message,
      }
    } finally {
      runInAction(() => {
        this.staking = false
      })
    }
  }

  subscribe(): void {
    // once there's SC - we don't need this subscription
    reaction(
      () => this.root.web3Store.address,
      (address) => {
        if (!address) return
        try {
          const balance = getMockedBalance(address)
          runInAction(() => {
            this.mockRawBalance = balance?.raw
          })
        } catch (error) {
          this.root.toastStore.errorToast(`Bad data`, error)
        }
      }
    )
  }
}
