import dynamic from 'next/dynamic'
import { ApolloCapital } from './ApolloCapital'
import { CaballerosCapital } from './CaballerosCapital'
import { GCR } from './GCR'
import { Maven11 } from './Maven11'
import { Mexc } from './Mexc'
import { NxGen } from './NxGen'
import { PossibleVentures } from './PossibleVentures'
import { RepublicCapital } from './RepublicCapital'
import { ShimaCapital } from './ShimaCapital'
import { ThielCapital } from './Thiel'

const AscendEX = dynamic(() => import('./AscendEX'), { ssr: false })
const BerggruenHoldings = dynamic(() => import('./BerggruenHoldings'), { ssr: false })
const DCV = dynamic(() => import('./DCV'), { ssr: false })
const DexterityCapital = dynamic(() => import('./DexterityCapital'), { ssr: false })
const FlexDapps = dynamic(() => import('./FlexDapps'), { ssr: false })
const ForkVentures = dynamic(() => import('./ForkVentures'), { ssr: false })
const HoneyDAO = dynamic(() => import('./HoneyDAO'), { ssr: false })
const IOSGVenture = dynamic(() => import('./IosgVenture'), { ssr: false })
const NeptuneDAO = dynamic(() => import('./NeptuneDAO'), { ssr: false })
const Octav = dynamic(() => import('./Octav'), { ssr: false })
const Re7Capital = dynamic(() => import('./Re7Capital'), { ssr: false })
const TheLao = dynamic(() => import('./TheLao'), { ssr: false })
const Zepeto = dynamic(() => import('./Zepeto'), { ssr: false })

export default {
  apolloCapital: ApolloCapital,
  ascendEX: AscendEX,
  berggruenHoldings: BerggruenHoldings,
  caballerosCapital: CaballerosCapital,
  dcv: DCV,
  dexterityCapital: DexterityCapital,
  flexDapps: FlexDapps,
  forkVentures: ForkVentures,
  gcr: GCR,
  honeyDAO: HoneyDAO,
  iosgVenture: IOSGVenture,
  maven11: Maven11,
  mexc: Mexc,
  neptuneDAO: NeptuneDAO,
  nxgen: NxGen,
  octav: Octav,
  possibleVentures: PossibleVentures,
  re7Capital: Re7Capital,
  republicCapital: RepublicCapital,
  shimaCapital: ShimaCapital,
  theLao: TheLao,
  thiel: ThielCapital,
  zepeto: Zepeto,
}
