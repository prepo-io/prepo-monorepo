import { Link } from '@chakra-ui/react'
import Text, { SpanText } from './components/Text'
import { SectionsEnum } from './features/landing-page/sections/SectionStore'

export const gameplayData = [
  {
    title: 'Runway',
    description: (
      <>
        <Text>Bolster your budget through the power of recurring revenue streams.</Text>
        <br />
        <Text>
          Amass <SpanText>Runway Points (RP)</SpanText> automatically over time to compete with and
          acquire other <SpanText>Enterprises</SpanText>, or to defend yours from acquisition.
        </Text>
      </>
    ),
  },
  {
    title: 'Merge',
    description: (
      <>
        <Text>Fortify your competitive advantage through synergetic efficiencies.</Text>
        <br />
        <Text>
          Voluntarily merge two of your <SpanText>Enterprises</SpanText> together to earn{' '}
          <SpanText>RP</SpanText> at an accelerated rate and combine your <SpanText>RP</SpanText>{' '}
          balances.
        </Text>
      </>
    ),
  },
  {
    title: 'Compete',
    description: (
      <>
        <Text>Disrupt the market share of your rivals.</Text>
        <br />
        <Text>
          Spend <SpanText>RP</SpanText> to reduce the <SpanText>RP</SpanText> of other{' '}
          <SpanText>Enterprises</SpanText>, making them more vulnerable to an acquisition.
        </Text>
      </>
    ),
  },
  {
    title: 'Acquire',
    description: (
      <>
        <Text>Consolidate your empire through a hostile takeover of your adversaries.</Text>
        <br />
        <Text>
          Forcibly acquire a <SpanText>zero-RP</SpanText> <SpanText>Enterprise</SpanText> to earn{' '}
          <SpanText>RP</SpanText> at an accelerated rate.
        </Text>
      </>
    ),
    phrases: [],
  },
  {
    title: 'Fundraise',
    description: (
      <>
        <Text>Need ammunition for hypergrowth?</Text>
        <br />
        <Text>
          Boost your <SpanText>RP</SpanText> balance by spending <SpanText>MATIC</SpanText>.
        </Text>
      </>
    ),
  },
  {
    title: 'Rename',
    description: (
      <>
        <Text>Is it vanity, or normative destiny?</Text>
        <br />
        <Text>
          Consume a{' '}
          <SpanText as="u">
            <Link
              isExternal
              href="https://opensea.io/assets/matic/0x1e51b9d22d5bdb84cc39a020955c01ec39a29b57/0"
            >
              Rename Token
            </Link>
          </SpanText>{' '}
          to change your <SpanText>Enterprise&apos;s</SpanText> name.
        </Text>
      </>
    ),
  },
  {
    title: 'Rebrand',
    description: (
      <>
        <Text>Communicate your corporate positioning with a revitalized appearance.</Text>
        <br />
        <Text>
          Consume a{' '}
          <SpanText as="u">
            <Link
              isExternal
              href="https://opensea.io/assets/matic/0x1e51b9d22d5bdb84cc39a020955c01ec39a29b57/1"
            >
              Rebrand Token
            </Link>
          </SpanText>{' '}
          to change your <SpanText>Enterprise&apos;s</SpanText> image.
        </Text>
      </>
    ),
  },
  {
    title: 'Revive',
    description: (
      <>
        <Text>Bail out a distressed entity and restore it to its former glory.</Text>
        <br />
        <Text>
          Consume a{' '}
          <SpanText as="u">
            <Link
              isExternal
              href="https://opensea.io/assets/matic/0x1e51b9d22d5bdb84cc39a020955c01ec39a29b57/2"
            >
              Revive Token
            </Link>
          </SpanText>{' '}
          to take ownership of a bankrupt <SpanText>Enterprise</SpanText>.
        </Text>
      </>
    ),
  },
]

