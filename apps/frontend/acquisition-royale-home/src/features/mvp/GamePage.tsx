import styled from 'styled-components'
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
import MainTab, { TabPane } from '../../components/MainTab'
import { media } from '../../utils/theme/media'

const ActionsWrapper = styled.div`
  display: grid;
  grid-row-gap: ${spacingIncrement(60)};
  grid-template-columns: repeat(1, 1fr);
  justify-items: center;
  max-width: ${spacingIncrement(540)};
`

const CenterWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  padding-top: ${spacingIncrement(20)};
  width: 100%;
`

const Wrapper = styled.div`
  padding-bottom: ${spacingIncrement(180)};
  ${media.tablet`
    padding-bottom: ${spacingIncrement(90)};
  `}
`

const GamePage: React.FC = () => (
  <Wrapper>
    <Section>
      <RemainingEnterprises />
    </Section>
    <Section greyOnUnconnected title="Your Enterprises">
      <MyEnterprises />
    </Section>
    <MainTab centered>
      <TabPane tab="RP" key="rp">
        <CenterWrapper>
          <ActionsWrapper>
            <UniswapLink />
            <RPShop />
            <DepositRp />
            <WithdrawRp />
          </ActionsWrapper>
        </CenterWrapper>
      </TabPane>
      <TabPane tab="PLAY" key="play">
        <CenterWrapper>
          <Merge />
        </CenterWrapper>
        <Section
          action={<SearchCompetition />}
          title="Competitor Analysis"
          description="Know your competition. You can analyze your competition by searching their wallet address or enterprise ID."
        >
          <Competition />
          <ActionsWrapper>
            <Compete />
            <Acquire />
            <Revive />
          </ActionsWrapper>
        </Section>
      </TabPane>
      <TabPane tab="EARN" key="earn">
        <CenterWrapper>
          <Intern />
        </CenterWrapper>
      </TabPane>
      <TabPane tab="CUSTOMIZE" key="customize">
        <CenterWrapper>
          <Rename />
        </CenterWrapper>
      </TabPane>
    </MainTab>
  </Wrapper>
)

export default GamePage
