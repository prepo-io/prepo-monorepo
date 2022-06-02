import { useRouter } from 'next/router'
import { parseEther } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'
import { observer } from 'mobx-react-lite'
import TransactionSummary from '../../components/TransactionSummary/TransactionSummary'
import { Callback } from '../../types/common.types'
import { useRootStore } from '../../context/RootStoreProvider'
import { balanceToNumber } from '../../utils/number-utils'
import { FEE_DENOMINATOR } from '../../lib/constants'
import { EstimatedReceivedAmount, TransactionFee } from '../definitions'

const calculateFee = (amount: BigNumber, factor: BigNumber): BigNumber =>
  amount.mul(factor).div(FEE_DENOMINATOR).add(1)

const calculateEstimatedReceivedAmount = (
  sharesForAmount: BigNumber | undefined,
  amount: number
): number => (sharesForAmount ? balanceToNumber(sharesForAmount) * amount : 0)

const DepositTransactionSummary: React.FC = () => {
  const router = useRouter()
  const { baseTokenStore, preCTTokenStore, depositStore } = useRootStore()
  const { depositing, depositHash, mintingFee, sharesForAmount, setDepositHash } = preCTTokenStore
  const { deposit, depositAmount, depositDisabled } = depositStore

  const onCancel = (): void => {
    setDepositHash(undefined)
  }

  const onComplete = (): void => {
    router.push('/markets')
  }

  const handleDeposit = async (
    successCallback: Callback,
    failedCallback: Callback<string>
  ): Promise<void> => {
    const { error } = await deposit(depositAmount)
    if (error) {
      failedCallback(error)
    } else {
      successCallback()
    }
  }

  const depositFees = mintingFee
    ? calculateFee(parseEther(`${depositAmount}`), mintingFee)
    : BigNumber.from('0')

  const depositTransactionSummary = [
    {
      label: 'Deposit Fees',
      tooltip: <TransactionFee />,
      amount: preCTTokenStore.formatUnits(depositFees),
    },
    {
      label: 'Estimated Received Amount',
      tooltip: <EstimatedReceivedAmount />,
      amount: calculateEstimatedReceivedAmount(sharesForAmount, depositAmount),
    },
  ]

  return (
    <TransactionSummary
      data={depositTransactionSummary}
      disabled={depositDisabled}
      loading={depositing}
      onCancel={onCancel}
      onComplete={onComplete}
      onConfirm={handleDeposit}
      onRetry={handleDeposit}
      transactionHash={depositHash}
      unlock={{
        amount: depositAmount,
        token: baseTokenStore,
        contentType: 'deposit',
        spenderContractName: 'preCT',
      }}
    />
  )
}

export default observer(DepositTransactionSummary)
