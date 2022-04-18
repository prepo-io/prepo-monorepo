import { Box, Link } from '@chakra-ui/layout'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { Skeleton } from '@chakra-ui/react'
import FoundingConnect from './FoundingConnect'
import FoundEnterprise from './FoundEnterprise'
import Text, { SpanText } from '../../components/Text'
import { useRootStore } from '../../context/RootStoreProvider'
import Button from '../../components/Button'
import { LETTER_SPACE_PIXEL, spacingIncrement } from '../../utils/theme/theme-utils'
import useFeatureFlag from '../../hooks/useFeatureFlag'
import { FeatureFlag } from '../../utils/feature-flags'

const Wrapper = styled.div`
  margin: ${spacingIncrement(1)};
`

const FoundingBody: React.FC = () => {
  const { web3Store, acquisitionRoyaleContractStore } = useRootStore()
  const { enabled: foundingPaused, loading } = useFeatureFlag(FeatureFlag.pauseEnterpriseFounding)
  const { foundingStatus } = acquisitionRoyaleContractStore

  if (loading || !foundingStatus) {
    return (
      <Wrapper>
        <Skeleton height="40px" />
        <Skeleton height="40px" />
      </Wrapper>
    )
  }

  if (!foundingPaused && foundingStatus === 'ongoing' && !web3Store.signerState.address) {
    return <FoundingConnect />
  }

  if (!foundingPaused && foundingStatus === 'ongoing' && web3Store.signerState.address) {
    return <FoundEnterprise />
  }

  let description = (
    <Text>
      The Founding will take place soon. Until then, we cordially invite you to join our executive
      community on{' '}
      <SpanText as="u">
        <Link isExternal href="https://url.prepo.io/discord-ar-landing">
          Discord
        </Link>
      </SpanText>{' '}
      and{' '}
      <SpanText as="u">
        <Link isExternal href="https://twitter.com/prepo_io">
          Twitter
        </Link>
      </SpanText>
      .
    </Text>
  )

  if (!foundingPaused && foundingStatus === 'completed') {
    description = (
      <Text>
        The Founding has concluded! We cordially invite you to join our executive community on{' '}
        <SpanText as="u">
          <Link isExternal href="https://url.prepo.io/discord-ar-landing">
            Discord
          </Link>
        </SpanText>{' '}
        and{' '}
        <SpanText as="u">
          <Link isExternal href="https://twitter.com/prepo_io">
            Twitter
          </Link>
        </SpanText>
        , where you can meet other players and be the first to hear about updates.
      </Text>
    )
  }

  if (foundingPaused) {
    description = (
      <Text textAlign="center">
        We are working hard to fix an issue we found. Follow the game announcements channel in our
        Discord to stay updated about when The Founding will resume.{' '}
        <SpanText display="block">Any Enterprises already minted are completely safe.</SpanText>
      </Text>
    )
  }

  return (
    <Wrapper>
      <Box
        color="brand.yang"
        fontFamily="Eurostile"
        fontSize="md"
        lineHeight="124%"
        letterSpacing={LETTER_SPACE_PIXEL}
        pb={3}
        _focus={{ outline: 'none' }}
      >
        {description}
      </Box>
      <Link isExternal href="https://url.prepo.io/discord-ar-landing">
        <Button>Join our Discord</Button>
      </Link>
    </Wrapper>
  )
}

export default observer(FoundingBody)
