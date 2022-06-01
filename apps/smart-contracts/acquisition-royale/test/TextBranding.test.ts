import chai, { expect } from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { MerkleTree } from 'merkletreejs'
import { merkleProofVerifierFixture } from './fixtures/MerkleProofVerifierFixture'
import { mockERC20Fixture } from './fixtures/MockERC20Fixture'
import { acquisitionRoyaleConsumablesFixture } from './fixtures/AcquisitionRoyaleConsumablesFixture'
import { runwayPointsFixture } from './fixtures/RunwayPointsFixture'
import { mockAcquisitionRoyaleFixture } from './fixtures/AcquisitionRoyaleFixture'
import { textBrandingFixture } from './fixtures/TextBrandingFixture'
import { generateMerkleTree, getLastTimestamp } from './utils'
import { MerkleProofVerifier } from '../typechain/MerkleProofVerifier'
import { MockERC20 } from '../typechain/MockERC20'
import { AcquisitionRoyaleConsumables } from '../typechain/AcquisitionRoyaleConsumables'
import { RunwayPoints } from '../typechain/RunwayPoints'
import { MockAcquisitionRoyale } from '../typechain/MockAcquisitionRoyale'
import { TextBranding } from '../typechain/TextBranding'
import { readFileSync, writeFile, existsSync, mkdirSync } from 'fs'

chai.use(solidity)

const svgsTestDirPath = './test/svgs'

describe('=> TextBranding', () => {
  let merkleProofVerifier: MerkleProofVerifier
  let mockWeth: MockERC20
  let runwayPoints: RunwayPoints
  let royaleConsumables: AcquisitionRoyaleConsumables
  let acquisitionRoyale: MockAcquisitionRoyale
  let textBranding: TextBranding
  let deployer: SignerWithAddress
  let user: SignerWithAddress
  let user2: SignerWithAddress
  let eligibleAddresses: string[]
  let merkleTree: MerkleTree
  const defaultBrandingDescription = 'Acquisition Royale Default Branding'

  beforeEach(async () => {
    ;[deployer, user, user2] = await ethers.getSigners()
    eligibleAddresses = [deployer.address, user.address]
    merkleTree = generateMerkleTree(eligibleAddresses)
    merkleProofVerifier = await merkleProofVerifierFixture(merkleTree.getHexRoot())
    mockWeth = await mockERC20Fixture('WETH9', 'WETH9')
    acquisitionRoyale = await mockAcquisitionRoyaleFixture()
    runwayPoints = await runwayPointsFixture(acquisitionRoyale.address)
    royaleConsumables = await acquisitionRoyaleConsumablesFixture(
      'Acquisition Royale Consumables',
      'ACQRC',
      'rename.json',
      'rebrand.json',
      'revive.json',
      acquisitionRoyale.address
    )
    await acquisitionRoyale.initialize(
      'Acquisition Royale',
      'ACQR',
      merkleProofVerifier.address,
      mockWeth.address,
      runwayPoints.address,
      royaleConsumables.address
    )
    textBranding = await textBrandingFixture(acquisitionRoyale.address)
    const currentTime = await getLastTimestamp()
    await acquisitionRoyale.setGameStartTime(currentTime)
  })

  describe('# initialize', () => {
    it('should be initialized with the correct values', async () => {
      expect(await textBranding.getAcquisitionRoyale()).to.eq(acquisitionRoyale.address)
      expect(await textBranding.getArtist()).to.eq('Acquisition Royale')
    })
  })

  describe('# getArt', () => {
    it('return a correctly constructed svg with small name and id', async () => {
      const testEnterprise = 1
      const testName = 'SMALL'
      const testRpBalance = ethers.utils.parseEther('1250')
      const testCompeteSpend = ethers.utils.parseEther('5000')
      const testAcquisitions = 15000
      const testMergers = 999
      const testFundraiseRpTotal = ethers.utils.parseEther('10000')
      const testFundraiseWethTotal = ethers.utils.parseEther('1')
      const testDamageDealt = ethers.utils.parseEther('2857.142')
      const testDamageTaken = ethers.utils.parseEther('3750')
      const testRebrands = 5
      const testRevives = 1

      await acquisitionRoyale.mintEnterprise(deployer.address, testEnterprise)
      await acquisitionRoyale.setEnterpriseStats(
        testEnterprise,
        testName,
        testRpBalance,
        testCompeteSpend,
        testAcquisitions,
        testMergers,
        testFundraiseRpTotal,
        testFundraiseWethTotal,
        testDamageDealt,
        testDamageTaken,
        testRebrands,
        testRevives
      )

      const uri = await textBranding.getArt(testEnterprise)

      const controlUri = readFileSync('./test/controlUris/uri_small.txt', 'utf-8')
      expect(uri).to.eq(controlUri)
      const json = Buffer.from(uri.substring(29), 'base64').toString('utf-8')
      const result = JSON.parse(json)
      expect(result.description).to.eq(defaultBrandingDescription)
      expect(result.name).to.eq((await acquisitionRoyale.getEnterprise(testEnterprise)).name)
      // Make sure the folder exists first
      if (!existsSync(svgsTestDirPath)) {
        mkdirSync(svgsTestDirPath, { recursive: true })
      }
      // paste contents of file into your browser address bar to load base64 encoded svg
      writeFile(`${svgsTestDirPath}/art_small.txt`, result.image, (err) => {
        if (err) throw err
      })
    })
    it('return a correctly constructed svg with large name and id', async () => {
      const testEnterprise = 15999
      const testName = 'FULLTWENTYCHARACTERS'
      const testRpBalance = ethers.utils.parseEther('50000.123')
      const testCompeteSpend = ethers.utils.parseEther('350000.456')
      const testAcquisitions = 15000
      const testMergers = 999
      const testFundraiseRpTotal = ethers.utils.parseEther('700000.789')
      const testFundraiseWethTotal = ethers.utils.parseEther('70.987')
      const testDamageDealt = ethers.utils.parseEther('200000.654')
      const testDamageTaken = ethers.utils.parseEther('300000.321')
      const testRebrands = 25
      const testRevives = 15

      await acquisitionRoyale.mintEnterprise(deployer.address, testEnterprise)
      await acquisitionRoyale.setEnterpriseStats(
        testEnterprise,
        testName,
        testRpBalance,
        testCompeteSpend,
        testAcquisitions,
        testMergers,
        testFundraiseRpTotal,
        testFundraiseWethTotal,
        testDamageDealt,
        testDamageTaken,
        testRebrands,
        testRevives
      )

      const uri = await textBranding.getArt(testEnterprise)

      const controlUri = readFileSync('./test/controlUris/uri_large.txt', 'utf-8')
      expect(uri).to.eq(controlUri)
      const json = Buffer.from(uri.substring(29), 'base64').toString('utf-8')
      const result = JSON.parse(json)
      expect(result.description).to.eq(defaultBrandingDescription)
      expect(result.name).to.eq((await acquisitionRoyale.getEnterprise(testEnterprise)).name)
      // Make sure the folder exists first
      if (!existsSync(svgsTestDirPath)) {
        mkdirSync(svgsTestDirPath, { recursive: true })
      }
      // paste contents of file into your browser address bar to load base64 encoded svg
      writeFile(`${svgsTestDirPath}/art_large.txt`, result.image, (err) => {
        if (err) throw err
      })
    })
  })
})
