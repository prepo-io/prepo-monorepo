import { ContractTransaction } from 'ethers'
import { parseEther } from 'ethers/lib/utils'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const deployFunction: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  ethers,
}: HardhatRuntimeEnvironment) {
  console.log('Deploys Fixed Cost and Compete contracts')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()

  // Change this depending on network
  if (!process.env.ACQUISITION_ROYALE) {
    throw new Error('Please set your ACQUISITION_ROYALE_ADDRESS in a .env file')
  }
  const ACQUISITION_ROYALE_ADDRESS = process.env.ACQUISITION_ROYALE
  console.log('Using AcquisitionRoyale at', ACQUISITION_ROYALE_ADDRESS)
  console.log('')

  // Deploy CompeteV1
  const deployCompeteV1 = await deploy('CompeteV1', {
    from: deployer,
    args: [ACQUISITION_ROYALE_ADDRESS],
  })
  console.log('CompeteV1 deployed at ', deployCompeteV1.address)
  console.log('')

  // Deploy FixedMergeCost
  const priceToStartWith = parseEther('1')
  const deployFixedMergeCost = await deploy('FixedMergeCost', {
    from: deployer,
    args: [priceToStartWith],
  })
  console.log('FixedMergeCost deployed at ', deployFixedMergeCost.address)

  // Deploy FixedAcquireCost
  const feeToStartWith = 500000000
  const deployFixedAcquireCost = await deploy('FixedAcquireCost', {
    from: deployer,
    args: [deployFixedMergeCost.address, priceToStartWith, feeToStartWith],
  })
  console.log('FixedAcquireCost deployed at ', deployFixedAcquireCost.address)

  // Assign these contracts to AcquisitionRoyale
  const royaleContract = await ethers.getContractFactory('AcquisitionRoyale')
  const acquisitionRoyale = royaleContract.attach(ACQUISITION_ROYALE_ADDRESS)
  if (deployer === (await acquisitionRoyale.owner())) {
    if ((await acquisitionRoyale.getCompete()) !== deployCompeteV1.address) {
      console.log('Configuring AcquisitionRoyale to use newly deployed Compete...')
      const tx = (await acquisitionRoyale.setCompete(
        deployCompeteV1.address
      )) as ContractTransaction
      await tx.wait()
      console.log('At', tx.hash)
    } else {
      console.log('AcquisitionRoyale already configured with the CompeteV1 on file.')
    }

    if ((await acquisitionRoyale.getMergeCost()) !== deployFixedMergeCost.address) {
      console.log('Configuring AcquisitionRoyale to use newly deployed FixedMergeCost...')
      const tx = (await acquisitionRoyale.setMergeCost(
        deployFixedMergeCost.address
      )) as ContractTransaction
      await tx.wait()
      console.log('At', tx.hash)
    } else {
      console.log('AcquisitionRoyale already configured with the FixedMergeCost on file.')
    }

    if ((await acquisitionRoyale.getAcquireCost()) !== deployFixedAcquireCost.address) {
      console.log('Configuring AcquisitionRoyale to use newly deployed FixedAcquireCost...')
      const tx = (await acquisitionRoyale.setAcquireCost(
        deployFixedAcquireCost.address
      )) as ContractTransaction
      await tx.wait()
      console.log('At', tx.hash)
    } else {
      console.log('AcquisitionRoyale already configured with the FixedAcquireCost on file.')
    }
  }
}

deployFunction.tags = ['cost-compete']

export default deployFunction
