import chai, { expect } from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { parseEther } from 'ethers/lib/utils'
import { Contract } from 'ethers'
import { MockContract, smock } from '@defi-wonderland/smock'
import { ZERO_ADDRESS } from 'prepo-constants'
import { utils } from 'prepo-hardhat'
import { depositHookFixture } from './fixtures/HookFixture'
import { smockCollateralDepositRecordFixture } from './fixtures/CollateralDepositRecordFixture'
import { getDepositHookVaultChangedEvent } from './events'
import { DepositHook } from '../typechain'

const { revertReason } = utils

chai.use(solidity)
chai.use(smock.matchers)

describe('=> DepositHook', () => {
  let depositHook: DepositHook
  let deployer: SignerWithAddress
  let user: SignerWithAddress
  let vault: SignerWithAddress
  let mockCollateralDepositRecord: MockContract<Contract>
  const TEST_GLOBAL_DEPOSIT_CAP = parseEther('50000')
  const TEST_ACCOUNT_DEPOSIT_CAP = parseEther('50')
  const TEST_AMOUNT_ONE = parseEther('1')
  const TEST_AMOUNT_TWO = parseEther('2')

  beforeEach(async () => {
    ;[deployer, user, vault] = await ethers.getSigners()
    mockCollateralDepositRecord = await smockCollateralDepositRecordFixture(
      TEST_GLOBAL_DEPOSIT_CAP,
      TEST_ACCOUNT_DEPOSIT_CAP
    )
    depositHook = await depositHookFixture(mockCollateralDepositRecord.address)
    await mockCollateralDepositRecord.connect(deployer).setAllowedHook(depositHook.address, true)
  })

  describe('# initialize', () => {
    it('should be initialized with correct values', async () => {
      expect(await depositHook.getVault()).to.eq(ZERO_ADDRESS)
      expect(await depositHook.getDepositRecord()).to.eq(mockCollateralDepositRecord.address)
    })
  })

  describe('# hook', () => {
    beforeEach(async () => {
      await depositHook.setVault(vault.address)
    })

    it('should only usable by the vault', async () => {
      expect(await depositHook.getVault()).to.not.eq(user.address)

      await expect(
        depositHook.connect(user).hook(user.address, TEST_AMOUNT_ONE, TEST_AMOUNT_TWO)
      ).to.revertedWith(revertReason('Caller is not the vault'))
    })

    it('should call recordDeposit with the correct parameters', async () => {
      await depositHook.connect(vault).hook(user.address, TEST_AMOUNT_ONE, TEST_AMOUNT_TWO)

      expect(mockCollateralDepositRecord.recordDeposit).to.be.calledWith(
        user.address,
        TEST_AMOUNT_TWO
      )
    })
  })

  describe('# setVault', () => {
    it('should only be usable by the owner', async () => {
      await expect(depositHook.connect(user).setVault(vault.address)).revertedWith(
        revertReason('Ownable: caller is not the owner')
      )
    })

    it('should be settable to an address', async () => {
      expect(await depositHook.getVault()).to.eq(ZERO_ADDRESS)

      await depositHook.connect(deployer).setVault(vault.address)

      expect(await depositHook.getVault()).to.eq(vault.address)
    })

    it('should be settable to the zero address', async () => {
      await depositHook.connect(deployer).setVault(vault.address)
      expect(await depositHook.getVault()).to.eq(vault.address)

      await depositHook.connect(deployer).setVault(ZERO_ADDRESS)

      expect(await depositHook.getVault()).to.eq(ZERO_ADDRESS)
    })

    it('should be settable to the same value twice', async () => {
      expect(await depositHook.getVault()).to.eq(ZERO_ADDRESS)

      await depositHook.connect(deployer).setVault(vault.address)

      expect(await depositHook.getVault()).to.eq(vault.address)

      await depositHook.connect(deployer).setVault(vault.address)

      expect(await depositHook.getVault()).to.eq(vault.address)
    })

    it('should emit a VaultChanged event', async () => {
      await depositHook.connect(deployer).setVault(vault.address)

      const event = await getDepositHookVaultChangedEvent(depositHook)
      expect(event.vault).to.eq(vault.address)
    })
  })

  describe('# setDepositRecord', () => {
    it('reverts if not owner', async () => {
      expect(await depositHook.owner()).to.not.eq(user.address)

      await expect(
        depositHook.connect(user).setDepositRecord(mockCollateralDepositRecord.address)
      ).revertedWith(revertReason('Ownable: caller is not the owner'))
    })

    it('sets to non-zero address', async () => {
      await depositHook.connect(deployer).setDepositRecord(ZERO_ADDRESS)
      expect(mockCollateralDepositRecord.address).to.not.eq(ZERO_ADDRESS)
      expect(await depositHook.getDepositRecord()).to.not.eq(mockCollateralDepositRecord.address)

      await depositHook.connect(deployer).setDepositRecord(mockCollateralDepositRecord.address)

      expect(await depositHook.getDepositRecord()).to.eq(mockCollateralDepositRecord.address)
    })

    it('sets to zero address', async () => {
      expect(await depositHook.getDepositRecord()).to.not.eq(ZERO_ADDRESS)

      await depositHook.connect(deployer).setDepositRecord(ZERO_ADDRESS)

      expect(await depositHook.getDepositRecord()).to.eq(ZERO_ADDRESS)
    })

    it('is idempotent', async () => {
      await depositHook.connect(deployer).setDepositRecord(ZERO_ADDRESS)
      expect(await depositHook.getDepositRecord()).to.not.eq(mockCollateralDepositRecord.address)

      await depositHook.connect(deployer).setDepositRecord(mockCollateralDepositRecord.address)

      expect(await depositHook.getDepositRecord()).to.eq(mockCollateralDepositRecord.address)

      await depositHook.connect(deployer).setDepositRecord(mockCollateralDepositRecord.address)

      expect(await depositHook.getDepositRecord()).to.eq(mockCollateralDepositRecord.address)
    })
  })
})
