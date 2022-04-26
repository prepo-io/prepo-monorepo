import { action, makeObservable } from 'mobx'
import { ContractStore } from '@prepo-io/stores'
import { RootStore } from './RootStore'
import { ContractReturn } from './utils/class-utils'
import { InternAbi as Intern, InternAbi__factory } from '../../generated'
import { transformRawEther, transformRawNumber } from '../utils/number-utils'
import { SupportedContracts } from '../lib/supported-contracts'

type DoTask = Intern['functions']['doTask']
type GetClaimDelay = Intern['functions']['getClaimDelay']
type GetGlobalRpClaimedToday = Intern['functions']['getGlobalRpClaimedToday']
type GetGlobalRpLimitPerDay = Intern['functions']['getGlobalRpLimitPerDay']
type GetLastClaimTime = Intern['functions']['getLastClaimTime']
type GetRpPerInternPerDay = Intern['functions']['getRpPerInternPerDay']
type GetTasksCompletedToday = Intern['functions']['getTasksCompletedToday']
type GetTasksPerDay = Intern['functions']['getTasksPerDay']

export class InternContractStore extends ContractStore<RootStore, SupportedContracts> {
  constructor(root: RootStore) {
    super(root, 'INTERN', InternAbi__factory)
    makeObservable(this, { doTask: action.bound })
  }

  async doTask(): Promise<boolean | undefined> {
    const { setDoingTask, shuffleTask } = this.root.internStore
    try {
      setDoingTask(true)
      const tx = await this.sendTransaction<DoTask>('doTask', [])
      await tx.wait()
      shuffleTask()
      return true
    } catch (error) {
      this.root.toastStore.errorToast('doTask', error)
      return false
    } finally {
      setDoingTask(false)
    }
  }

  getClaimDelay(...params: Parameters<GetClaimDelay>): ContractReturn<GetClaimDelay> {
    return this.call<GetClaimDelay>('getClaimDelay', params)
  }

  getGlobalRPClaimedToday(
    ...params: Parameters<GetGlobalRpClaimedToday>
  ): ContractReturn<GetGlobalRpClaimedToday> {
    return this.call<GetGlobalRpClaimedToday>('getGlobalRpClaimedToday', params)
  }

  getGlobalRPLimitPerDay(
    ...params: Parameters<GetGlobalRpLimitPerDay>
  ): ContractReturn<GetGlobalRpLimitPerDay> {
    return this.call<GetGlobalRpLimitPerDay>('getGlobalRpLimitPerDay', params)
  }

  getLastClaimTime(...params: Parameters<GetLastClaimTime>): ContractReturn<GetLastClaimTime> {
    return this.call<GetLastClaimTime>('getLastClaimTime', params)
  }

  getRpPerInternPerDay(
    ...params: Parameters<GetRpPerInternPerDay>
  ): ContractReturn<GetRpPerInternPerDay> {
    return this.call<GetRpPerInternPerDay>('getRpPerInternPerDay', params)
  }

  getTasksCompletedToday(
    ...params: Parameters<GetTasksCompletedToday>
  ): ContractReturn<GetTasksCompletedToday> {
    return this.call<GetTasksCompletedToday>('getTasksCompletedToday', params)
  }

  getTasksPerDay(...params: Parameters<GetTasksPerDay>): ContractReturn<GetTasksPerDay> {
    return this.call<GetTasksPerDay>('getTasksPerDay', params)
  }

  get claimDelay(): number | undefined {
    return transformRawNumber(this.getClaimDelay())
  }

  get globalRpClaimedToday(): number | undefined {
    return transformRawEther(this.getGlobalRPClaimedToday())
  }

  get globalRpLimitPerDay(): number | undefined {
    return transformRawEther(this.getGlobalRPLimitPerDay())
  }

  get lastClaimTime(): number | undefined {
    const { address } = this.root.web3Store
    if (address === undefined) return undefined
    return transformRawNumber(this.getLastClaimTime(address))
  }

  get lastTask(): boolean | undefined {
    if (this.tasksCompletedToday === undefined || this.tasksPerDay === undefined) return undefined
    return this.tasksCompletedToday + 1 === this.tasksPerDay
  }

  get rpPerInternPerDay(): number | undefined {
    return transformRawEther(this.getRpPerInternPerDay())
  }

  get tasksCompletedToday(): number | undefined {
    const { address } = this.root.web3Store
    if (address === undefined) return undefined
    return transformRawNumber(this.getTasksCompletedToday(address))
  }

  get tasksPerDay(): number | undefined {
    return transformRawNumber(this.getTasksPerDay())
  }

  get rpBalance(): number | undefined {
    if (!this.address) return undefined
    return transformRawEther(this.root.runwayPointsContractStore.balanceOf(this.address))
  }
}
