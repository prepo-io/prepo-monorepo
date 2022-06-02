import notification from 'antd/lib/notification'
import { RootStore as PRootStore } from '@prepo-io/stores'
import { captureException } from '@sentry/nextjs'
import { UiStore } from './UiStore'
import { UniswapV2RouterContractStore } from './UniswapV2RouterContractStore'
import LocalStorageStore from './LocalStorageStore'
import { Erc20Store } from './entities/Erc20.entity'
import { BrandingContractStore } from './BrandingContractStore'
import { AcquireRPCostContractStore } from './AcquireRPCostContractStore'
import { AcquisitionRoyaleContractStore } from './AcquisitionRoyaleContractStore'
import { AcquisitionRoyaleRPShopContractStore } from './AcquisitionRoyaleRPShopContractStore'
import { AcqrHookV1Store } from './AcqrHookV1Store'
import { CompeteV1ContractStore } from './CompeteV1ContractStore'
import { CompetitionStore } from './CompetitionStore'
import { ConsumablesContractStore } from './ConsumablesContractStore'
import { MergeRPCostContractStore } from './MergeRPCostContract'
import { MoatContractStore } from './MoatContractStore'
import { RunwayPointsContractStore } from './RunwayPointsContractStore'
import { SignerStore } from './SignerStore'
import { InternContractStore } from './InternContractStore'
import { InternStore } from './InternStore'
import { EnterpriseStore } from './EnterprisesStore'
import { storeConfig } from './utils/stores-config'
import { ActionsStore } from '../features/mvp/ActionsStore'
import { RpShopStore } from '../features/mvp/rpshop'
import { SupportedContracts } from '../lib/supported-contracts'
import { MergeStore } from '../features/mvp/merge'
import { AcquireStore } from '../features/mvp/acquire'
import { CompeteStore } from '../features/mvp/compete'
import { DepositStore } from '../features/mvp/deposit'
import { WithdrawStore } from '../features/mvp/withdraw'
import { makeMinigameStores, MinigameStores } from '../features/mvp/minigames/utils'

export class RootStore extends PRootStore<SupportedContracts> {
  uiStore: UiStore
  acquireStore: AcquireStore
  acquireRPCostContractStore: AcquireRPCostContractStore
  acquisitionRoyaleContractStore: AcquisitionRoyaleContractStore
  acquisitionRoyaleRPShopContractStore: AcquisitionRoyaleRPShopContractStore
  acqrHookV1: AcqrHookV1Store
  competeStore: CompeteStore
  competeV1ContractStore: CompeteV1ContractStore
  competitionStore: CompetitionStore
  consumablesContractStore: ConsumablesContractStore
  depositStore: DepositStore
  mergeStore: MergeStore
  mergeRPCostContractStore: MergeRPCostContractStore
  minigames: MinigameStores
  moatContractStore: MoatContractStore
  uniswapV2RouterContractStore: UniswapV2RouterContractStore
  localStorageStore: LocalStorageStore
  runwayPointsContractStore: RunwayPointsContractStore
  usdcStore: Erc20Store
  brandingContractStore: BrandingContractStore
  actionsStore: ActionsStore
  enterprisesStore: EnterpriseStore
  internContractStore: InternContractStore
  internStore: InternStore
  rpShopStore: RpShopStore
  signerStore: SignerStore
  withdrawStore: WithdrawStore

  constructor() {
    super({
      errorCapturer: (error): void => {
        captureException(error.message, {
          extra: { error },
        })
      },
      toast: notification,
      storeConfig,
    })
    this.uiStore = new UiStore(this)
    this.uniswapV2RouterContractStore = new UniswapV2RouterContractStore(this)
    this.localStorageStore = new LocalStorageStore(this)
    this.acquisitionRoyaleContractStore = new AcquisitionRoyaleContractStore(this)
    this.acqrHookV1 = new AcqrHookV1Store(this)
    this.acquireRPCostContractStore = new AcquireRPCostContractStore(this)
    this.acquisitionRoyaleRPShopContractStore = new AcquisitionRoyaleRPShopContractStore(this)
    this.acquireStore = new AcquireStore(this)
    this.competeStore = new CompeteStore(this)
    this.consumablesContractStore = new ConsumablesContractStore(this)
    this.depositStore = new DepositStore(this)
    this.enterprisesStore = new EnterpriseStore(this)
    this.competitionStore = new CompetitionStore(this)
    this.signerStore = new SignerStore(this)
    this.mergeStore = new MergeStore(this)
    this.mergeRPCostContractStore = new MergeRPCostContractStore(this)
    this.moatContractStore = new MoatContractStore(this)
    this.runwayPointsContractStore = new RunwayPointsContractStore(this)
    this.usdcStore = new Erc20Store(this, 'USDC')
    this.brandingContractStore = new BrandingContractStore(this)
    this.actionsStore = new ActionsStore(this)
    this.competeV1ContractStore = new CompeteV1ContractStore(this)
    this.internContractStore = new InternContractStore(this)
    this.internStore = new InternStore(this)
    this.rpShopStore = new RpShopStore(this)
    this.withdrawStore = new WithdrawStore(this)
    this.minigames = makeMinigameStores(this)
  }
}
