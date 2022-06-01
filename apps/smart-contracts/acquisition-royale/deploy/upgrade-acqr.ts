import chai from 'chai'
import { solidity } from 'ethereum-waffle'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

interface DeployTransaction {
  creates: string
}

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  chai.use(solidity)
  const { ethers } = hre
  const { upgrades } = hre
  const accounts = await ethers.getSigners()

  const deployer = accounts[0]
  console.log('Deployer: ', deployer.address)

  const PROXY_ADDRESS = '0xa46afF3aB117b51f33dB178593552d0ca0B1365e'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const acquisitionRoyaleFactory: any = await ethers.getContractFactory('AcquisitionRoyale')

  const upgradeTx = await upgrades.upgradeProxy(PROXY_ADDRESS, acquisitionRoyaleFactory)

  console.log('AcquisitionRoyale upgraded in:', upgradeTx.hash)
  const upgradedContract = await acquisitionRoyaleFactory.attach(PROXY_ADDRESS)
  console.log('Owner After Upgrade:', await upgradedContract.owner())
}
deploy.tags = ['upgrade-acqr']
export default deploy
