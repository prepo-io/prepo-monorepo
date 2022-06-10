import styled from 'styled-components'
import categories from './categories'
import RemainingEnterprises from './RemainingEnterprises'
import Section from '../../components/Section'
import { spacingIncrement } from '../../utils/theme/utils'
import MainTab, { TabPane } from '../../components/MainTab'
import { media } from '../../utils/theme/media'
import Subtabs from '../../components/Subtabs'

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

const GamePage: React.FC = () => {
  const subtabsList = categories
    .filter(({ subtabs }) => subtabs !== undefined)
    .map(({ tab }) => tab)

  return (
    <Wrapper>
      <Section>
        <RemainingEnterprises />
      </Section>
      <MainTab subtabs={subtabsList} defaultActiveKey={subtabsList[0]} centered>
        {categories.map(({ tab, content, subtabs }) => (
          <TabPane tab={tab} key={tab}>
            {subtabs && <Subtabs subtabs={subtabs} />}
            {content && <CenterWrapper>{content}</CenterWrapper>}
          </TabPane>
        ))}
      </MainTab>
    </Wrapper>
  )
}

export default GamePage