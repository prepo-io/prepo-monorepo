import { Box, centered, coreDappTheme, Typography } from 'prepo-ui'
import styled from 'styled-components'
import { PositionItemSkeleton } from '../position/PositionItem'

const { Z_INDEX } = coreDappTheme

const Overlay = styled.div`
  ${centered}
  background-color: rgba(255, 255, 255, 0.7);
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: ${Z_INDEX.onboardModal};
`
const History: React.FC = () => (
  <Box position="relative">
    <PositionItemSkeleton />
    <PositionItemSkeleton />
    <PositionItemSkeleton />
    <Overlay>
      <Typography color="primary" variant="text-bold-md">
        Coming Soon
      </Typography>
    </Overlay>
  </Box>
)

export default History
