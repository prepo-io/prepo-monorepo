import chai, { expect } from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { acquisitionRoyaleConsumablesFixture } from './fixtures/AcquisitionRoyaleConsumablesFixture'
import { getURIEvent, getNameChangedEvent, getSymbolChangedEvent } from './events'
import { AcquisitionRoyaleConsumables } from '../typechain/AcquisitionRoyaleConsumables'

chai.use(solidity)

describe('=> AcquisitionRoyaleConsumables', () => {
  let royaleConsumables: AcquisitionRoyaleConsumables
  let deployer: SignerWithAddress
  let royale: SignerWithAddress
  let user: SignerWithAddress
  let user2: SignerWithAddress
  const RENAME_SUPPLY = 10000
  const REBRAND_SUPPLY = 1000
  const REVIVE_SUPPLY = 100
  const RENAME_TOKEN = 0
  const REBRAND_TOKEN = 1
  const REVIVE_TOKEN = 2

  beforeEach(async () => {
    ;[deployer, royale, user, user2] = await ethers.getSigners()
    royaleConsumables = await acquisitionRoyaleConsumablesFixture(
      'Acquisition Royale Consumables',
      'AQR-C',
      'rename.json',
      'rebrand.json',
      'revive.json',
      royale.address
    )
  })

  describe('# initialize', () => {
    it('should be initialized with correct values', async () => {
      expect(await royaleConsumables.balanceOf(deployer.address, RENAME_TOKEN)).to.eq(RENAME_SUPPLY) // RenameNFT
      expect(await royaleConsumables.balanceOf(deployer.address, REBRAND_TOKEN)).to.eq(
        REBRAND_SUPPLY
      ) // Rebrand NFT
      expect(await royaleConsumables.balanceOf(deployer.address, REVIVE_TOKEN)).to.eq(REVIVE_SUPPLY) // ReviveNFT
      expect(await royaleConsumables.owner()).to.eq(deployer.address)
      expect(await royaleConsumables.getRenameUri()).to.eq('rename.json')
      expect(await royaleConsumables.getRebrandUri()).to.eq('rebrand.json')
      expect(await royaleConsumables.getReviveUri()).to.eq('revive.json')
      expect(await royaleConsumables.getAcquisitionRoyale()).to.eq(royale.address)
    })
  })

  describe('# burn', () => {
    it('should only usable by Acquisition Royale', async () => {
      await royaleConsumables
        .connect(deployer)
        .safeTransferFrom(deployer.address, user.address, RENAME_TOKEN, 1, [])

      await expect(
        royaleConsumables.connect(deployer).burn(user.address, RENAME_TOKEN, 1)
      ).to.revertedWith('caller is not Acquisition Royale')
    })

    it('should allow Acquisition Royale to burn without approval', async () => {
      await royaleConsumables
        .connect(deployer)
        .safeTransferFrom(deployer.address, user.address, RENAME_TOKEN, 1, [])
      expect(await royaleConsumables.balanceOf(user.address, RENAME_TOKEN)).to.eq(1)

      await royaleConsumables.connect(royale).burn(user.address, RENAME_TOKEN, 1)

      expect(await royaleConsumables.balanceOf(user.address, RENAME_TOKEN)).to.eq(0)
    })
  })

  describe('#setRenameUri', () => {
    it('should only be usable by the owner', async () => {
      await expect(royaleConsumables.connect(user).setRenameUri('new_rename.json')).revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should set the RenameUri to the new string', async () => {
      expect(await royaleConsumables.getRenameUri()).to.eq('rename.json')

      await royaleConsumables.connect(deployer).setRenameUri('new_rename.json')

      expect(await royaleConsumables.getRenameUri()).to.eq('new_rename.json')
    })

    it('should be settable to the same value twice', async () => {
      await royaleConsumables.connect(deployer).setRenameUri('new_rename.json')

      expect(await royaleConsumables.getRenameUri()).to.eq('new_rename.json')

      await royaleConsumables.connect(deployer).setRenameUri('new_rename.json')

      expect(await royaleConsumables.getRenameUri()).to.eq('new_rename.json')
    })

    it('should emit a URI event', async () => {
      await royaleConsumables.connect(deployer).setRenameUri('new_rename.json')

      const uriEvent = await getURIEvent(royaleConsumables)
      expect(uriEvent.value).to.eq('new_rename.json')
      expect(uriEvent.id).to.eq(RENAME_TOKEN)
    })
  })

  describe('#setRebrandUri', () => {
    it('should only be usable by the owner', async () => {
      await expect(royaleConsumables.connect(user).setRebrandUri('new_rebrand.json')).revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should set the RebrandUri to the new string', async () => {
      expect(await royaleConsumables.getRebrandUri()).to.eq('rebrand.json')

      await royaleConsumables.connect(deployer).setRebrandUri('new_rebrand.json')

      expect(await royaleConsumables.getRebrandUri()).to.eq('new_rebrand.json')
    })

    it('should be settable to the same value twice', async () => {
      await royaleConsumables.connect(deployer).setRebrandUri('new_rebrand.json')

      expect(await royaleConsumables.getRebrandUri()).to.eq('new_rebrand.json')

      await royaleConsumables.connect(deployer).setRebrandUri('new_rebrand.json')

      expect(await royaleConsumables.getRebrandUri()).to.eq('new_rebrand.json')
    })

    it('should emit a URI event', async () => {
      await royaleConsumables.connect(deployer).setRebrandUri('new_rebrand.json')

      const uriEvent = await getURIEvent(royaleConsumables)
      expect(uriEvent.value).to.eq('new_rebrand.json')
      expect(uriEvent.id).to.eq(REBRAND_TOKEN)
    })
  })

  describe('#setReviveUri', () => {
    it('should only be usable by the owner', async () => {
      await expect(royaleConsumables.connect(user).setReviveUri('new_revive.json')).revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should set the ReviveUri to the new string', async () => {
      expect(await royaleConsumables.getReviveUri()).to.eq('revive.json')

      await royaleConsumables.connect(deployer).setReviveUri('new_revive.json')

      expect(await royaleConsumables.getReviveUri()).to.eq('new_revive.json')
    })

    it('should be settable to the same value twice', async () => {
      await royaleConsumables.connect(deployer).setReviveUri('new_revive.json')

      expect(await royaleConsumables.getReviveUri()).to.eq('new_revive.json')

      await royaleConsumables.connect(deployer).setReviveUri('new_revive.json')

      expect(await royaleConsumables.getReviveUri()).to.eq('new_revive.json')
    })

    it('should emit a URI event', async () => {
      await royaleConsumables.connect(deployer).setReviveUri('new_revive.json')

      const uriEvent = await getURIEvent(royaleConsumables)
      expect(uriEvent.value).to.eq('new_revive.json')
      expect(uriEvent.id).to.eq(REVIVE_TOKEN)
    })
  })

  describe('#setName', () => {
    it('should only be usable by the owner', async () => {
      await expect(royaleConsumables.connect(user).setName('Test Consumables')).revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should set the name to the new string', async () => {
      expect(await royaleConsumables.name()).to.eq('Acquisition Royale Consumables')

      await royaleConsumables.connect(deployer).setName('Test Consumables')

      expect(await royaleConsumables.name()).to.eq('Test Consumables')
    })

    it('should be settable to the same value twice', async () => {
      await royaleConsumables.connect(deployer).setName('Test Consumables')

      expect(await royaleConsumables.name()).to.eq('Test Consumables')

      await royaleConsumables.connect(deployer).setName('Test Consumables')

      expect(await royaleConsumables.name()).to.eq('Test Consumables')
    })

    it('should emit a NameChanged event', async () => {
      await royaleConsumables.connect(deployer).setName('Test Consumables')

      const nameChangedEvent = await getNameChangedEvent(royaleConsumables)
      expect(nameChangedEvent.name).to.eq('Test Consumables')
    })
  })

  describe('#setSymbol', () => {
    it('should only be usable by the owner', async () => {
      await expect(royaleConsumables.connect(user).setSymbol('TEST-C')).revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should set symbol to the new string', async () => {
      expect(await royaleConsumables.symbol()).to.eq('AQR-C')

      await royaleConsumables.connect(deployer).setSymbol('TEST-C')

      expect(await royaleConsumables.symbol()).to.eq('TEST-C')
    })

    it('should be settable to the same value twice', async () => {
      await royaleConsumables.connect(deployer).setSymbol('TEST-C')

      expect(await royaleConsumables.symbol()).to.eq('TEST-C')

      await royaleConsumables.connect(deployer).setSymbol('TEST-C')

      expect(await royaleConsumables.symbol()).to.eq('TEST-C')
    })

    it('should emit a SymbolChanged event', async () => {
      await royaleConsumables.connect(deployer).setSymbol('TEST-C')

      const symbolChangedEvent = await getSymbolChangedEvent(royaleConsumables)
      expect(symbolChangedEvent.symbol).to.eq('TEST-C')
    })
  })

  describe('#uri', () => {
    it('should return the rename URI for id 0', async () => {
      expect(await royaleConsumables.uri(RENAME_TOKEN)).to.eq('rename.json')
    })

    it('should return the rebrand URI for id 1', async () => {
      expect(await royaleConsumables.uri(REBRAND_TOKEN)).to.eq('rebrand.json')
    })

    it('should return the revive URI for id 2', async () => {
      expect(await royaleConsumables.uri(REVIVE_TOKEN)).to.eq('revive.json')
    })
  })
})
