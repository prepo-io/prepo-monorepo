import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import styled from 'styled-components'
import ImmunityMessage from './protection/ImmunityMessage'
import MoatMessage from './protection/MoatMessage'
import Button from '../../components/Button'
import EnterpriseCarousel, { OverlayProps } from '../../components/EnterpriseCarousel'
import { useRootStore } from '../../context/RootStoreProvider'
import { spacingIncrement } from '../../utils/theme/utils'
import ConnectButton from '../connect/ConnectButton'

const Wrapper = styled.div`
  margin-top: ${spacingIncrement(20)};
  position: relative;
  width: 100%;
`
const MyEnterprises: React.FC = () => {
  const { signerStore, web3Store } = useRootStore()
  const { connected } = web3Store
  const { activeIndex, onSignerSlidesChange, signerActiveEnterprise, signerEnterprises } =
    signerStore

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

  const protectionContent = useMemo(() => {
    if (!signerActiveEnterprise) return null
    const { immune, immuneUntil, hasMoat, moatUntil } = signerActiveEnterprise
    if (!immune && !hasMoat) return null
    return (
      <>
        <ImmunityMessage immune={immune} immuneUntil={immuneUntil} />
        <MoatMessage hasMoat={hasMoat} moatUntil={moatUntil} />
      </>
    )
  }, [signerActiveEnterprise])

  return (
    <Wrapper>
      <EnterpriseCarousel
        activeIndex={activeIndex}
        contentBelowCard={protectionContent}
        enterprises={signerEnterprises}
        loading={connected && signerEnterprises === undefined}
        onActiveSlidesChange={onSignerSlidesChange}
        overlay={overlay()}
        title="Choose your Enterprise"
      />
    </Wrapper>
  )
}

export default observer(MyEnterprises)