export const featuresData = [
  {
    title: 'Play-to-Earn',
    description: (
      <>
        <Text>
          Earn RP (ERC-20 tokens), and even Enterprises (ERC-721 NFTs), through playing, surviving,
          topping leaderboards, and participating in the community.
        </Text>
        <br />
        <Text>As fully-composable tokens, you can then trade these in secondary markets!</Text>
      </>
    ),
  },
  {
    title: 'Endorsed by prePO',
    description: (
      <Text>
        As a game presented by{' '}
        <SpanText as="u">
          <Link isExternal href="https://prepo.io/">
            prePO
          </Link>
        </SpanText>{' '}
        - a DeFi project with reputable backers, non-anon founder, and recipient of a{' '}
        <SpanText>Polygon Ecosystem Grant</SpanText> - players can feel assured that the game will
        have staying power, including integrations with prePO itself.
      </Text>
    ),
  },
  {
    title: 'Community Led',
    description: (
      <Text>
        Enterprise owners will help decide future roadmap items, gameplay balance adjustments, and
        which interpretative artworks are approved to represent their Enterprises.
      </Text>
    ),
  },
  {
    title: 'Evolving Ecosystem',
    description: (
      <Text>
        Through the <SpanText>Acquisition Royale Grants Program</SpanText>, builders and creatives
        will be incentivized to integrate with and extend upon the game’s ecosystem.
      </Text>
    ),
  },
  {
    title: 'Deflationary Supply',
    description: (
      <>
        <Text>
          As a battle royale game, Enterprises will be burnt through gameplay, meaning Enterprises
          will become increasingly rare over time.
        </Text>
        <br />
        <Text>
          Similarly, burning mechanics also deflate the supply of RP and Rename/Rebrand/Revive
          Tokens.
        </Text>
      </>
    ),
  },
  {
    title: 'Dynamic Difficulty and Pricing',
    description: (
      <>
        <Text>
          As the number of remaining Enterprises falls, the difficulty of acquiring them increases.
        </Text>
        <br />
        <Text>
          Similarly, MATIC prices adjust dynamically to find a fair price for each action.
        </Text>
      </>
    ),
  },
  {
    title: 'Earn Your Rarity',
    description: (
      <Text>
        Unlike other projects where your rarity is assigned by luck of the draw, Enterprises start
        on even grounds and earn their rarity over time through gameplay and strategy.
      </Text>
    ),
  },
  {
    title: 'No Gas Fees',
    description: (
      <Text>
        By launching on the <SpanText>Polygon Network</SpanText>, players can enjoy much faster and
        cheaper transactions.
      </Text>
    ),
  },
]

export const navigationArr = [
  {
    key: SectionsEnum.FOUNDING,
    label: 'Founding',
  },
  {
    key: SectionsEnum.INTRO,
    label: 'Intro',
  },
  {
    key: SectionsEnum.GAMEPLAY,
    label: 'Gameplay',
  },
  {
    key: SectionsEnum.FEATURES,
    label: 'Features',
  },
  {
    key: SectionsEnum.FAQ,
    label: 'FAQ',
  },
]

