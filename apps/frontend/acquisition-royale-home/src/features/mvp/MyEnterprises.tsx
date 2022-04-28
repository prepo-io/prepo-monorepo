import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import Button from '../../components/Button'
import EnterpriseCard from '../../components/EnterpriseCard'
import EnterpriseCarousel, { OverlayProps } from '../../components/EnterpriseCarousel'
import { useRootStore } from '../../context/RootStoreProvider'
import { spacingIncrement } from '../../utils/theme/utils'
import ConnectButton from '../connect/ConnectButton'
import { isEnterpriseLoaded, isFirstEnterpriseLoaded } from '../../utils/enterprise-utils'
import { Enterprise } from '../../types/enterprise.types'
import LoadingCarouselCard from '../../components/LoadingCarouselCard'

const Wrapper = styled.div`
  margin: ${spacingIncrement(44)} 0;
  position: relative;
  width: 100%;
`
const MyEnterprises: React.FC = () => {
  const { signerStore, web3Store } = useRootStore()
  const { connected } = web3Store
  const { activeIndex, onSignerSlidesChange, signerEnterprises, signerActiveEnterprise } =
    signerStore

  const doneLoading = (): boolean => isFirstEnterpriseLoaded(signerEnterprises)

  const overlay = (): OverlayProps | undefined => {
    if (!connected)
      return {
        action: <ConnectButton />,
        message: 'You wallet is not connected. Connect wallet to continue.',
      }
    if (signerEnterprises !== undefined && signerEnterprises.length === 0)
      return {
        action: (
          <Button href="https://acquisitionroyale.com" target="_blank">
            Found new enterprise
          </Button>
        ),
        message: "Don't own an Enterprise? Found one here.",
      }
    return undefined
  }

  const showEnterpriseCard = (enterprise: Enterprise | undefined): React.ReactNode =>
    enterprise && isEnterpriseLoaded(enterprise) ? (
      <EnterpriseCard
        enterprise={enterprise}
        active={signerActiveEnterprise && enterprise?.id === signerActiveEnterprise?.id}
      />
    ) : (
      <LoadingCarouselCard />
    )

  return (
    <Wrapper>
      <EnterpriseCarousel
        activeIndex={activeIndex}
        enterprises={
          doneLoading()
            ? signerEnterprises?.map((enterprise) => ({
                id: enterprise.id,
                component: showEnterpriseCard(enterprise),
              }))
            : undefined
        }
        loading={connected && signerEnterprises === undefined}
        onActiveSlidesChange={onSignerSlidesChange}
        overlay={overlay()}
        title="Choose your Enterprise"
      />
    </Wrapper>
  )
}

export default observer(MyEnterprises)
