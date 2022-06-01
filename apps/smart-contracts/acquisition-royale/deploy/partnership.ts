import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { AcquisitionRoyalePartnership } from '../typechain/AcquisitionRoyalePartnership'

interface DeployTransaction {
  creates: string
}

const deployFunction: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers } = hre
  const accounts = await ethers.getSigners()
  const deployer = accounts[0]
  console.log('Deployer: ', deployer.address)

  console.log('Deploying AcquisitionRoyalePartnership')
  const contractFactory = await ethers.getContractFactory('AcquisitionRoyalePartnership')
  const partnership = (await contractFactory.deploy()) as unknown as AcquisitionRoyalePartnership
  const { creates: partnershipAddress } = (await partnership.deployed())
    .deployTransaction as unknown as DeployTransaction
  console.log(`Deployed [${partnershipAddress}]`)
}

deployFunction.tags = ['partnership']

export default deployFunction
