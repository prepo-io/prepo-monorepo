/* eslint-disable @typescript-eslint/no-explicit-any */
import { configure } from 'mobx'
import { BigNumber, utils } from 'ethers'
import { ERC20_UNITS } from '../../../lib/constants'

// This is needed to be able to mock mobx properties on a class
configure({ safeDescriptors: false })

const { rootStore } = global
const amountToWithdraw = 1000
const PRECT_BALANCE = 2000

describe('WithdrawStore tests', () => {
  let spyPreCTTokenBalance: jest.SpyInstance
  let spyPreCTTokenBalanceRaw: jest.SpyInstance
  beforeAll(() => {
    spyPreCTTokenBalance = jest
      .spyOn(rootStore.preCTTokenStore, 'tokenBalance', 'get')
      .mockReturnValue(PRECT_BALANCE)

    const PRECT_BALANCE_BIGNUMBER = rootStore.preCTTokenStore.parseUnits(
      `${PRECT_BALANCE}`
    ) as BigNumber

    spyPreCTTokenBalanceRaw = jest
      .spyOn(rootStore.preCTTokenStore, 'tokenBalanceRaw', 'get')
      .mockReturnValue(PRECT_BALANCE_BIGNUMBER)
  })

  afterAll(() => {
    spyPreCTTokenBalance.mockRestore()
    spyPreCTTokenBalanceRaw.mockRestore()
  })

  it('should set donation percentage to zero', () => {
    expect(rootStore.withdrawStore.donationPercentage).toBe(0)
  })

  it('should set the amount', () => {
    rootStore.withdrawStore.setWithdrawalAmount(amountToWithdraw)
    expect(rootStore.withdrawStore.withdrawalAmount).toBe(amountToWithdraw)
  })

  it('should disable button if amount is larger than balance', () => {
    rootStore.withdrawStore.setWithdrawalAmount(2000.5)
    expect(rootStore.withdrawStore.withdrawalDisabled).toBe(true)
  })

  it('should not disable button if amount is smaller than balance', () => {
    rootStore.withdrawStore.setWithdrawalAmount(100)
    expect(rootStore.withdrawStore.withdrawalDisabled).toBe(false)
  })

  describe('withdraw', () => {
    const mock: any = (): jest.Mock<void> => jest.fn()
    let spyWithdraw: jest.SpyInstance

    beforeEach(() => {
      spyWithdraw = jest.spyOn(rootStore.preCTTokenStore, 'withdraw')
      spyWithdraw.mockImplementation(mock)
      rootStore.withdrawStore.withdraw(amountToWithdraw)
    })

    afterEach(() => {
      spyWithdraw.mockRestore()
    })

    it('should call withdraw method on the collateral contract when withdrawing', () => {
      expect(rootStore.preCTTokenStore.withdraw).toHaveBeenCalledTimes(1)
    })

    it('should match same amount to withdraw to the one sent to the collateral contract', () => {
      const withdrawParameters = spyWithdraw.mock.calls[0][0]
      expect(Number(utils.formatUnits(withdrawParameters, ERC20_UNITS))).toBe(amountToWithdraw)
    })
  })
})
