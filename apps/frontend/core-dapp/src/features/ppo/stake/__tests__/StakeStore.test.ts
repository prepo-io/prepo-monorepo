/**
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { configure } from 'mobx'

// This is needed to be able to mock mobx properties on a class
configure({ safeDescriptors: false })

const { rootStore } = global
const PPO_BALANCE = 2000

let spyInstance: jest.SpyInstance

beforeAll(() => {
  spyInstance = jest
    .spyOn(rootStore.ppoTokenStore, 'tokenBalance', 'get')
    .mockReturnValue(PPO_BALANCE)
})

afterAll(() => {
  spyInstance.mockRestore()
})

describe('StakeStore tests', () => {
  it('should have proper state after input changes', () => {
    const value = 100
    rootStore.stakeStore.setCurrentStakingValue(value)
    expect(rootStore.stakeStore.currentStakingValue).toBe(value)
  })

  it('should allow to stake', async () => {
    rootStore.stakeStore.setCurrentStakingValue(100)
    const result = await rootStore.stakeStore.stake()
    expect(result).toStrictEqual({ success: true })
  })

  it('should NOT allow to stake', async () => {
    const value = PPO_BALANCE + 100
    rootStore.stakeStore.setCurrentStakingValue(value)
    const result = await rootStore.stakeStore.stake()
    expect(result).toStrictEqual({ success: false })
  })

  it('should verify input value and do nothing if value is more than balance', () => {
    const value = PPO_BALANCE + 100
    rootStore.stakeStore.setCurrentStakingValue(value)
    expect(rootStore.stakeStore.currentStakingValue).toBe(value)
  })

  it('should verify input value and do nothing if value is less than balance', () => {
    const value = PPO_BALANCE - 100
    rootStore.stakeStore.setCurrentStakingValue(value)
    expect(rootStore.stakeStore.currentStakingValue).toBe(value)
  })

  it('should set isCurrentStakingValueValid to false when currentStakingValue is 0', () => {
    rootStore.stakeStore.setCurrentStakingValue(0)
    expect(rootStore.stakeStore.isCurrentStakingValueValid).toBe(false)
  })

  it('should set isCurrentStakingValueValid to true when currentStakingValue is NOT 0', () => {
    rootStore.stakeStore.setCurrentStakingValue(200)
    expect(rootStore.stakeStore.isCurrentStakingValueValid).toBe(true)
  })
})
