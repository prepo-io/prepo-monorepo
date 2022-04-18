import { ReactElement } from 'react'
import { Skeleton } from '@chakra-ui/react'
import styled from 'styled-components'
import { LETTER_SPACE_PIXEL } from '../../utils/theme/theme-utils'

const InformationSection = styled.div<{ align: 'right' | 'left' }>`
  letter-spacing: ${LETTER_SPACE_PIXEL};
  text-align: ${({ align }): string => align};
`

const InformationSectionTitle = styled.div`
  color: #f3d29d;
  font-family: 'Eurostile';
  font-weight: 700;
`

const InformationSectionDescription = styled.div`
  color: #ffffff;
  font-family: 'Eurostile';
`

const FoundingInformationSection: React.FC<{
  align: 'right' | 'left'
  title: string
  description: ReactElement | string | undefined
  tooltip?: string
  isLoaded: boolean
}> = ({ align, title, description, tooltip, isLoaded = false }) => (
  <InformationSection align={align}>
    <InformationSectionTitle>
      {title} {tooltip}
    </InformationSectionTitle>
    <Skeleton isLoaded={isLoaded}>
      <InformationSectionDescription>{description}</InformationSectionDescription>
    </Skeleton>
  </InformationSection>
)

export default FoundingInformationSection
