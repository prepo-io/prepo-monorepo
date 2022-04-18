import { FC } from 'react'
import { FlatCarousel, FlatCarouselItemData } from '../carousel'
import { Intro, IntroContainer } from '../intro'
import SectionTitle from '../SectionTitle'

const items: FlatCarouselItemData[] = [
  {
    id: '2021Q3',
    caption: 'Q3 2021',
    icon: 'grow',
    title: 'Grow',
    content: (
      <>
        <span>Seed Round</span>
        <br />
        <span>Scaling Team & Community</span>
        <br />
        <span>SDK & Simulator</span>
      </>
    ),
  },
  {
    id: '2021Q4',
    caption: 'Q4 2021',
    icon: 'spanner',
    title: 'Build',
    content: (
      <>
        <span>Core Dapp Smart Contracts</span>
        <br />
        <span>Acquisition Royale</span>
        <br />
        <span>Website Relaunch</span>
        <br />
        <span>Tokenomics Design</span>
        <br />
        <span>Documentation</span>
      </>
    ),
  },
  {
    id: '2022Q1',
    caption: 'Q1 2022',
    title: 'Pre-Launch',
    icon: 'rocket-document',
    content: (
      <>
        <span>Core Dapp Audit</span>
        <br />
        <span>Whitelist & Pregen Pass</span>
        <br />
        <span>Token Smart Contracts</span>
      </>
    ),
    current: true,
  },
  {
    id: '2022Q2',
    caption: 'Q2 2022',
    icon: 'rocket',
    title: 'Launch',
    content: (
      <>
        <span>Token Contract Audits</span>
        <br />
        <span>Governance & Token Launch</span>
        <br />
        <span>Guarded Layer 2 Launch</span>
      </>
    ),
  },
  {
    id: '2022Q3',
    caption: 'Q3 2022',
    icon: 'puzzle',
    title: 'Integrate',
    content: (
      <>
        <span>Fiat On-Ramps</span>
        <br />
        <span>Leverage</span>
        <br />
        <span>Insurance</span>
        <br />
        <span>DEX Aggregators</span>
        <br />
        <span>Zaps</span>
        <br />
        <span>Gnosis Safe App</span>
      </>
    ),
  },
  {
    id: '2022Q4',
    caption: 'Q4 2022',
    icon: 'game',
    title: 'Gamify',
    content: (
      <>
        <span>Achievements</span>
        <br />
        <span>Leaderboards</span>
        <br />
        <span>Exp & Levels</span>
        <br />
        <span>Avatars</span>
        <br />
        <span>prePO Universe</span>
      </>
    ),
  },
  {
    id: 'Beyond',
    caption: 'Beyond',
    icon: 'telescope',
    title: 'Expand',
    content: (
      <>
        <span>prePO V2</span>
        <br />
        <span>prePO Pro</span>
        <br />
        <span>CEX & Broker Partnerships</span>
      </>
    ),
  },
]

export const RoadmapSection: FC = () => (
  <section className="container px-8 pt-[54px] pb-10 mx-auto max-w-[1440px] text-center sm:px-14 sm:pt-[78px] sm:pb-[92px]">
    <IntroContainer>
      <SectionTitle className="mb-9 font-semibold sm:mb-16">
        Building the future of private market access
      </SectionTitle>
      <Intro type="fadeInUp">
        <FlatCarousel items={items} />
      </Intro>
    </IntroContainer>
  </section>
)
