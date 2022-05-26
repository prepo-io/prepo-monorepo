import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { AcquisitionRoyale } from '../typechain/AcquisitionRoyale'
import { AcquisitionRoyaleConsumables } from '../typechain/AcquisitionRoyaleConsumables'
import { MerkleProofVerifier } from '../typechain/MerkleProofVerifier'
import { RunwayPoints } from '../typechain/RunwayPoints'

interface DeployTransaction {
  creates: string
}

const deployFunction: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers } = hre
  const { upgrades } = hre
  const accounts = await ethers.getSigners()
  const deployer = accounts[0]
  console.log('Deployer: ', deployer.address)

  console.log('Deploying AcquisitionRoyale')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const acquisitionRoyaleFactory: any = await ethers.getContractFactory('AcquisitionRoyale')
  const acquisitionRoyale = (await upgrades.deployProxy(acquisitionRoyaleFactory, {
    initializer: false,
  })) as unknown as AcquisitionRoyale
  const { creates: acquisitionRoyaleAddress } = (await acquisitionRoyale.deployed())
    .deployTransaction as unknown as DeployTransaction
  console.log(`Deployed [${acquisitionRoyaleAddress}]`)

  console.log('Deploying AcquisitionRoyaleConsumables')
  const acquisitionRoyaleConsumablesArgs = [
    'Acquisition Royale Consumables',
    'ACQRC',
    '',
    '',
    '',
    acquisitionRoyaleAddress,
  ]
  const acquisitionRoyaleConsumablesFactory = await ethers.getContractFactory(
    'AcquisitionRoyaleConsumables'
  )
  const acquisitionRoyaleConsumables = (await acquisitionRoyaleConsumablesFactory.deploy(
    ...acquisitionRoyaleConsumablesArgs
  )) as unknown as AcquisitionRoyaleConsumables
  const { creates: acquisitionRoyaleConsumablesAddress } = (
    await acquisitionRoyaleConsumables.deployed()
  ).deployTransaction as unknown as DeployTransaction
  console.log(`Deployed [${acquisitionRoyaleConsumablesAddress}]`)

  // Leave out for initial deployment
  // console.log('Deploying DynamicPrice');
  // const dynamicPriceArgs = [ethers.utils.parseEther('0.05')]
  // const DynamicPrice = await ethers.getContractFactory('DynamicPrice')
  // const dynamicPrice = (await DynamicPrice.deploy(...dynamicPriceArgs)) as unknown as DynamicPrice
  // const { creates: dynamicPriceAddress } = (await dynamicPrice.deployed()).deployTransaction as unknown as DeployTransaction
  // console.log(`Deployed [${dynamicPriceAddress}]`);

  console.log('Deploying MerkleProofVerifier')
  const MERKLE_ROOT = '0xbdc53e4403d028e6932af72a875ffabb2f3b9038ea76845e28d6142f8481e5ac'
  const merkleProofVerifierArgs = [MERKLE_ROOT]
  const merkleProofVerifierFactory = await ethers.getContractFactory('MerkleProofVerifier')
  const merkleProofVerifier = (await merkleProofVerifierFactory.deploy(
    ...merkleProofVerifierArgs
  )) as unknown as MerkleProofVerifier
  const { creates: merkleProofVerifierAddress } = (await merkleProofVerifier.deployed())
    .deployTransaction as unknown as DeployTransaction
  console.log(`Deployed [${merkleProofVerifierAddress}]`)

  console.log('Deploying RunwayPoints')
  const runwayPointsArgs = [acquisitionRoyaleAddress]
  const runwayPointsFactory = await ethers.getContractFactory('RunwayPoints')
  const runwayPoints = (await runwayPointsFactory.deploy(
    ...runwayPointsArgs
  )) as unknown as RunwayPoints
  const { creates: runwayPointsAddress } = (await runwayPoints.deployed())
    .deployTransaction as unknown as DeployTransaction
  console.log(`Deployed [${runwayPointsAddress}]`)

  const POLYGON_WETH = '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619'
  console.log('Using WETH at: ', POLYGON_WETH)
  console.log('Initializing AcquisitionRoyale')
  const tx = await acquisitionRoyale.initialize(
    'Acquisition Royale',
    'ACQR',
    merkleProofVerifier.address,
    POLYGON_WETH,
    runwayPoints.address,
    acquisitionRoyaleConsumables.address
  )
  await tx.wait()
}

deployFunction.tags = ['acqr-and-periphery']

export default deployFunction
