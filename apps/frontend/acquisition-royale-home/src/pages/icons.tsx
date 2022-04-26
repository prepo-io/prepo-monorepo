import { Row, Col } from 'antd'
import styled from 'styled-components'
import Icon from '../components/icon'
import { centered, spacingIncrement } from '../utils/theme/utils'

const IconWrapper = styled(Icon)`
  padding: ${spacingIncrement(20)};
`

const ColWrapper = styled(Col)`
  ${centered}
`

const RowWrapper = styled(Row)`
  padding: ${spacingIncrement(50)} ${spacingIncrement(10)};
`

const Icons: React.FC = () => (
  <RowWrapper>
    <Col xs={24}>
      <Row>
        <ColWrapper xs={8}>
          <IconWrapper name="logo" height="18" width="18" />
        </ColWrapper>
        <ColWrapper xs={8}>
          <IconWrapper name="logo" height="26" width="26" />
        </ColWrapper>
        <ColWrapper xs={8}>
          <IconWrapper name="logo" height="34" width="34" />
        </ColWrapper>
      </Row>
      <Row>
        <ColWrapper xs={8}>
          <IconWrapper name="discord" height="18" width="18" />
        </ColWrapper>
        <ColWrapper xs={8}>
          <IconWrapper name="discord" height="26" width="26" />
        </ColWrapper>
        <ColWrapper xs={8}>
          <IconWrapper name="discord" height="34" width="34" />
        </ColWrapper>
      </Row>
      <Row>
        <ColWrapper xs={8}>
          <IconWrapper name="twitter" height="18" width="18" />
        </ColWrapper>
        <ColWrapper xs={8}>
          <IconWrapper name="twitter" height="26" width="26" />
        </ColWrapper>
        <ColWrapper xs={8}>
          <IconWrapper name="twitter" height="34" width="34" />
        </ColWrapper>
      </Row>
      <Row>
        <ColWrapper xs={8}>
          <IconWrapper name="medium" height="18" width="18" />
        </ColWrapper>
        <ColWrapper xs={8}>
          <IconWrapper name="medium" height="26" width="26" />
        </ColWrapper>
        <ColWrapper xs={8}>
          <IconWrapper name="medium" height="34" width="34" />
        </ColWrapper>
      </Row>
      <Row>
        <ColWrapper xs={8}>
          <IconWrapper name="matic" height="18" width="18" />
        </ColWrapper>
        <ColWrapper xs={8}>
          <IconWrapper name="matic" height="26" width="26" />
        </ColWrapper>
        <ColWrapper xs={8}>
          <IconWrapper name="matic" height="34" width="34" />
        </ColWrapper>
      </Row>
      <Row>
        <ColWrapper xs={8}>
          <IconWrapper name="leftArrow" height="18" width="18" />
        </ColWrapper>
        <ColWrapper xs={8}>
          <IconWrapper name="leftArrow" height="26" width="26" />
        </ColWrapper>
        <ColWrapper xs={8}>
          <IconWrapper name="leftArrow" height="34" width="34" />
        </ColWrapper>
      </Row>
      <Row>
        <ColWrapper xs={8}>
          <IconWrapper name="rightArrow" height="18" width="18" />
        </ColWrapper>
        <ColWrapper xs={8}>
          <IconWrapper name="rightArrow" height="26" width="26" />
        </ColWrapper>
        <ColWrapper xs={8}>
          <IconWrapper name="rightArrow" height="34" width="34" />
        </ColWrapper>
      </Row>
    </Col>
  </RowWrapper>
)

export default Icons
