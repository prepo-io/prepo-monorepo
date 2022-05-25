import { formatNumber } from '@prepo-io/utils'
import { LabelWrapper } from '../Input'

const BalanceLabel: React.FC<{ balance: number }> = ({ balance }) => (
  <LabelWrapper weight="medium">
    Balance: <LabelWrapper weight="semiBold">{formatNumber(balance, { usd: true })}</LabelWrapper>
  </LabelWrapper>
)

export default BalanceLabel
