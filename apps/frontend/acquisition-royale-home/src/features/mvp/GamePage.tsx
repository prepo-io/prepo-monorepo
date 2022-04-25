import styled from 'styled-components'
import { observer } from 'mobx-react-lite'
import Acquire from './acquire'
import Compete from './actions/Compete'
import MyEnterprises from './MyEnterprises'
import Merge from './merge'
import DepositRp from './actions/DepositRp'
import WithdrawRp from './actions/WithdrawRp'
import SearchCompetition from './SearchCompetition'
import Competition from './Competition'
import Intern from './actions/Intern'
import Rename from './actions/Rename'
import Revive from './actions/Revive'
import RPShop from './actions/RPShop'
import UniswapLink from './UniswapLink'
import RemainingEnterprises from './RemainingEnterprises'
import Section from '../../components/Section'
import { spacingIncrement } from '../../utils/theme/utils'
import { useRootStore } from '../../context/RootStoreProvider'

const ActionsWrapper = styled.div`
  display: grid;
  grid-row-gap: ${spacingIncrement(60)};
  grid-template-columns: repeat(1, 1fr);
  justify-items: center;
  max-width: ${spacingIncrement(540)};
`

const GamePage: React.FC = () => {
  const { enterprisesStore } = useRootStore()
  const { enterprisesBalance } = enterprisesStore
  return (
    <div>
      <Section>
        <RemainingEnterprises />
        <Intern />
      </Section>
      <Section greyOnUnconnected title={`Your Enterprises (${enterprisesBalance ?? '...'})`}>
        <MyEnterprises />
        <ActionsWrapper>
          <Merge />
          <UniswapLink />
          <RPShop />
          <DepositRp />
          <WithdrawRp />
        </ActionsWrapper>
      </Section>
      <Section
        action={<SearchCompetition />}
        title="Competitor Analysis"
        description="Know your competition. You can analyze your competition by searching their wallet address or enterprise ID."
      >
        <Competition />
        <ActionsWrapper>
          <Compete />
          <Acquire />
          <Rename />
          <Revive />
        </ActionsWrapper>
      </Section>
    </div>
  )
}

export default observer(GamePage)
