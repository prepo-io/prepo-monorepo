import deepEqual from 'fast-deep-equal'
import { autorun, makeAutoObservable, runInAction, toJS } from 'mobx'
import { Multicall, ContractCallContext, ContractCallReturnContext } from 'ethereum-multicall'
import { BigNumber } from 'ethers'
import { RootStore } from './RootStore'
import { getExternalContractAddress } from '../lib/external-contracts'
import config from '../lib/config'

export const EMPTY_PARAMETER = JSON.stringify([])

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContractCall = ContractCallContext<{ cb: (res: any) => void }>

function generateUniqueCallId(context: ContractCallContext): string {
  return `${context.reference}${context.calls[0].methodName}${JSON.stringify(
    context.calls[0].methodParameters
  )}`
}

// Multicall returns different bignumber implementation as ethers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeMulticallReturnValues(item: any): any {
  if (typeof item === 'object' && item.type === 'BigNumber') {
    return BigNumber.from(item.hex)
  }
  return item
}

const arrayUniqueByKey = <T>(array: T[], key: string): T[] =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [...new Map(array.map((item: any) => [item[key], item])).values()]

const bundleCalls = (calls: ContractCall[] = []): ContractCall[] => {
  const uniqueContracts = arrayUniqueByKey<ContractCall>(calls, 'contractAddress')
  const bundledContracts = uniqueContracts.map((contract) => {
    const contractCallsCompleteObjects = calls.filter(
      (call) => call.contractAddress === contract.contractAddress
    )
    const contractCalls = contractCallsCompleteObjects.map((call) => call.calls).flat()
    return {
      ...contract,
      calls: contractCalls,
    }
  })
  return bundledContracts
}

export class MulticallStore {
  root: RootStore
  calls: ContractCall[] = []
  activeCalls: Set<string> = new Set()
  multicall?: Multicall

  constructor(root: RootStore) {
    this.root = root
    makeAutoObservable(this, { calls: false })
    this.init()
  }

  init(): void {
    autorun(() => {
      const network = this.root.web3Store.network.name
      const address = getExternalContractAddress('MULTICALL2', network)
      const parameters =
        config.NETWORK === 'localhost'
          ? {
              nodeUrl: 'http://localhost:8545',
              multicallCustomContractAddress: address,
            }
          : {}

      this.multicall = new Multicall({
        ...{ parameters },
        ethersProvider: this.root.web3Store.coreProvider,
        tryAggregate: true,
      })
    })
  }

  call(): void {
    runInAction(() => {
      if (!this.multicall) throw Error('multicall must be initialized')
      const bundledCalls = bundleCalls(this.calls)
      this.multicall.call(bundledCalls).then((results) => {
        Object.values(results).forEach((res) => {
          Object.entries(res).forEach(([store, val]) => {
            const rootKey = store as keyof RootStore
            runInAction(() => {
              if (this.root[rootKey]) {
                const targetStore = this.root[rootKey]
                const typedVal = val as ContractCallReturnContext
                const calls = typedVal.callsReturnContext
                calls.forEach((call) => {
                  const targetStoreKey = call.reference
                  const paramStr = JSON.stringify(call.methodParameters)
                  const normalizedReturnValues = call.returnValues.map(
                    normalizeMulticallReturnValues
                  )
                  // If only one value to return it should not be wrapped in an array
                  const valueToSet =
                    normalizedReturnValues.length === 1
                      ? normalizedReturnValues[0]
                      : normalizedReturnValues
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  const curReturnValues = toJS(targetStore.storage[targetStoreKey][paramStr])
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  if (deepEqual(curReturnValues, valueToSet)) return
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  targetStore.storage[targetStoreKey][paramStr] = valueToSet
                })
              }
            })
          })
        })
      })
    })
  }

  addCall(context: ContractCallContext): void {
    // Check if call is already watched
    const uniqueCallId = generateUniqueCallId(context)
    if (this.activeCalls.has(uniqueCallId)) return

    // Watch call
    this.calls.push(context)
    this.activeCalls.add(uniqueCallId)
  }

  removeCall(contextToRemove: ContractCallContext): void {
    const uniqueCallIdToRemove = generateUniqueCallId(contextToRemove)
    this.activeCalls.delete(uniqueCallIdToRemove)
    this.calls = this.calls.filter(
      (context) => generateUniqueCallId(context) !== uniqueCallIdToRemove
    )
  }
}
