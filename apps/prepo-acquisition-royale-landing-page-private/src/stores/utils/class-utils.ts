import { ContractCallContext } from 'ethereum-multicall'
import { onBecomeUnobserved, runInAction, toJS } from 'mobx'
import { RootStore } from '../RootStore'

type PromiseResolvedType<T> = T extends Promise<infer R> ? R : never
type ArrayResolvedType<T> = T extends Array<infer R> ? R : never

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ContractReturnType<T> = T extends (...args: any) => any
  ? ArrayResolvedType<PromiseResolvedType<ReturnType<T>>>
  : never

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ContractReturnTypeArray<T> = T extends (...args: any) => any
  ? PromiseResolvedType<ReturnType<T>>
  : never

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ContractGetterReturnType<T> = T extends (...args: any) => any
  ? [false, ArrayResolvedType<PromiseResolvedType<ReturnType<T>>>] | [true, undefined]
  : never

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ContractGetterReturnTypeArray<T> = T extends (...args: any) => any
  ? [false, PromiseResolvedType<ReturnType<T>>] | [true, undefined]
  : never

export interface ContractStore {
  reference: string
  address?: string
  root: RootStore
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contract?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abi: any[]
  storage: {
    [type: string]: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [params: string]: any
    }
  }
}

type FetchOptions = {
  subscribe: boolean
}

export const fetch = <Params extends Array<unknown>, Return>(
  self: ContractStore,
  methodName: string,
  params: Params,
  options: FetchOptions = { subscribe: true }
): [false, Return] | [true, undefined] => {
  const paramStr = JSON.stringify(params)

  // Init storageProperty if required
  runInAction(() => {
    // eslint-disable-next-line no-param-reassign
    if (!self.storage[methodName]) self.storage[methodName] = {}
  })

  // If cached, return cached
  const cur = self.storage[methodName][paramStr]
  if (cur !== undefined) return [false, toJS(cur)]

  // Logic to execute after we get the initial value
  const onFirstSet = (res: Return): void => {
    runInAction(() => {
      // Set the value
      // eslint-disable-next-line no-param-reassign
      self.storage[methodName][paramStr] = res

      if (options.subscribe) {
        // Automatically get updates for this value with the multicall,
        // and set up removing the call when this call becomes unobserved
        if (!self.address) throw Error(`contract ${self.reference} not initialized`)
        const call: ContractCallContext = {
          reference: self.reference,
          contractAddress: self.address,
          abi: self.abi,
          calls: [{ reference: methodName, methodName, methodParameters: params }],
        }
        self.root.multicallStore.addCall(call)
        onBecomeUnobserved(self.storage[methodName], paramStr, () => {
          self.root.multicallStore.removeCall(call)
          // eslint-disable-next-line no-param-reassign
          delete self.storage[methodName][paramStr]
        })
      }
    })
  }

  // Make first call to SC to get the value
  self.contract[methodName](...params).then(onFirstSet)

  return [true, undefined]
}