export const faqs = [
  {
    title: 'What is an NFT?',
    description: (
      <Text>
        NFT stands for “Non-Fungible Token”, and basically it’s a unique digital item stored on the
        blockchain that can be owned and traded - for example, the Enterprises in Acquisition
        Royale!
      </Text>
    ),
  },
  {
    title: 'How do I play?',
    description: (
      <>
        <Text>To play Acquisition Royale, you will need:</Text>
        <Text>&nbsp;&nbsp;&nbsp;&nbsp;- a crypto wallet that supports Polygon (e.g. MetaMask)</Text>
        <Text>
          &nbsp;&nbsp;&nbsp;&nbsp;- MATIC on Polygon (for the auction, gameplay actions, and
          transaction fees)
        </Text>
        <br />
        <Text>
          You can follow our{' '}
          <SpanText as="u">
            <Link
              isExternal
              href="https://medium.com/prepo/setting-up-metamask-and-getting-eth-matic-on-polygon-step-by-step-guide-fd55147a0f05"
            >
              step-by-step guide
            </Link>
          </SpanText>{' '}
          for the best ways to get MATIC onto your Polygon wallet.
        </Text>
        <br />
        <Text>
          Once you’ve prepared the above, you’re ready to participate in The Founding (to claim an
          Enterprise) and the game itself (after The Founding concludes).
        </Text>
        <br />
        <Text>
          To understand how the game works, please read through this website and these FAQs! If you
          have any further questions, feel free to ask us in{' '}
          <SpanText as="u">
            <Link isExternal href="https://url.prepo.io/discord-ar-landing">
              Discord
            </Link>
          </SpanText>
          .
        </Text>
      </>
    ),
  },
  {
    title: 'What is prePO?',
    description: (
      <Text>
        <SpanText as="u">
          <Link isExternal href="https://prepo.io/">
            prePO
          </Link>
        </SpanText>{' '}
        is an upcoming decentralized trading platform allowing anyone, anywhere to gain exposure to
        the upside or downside of any pre-IPO company or pre-token crypto project.
      </Text>
    ),
  },
  {
    title: 'Why is prePO building an NFT game?',
    description: (
      <>
        <Text>
          Gamification is core to the vision for the prePO platform, as it will make the trading
          experience more accessible and fun.
        </Text>
        <br />
        <Text>
          We not only wanted to create an engaging and experimental blockchain game that stands on
          its own, but also one that attracts users from various NFT and crypto gaming communities
          and gets them excited about the prePO platform.
        </Text>
      </>
    ),
  },
  {
    title: 'What are Enterprises?',
    description: (
      <>
        <Text>
          Each Enterprise NFT represents a player within this experimental battle royale game.
        </Text>
        <br />
        <Text>
          Enterprises automatically accumulate Runway Points (RP), and can perform the following
          gameplay actions: Merge, Compete, Acquire, Fundraise, Rename, and Rebrand.
        </Text>
      </>
    ),
  },
  {
    title: 'How do I get an Enterprise?',
    description: (
      <>
        <Text>
          You can mint an Enterprise through <SpanText>The Founding</SpanText> (start date to be
          announced).
        </Text>
        <br />
        <Text>
          You can also win Enterprises through topping leaderboards and active community
          participation (make sure to join our{' '}
          <SpanText as="u">
            <Link isExternal href="https://url.prepo.io/discord-ar-landing">
              Discord
            </Link>
          </SpanText>{' '}
          and{' '}
          <SpanText as="u">
            <Link isExternal href="https://twitter.com/AcqRoyale">
              Twitter
            </Link>
          </SpanText>{' '}
          community).
        </Text>
      </>
    ),
  },
  {
    title: 'What is the initial distribution of Enterprises?',
    description: (
      <>
        <Text>
          At the start of the game, there are <SpanText>15k Enterprises</SpanText>:
        </Text>
        <Text>
          &nbsp;&nbsp;&nbsp;&nbsp;- 5k given out for free to owners of various NFT projects
        </Text>
        <Text>&nbsp;&nbsp;&nbsp;&nbsp;- 9k purchasable for 15 MATIC each</Text>
        <Text>
          &nbsp;&nbsp;&nbsp;&nbsp;- 1k reserved for collaborations, influencers, contributors,
          competitions, and giveaways
        </Text>
        <br />
        <Text>
          Of course, since this is a battle royale game, the number of Enterprises will fall over
          time, meaning surviving Enterprises will become rarer over time.
        </Text>
      </>
    ),
  },
  {
    title: 'How do I buy an Enterprise NFT?',
    description: (
      <>
        <Text>
          9k Enterprises can be purchased for a fixed price of <SpanText>15 MATIC</SpanText>.
        </Text>
        <br />
        <Text>
          The sale ends once all Enterprises have been purchased. However, the game can start before
          the end of the sale.
        </Text>
        <br />
        <Text>
          There is no limit to the total number of Enterprises that can be claimed by an address,
          and there is no limit (besides gas limits) to how many Enterprises can be claimed within a
          single transaction.
        </Text>
      </>
    ),
  },
  {
    title: 'When does the game start?',
    description: (
      <>
        <Text>
          The game will commence once enough Enterprises have been distributed (e.g. 5000+), as this
          important in order to achieve the optimal battle royale gameplay experience!
        </Text>
        <br />
        <Text>
          Prior to the game’s commencement, no gameplay actions can be performed and no RP will be
          accumulated.
        </Text>
      </>
    ),
  },
  {
    title: 'When does the game end?',
    description: (
      <Text>
        The game never strictly ends; however, due to the game’s Dynamic Difficulty mechanism, it
        will become increasingly difficult for acquisitions to occur, so the supply of Enterprises
        is likely to stabilize at some number in the later stages of the game.
      </Text>
    ),
  },
  {
    title: 'How do I get more Runway Points (RP)?',
    description: (
      <>
        <Text>
          Runway Points (RP) are automatically accumulated to the balance of each Enterprise every
          block. Each Enterprise can earn RP at an even faster rate by performing more{' '}
          <SpanText>Merger</SpanText> and <SpanText>Acquisition</SpanText> actions (note: there is
          initially a cap on the amount of RP earnable per Enterprise per day, to prevent individual
          Enterprises from becoming too powerful too quickly).
        </Text>
        <br />
        <Text>
          Enterprises can also perform a <SpanText>Fundraise</SpanText> action, where new RP can be
          purchased directly from the smart contracts for a dynamic price (based upon supply and
          demand).
        </Text>
        <br />
        <Text>
          RP may also be earned through community giveaways and contests, or by placing strongly
          within game leaderboards.
        </Text>
        <br />
        <Text>
          Finally, as fully-fungible ERC-20 tokens, secondary markets may also exist for the trading
          of RP.
        </Text>
      </>
    ),
  },
  {
    title: 'How do I get a Rename/Rebrand/Revive Token?',
    description: (
      <>
        <Text>
          Rename/Rebrand/Revive Tokens (ERC-1155) can be purchased from{' '}
          <SpanText as="u">
            <Link isExternal href="https://opensea.io/collection/acquisition-royale-consumables">
              OpenSea
            </Link>
          </SpanText>{' '}
          or via community participation and giveaways .
        </Text>
        <br />
        <Text>These consumable tokens are in strictly limited supply:</Text>
        <Text>&nbsp;&nbsp;&nbsp;&nbsp;- 10k Rename Tokens</Text>
        <Text>&nbsp;&nbsp;&nbsp;&nbsp;- 1k Rebrand Tokens</Text>
        <Text>&nbsp;&nbsp;&nbsp;&nbsp;- 100 Revive Tokens</Text>
        <br />
        <Text>
          These tokens are burnt upon use, so they will become increasingly rare over time.
        </Text>
      </>
    ),
  },
  {
    title: 'How do I rename my Enterprise?',
    description: (
      <>
        <Text>
          Each Enterprise starts with a default name (“Enterprise #number”), but can be renamed by
          burning 1x{' '}
          <SpanText as="u">
            <Link
              isExternal
              href="https://opensea.io/assets/matic/0x1e51b9d22d5bdb84cc39a020955c01ec39a29b57/0"
            >
              Rename Token
            </Link>
          </SpanText>
          .
        </Text>
        <br />
        <Text>Names must meet the following requirements to be considered valid:</Text>
        <Text>&nbsp;&nbsp;&nbsp;&nbsp;- Must be unique</Text>
        <Text>&nbsp;&nbsp;&nbsp;&nbsp;- Max 20 characters</Text>
        <Text>&nbsp;&nbsp;&nbsp;&nbsp;- Only letters or spaces</Text>
        <Text>&nbsp;&nbsp;&nbsp;&nbsp;- Cannot start or end with a space</Text>
        <Text>&nbsp;&nbsp;&nbsp;&nbsp;- No consecutive spaces</Text>
        <br />
        <Text>The team and community can decide to remove offensive names.</Text>
      </>
    ),
  },
  {
    title: 'What does the artwork look like?',
    description: (
      <>
        <Text>
          Acquisition Royal provides initial fully-on-chain artwork (‘branding’) for each Enterprise
          which dynamically updates based on your Enterprise’s gameplay stats.
        </Text>
        <br />
        <Text>
          However, the community can vote-in support for additional interpretive artwork to
          represent the Enterprises, meaning each Enterprise could have multiple brandings to
          rebrand to.
        </Text>
      </>
    ),
  },
  {
    title: 'How does rebranding work?',
    description: (
      <>
        <Text>
          Rebranding is when an Enterprise switches their artwork (‘branding’) to another branding
          that has been approved by the community for their particular Enterprise.
        </Text>
        <br />
        <Text>
          Rebranding to a new branding requires the burning of 1x{' '}
          <SpanText as="u">
            <Link
              isExternal
              href="https://opensea.io/assets/matic/0x1e51b9d22d5bdb84cc39a020955c01ec39a29b57/1"
            >
              Rebrand Token
            </Link>
          </SpanText>
          .
        </Text>
        <br />
        <Text>Rebranding to a branding which you previously rebranded to has no cost.</Text>
      </>
    ),
  },
  {
    title: 'How does reviving work?',
    description: (
      <>
        <Text>
          Reviving is when an Enterprise that has been burnt (through a merger or acquisition) is
          brought back to life under new ownership with all its old properties (compete /
          acquisition / merger points, name, unlocked brandings).
        </Text>
        <br />
        <Text>
          Reviving requires the burning of 1x{' '}
          <SpanText as="u">
            <Link
              isExternal
              href="https://opensea.io/assets/matic/0x1e51b9d22d5bdb84cc39a020955c01ec39a29b57/2"
            >
              Revive Token
            </Link>
          </SpanText>
          .
        </Text>
        <br />
        <Text>
          You can revive any burnt Enterprise, even if you didn’t previously own it. Once the
          Enterprise is revived, it will be immune from acquisition for some period of time, or
          until the Enterprise performs a compete / acquisition / merger action.
        </Text>
      </>
    ),
  },
  {
    title: "What's on the roadmap?",
    description: (
      <>
        <Text>
          After The Founding, the team will be iteratively rolling out UI improvements for
          interacting with the Acquisition Royale smart contracts, in addition to competitions and
          giveaways in the community.
        </Text>
        <br />
        <Text>
          Additionally, the community - via the Acquisition Royale Grants Program - will be
          incentivized to build out further enhancements/extensions/integrations for the game.
        </Text>
        <br />
        <Text>
          Once prePO has launched, we’d like to explore use cases for Enterprises on the platform.
        </Text>
      </>
    ),
  },
  {
    title: 'How can I partner or collaborate with Acquisition Royale?',
    description: (
      <Text>
        Please fill out{' '}
        <SpanText as="u">
          <Link isExternal href="https://url.prepo.io/arcollabform-landing">
            this form
          </Link>
        </SpanText>
        !
      </Text>
    ),
  },
  {
    title: 'How will the proceeds be used?',
    description: (
      <Text>
        5% of all proceeds will go towards the{' '}
        <SpanText as="u">
          <Link isExternal href="https://www.givingwhatwecan.org/best-charities-to-donate-to-2021/">
            most effective charities
          </Link>
        </SpanText>
        . The remainder of funds will be allocated towards the Acquisition Royale Grants Program,
        ongoing support for the game, future games, and prePO itself.
      </Text>
    ),
  },
  {
    title: 'How does the Acquisition Royale Grants Program work?',
    description: (
      <>
        <Text>
          Acquisition Royale will be offering retrospective grants of{' '}
          <SpanText>up to 5000 USD</SpanText> for artwork, integrations, extensions, resources, and
          other tangible contributions to the growth and development of Acquisition Royale.
        </Text>
        <br />
        <Text>
          Grant amounts are at the full discretion of the team, with help from the community. Feel
          free to discuss with the team about indicative (non-binding) grant amounts a contribution
          may receive.
        </Text>
        <br />
        <Text>
          A form to apply for a retrospective grant will be made available here after the game
          commences.
        </Text>
      </>
    ),
  },
  {
    title: 'Where can I find the deployed smart contracts?',
    description: (
      <>
        <SpanText>Acquisition Royale: </SpanText>
        <Link
          isExternal
          href="https://polygonscan.com/address/0xa46afF3aB117b51f33dB178593552d0ca0B1365e"
        >
          <Text as="u">0xa46afF3aB117b51f33dB178593552d0ca0B1365e</Text>
        </Link>
        <br />
        <SpanText>Acquisition Royale Consumables: </SpanText>
        <Link
          isExternal
          href="https://polygonscan.com/address/0x1e51b9D22d5bdB84CC39A020955C01ec39A29b57"
        >
          <Text as="u">0x1e51b9D22d5bdB84CC39A020955C01ec39A29b57</Text>
        </Link>
        <br />
        <SpanText>Runway Points: </SpanText>
        <Link
          isExternal
          href="https://polygonscan.com/address/0x93dA8f92e89Dde30C27CD2Ef965bD9e91BcFb174"
        >
          <Text as="u">0x93dA8f92e89Dde30C27CD2Ef965bD9e91BcFb174</Text>
        </Link>
      </>
    ),
  },
]
