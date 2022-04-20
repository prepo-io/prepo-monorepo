/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from 'hardhat'
import { ERC20, ERC721 } from '../typechain'
import { AcquisitionRoyale } from '../typechain/AcquisitionRoyale'
import { AcquisitionRoyaleConsumables } from '../typechain/AcquisitionRoyaleConsumables'
import { DynamicPrice } from '../typechain/DynamicPrice'

function getZeroPadHexFromNumber(value: number): string {
  return ethers.utils.hexZeroPad(ethers.utils.hexValue(value), 32)
}

export async function getGameStartTimeChangedEvent(
  acquisitionRoyale: AcquisitionRoyale
): Promise<any> {
  const filter = {
    address: acquisitionRoyale.address,
    topics: [ethers.utils.id('GameStartTimeChanged(uint256)')],
  }
  const events = await acquisitionRoyale.queryFilter(filter)
  return events[0].args as any
}

export async function getFoundingPriceAndTimeChangedEvent(
  acquisitionRoyale: AcquisitionRoyale
): Promise<any> {
  const filter = {
    address: acquisitionRoyale.address,
    topics: [ethers.utils.id('FoundingPriceAndTimeChanged(uint256,uint256,uint256,uint256)')],
  }

  const events = await acquisitionRoyale.queryFilter(filter)
  return events[0].args as any
}

export async function getPassiveRpPerDayChangedEvent(
  acquisitionRoyale: AcquisitionRoyale
): Promise<any> {
  const filter = {
    address: acquisitionRoyale.address,
    topics: [ethers.utils.id('PassiveRpPerDayChanged(uint256,uint256,uint256,uint256)')],
  }

  const events = await acquisitionRoyale.queryFilter(filter)
  return events[0].args as any
}

export async function getImmunityPeriodsChangedEvent(
  acquisitionRoyale: AcquisitionRoyale
): Promise<any> {
  const filter = {
    address: acquisitionRoyale.address,
    topics: [ethers.utils.id('ImmunityPeriodsChanged(uint256,uint256,uint256)')],
  }
  const events = await acquisitionRoyale.queryFilter(filter)
  return events[0].args as any
}

export async function getMergerBurnPercentageChangedEvent(
  acquisitionRoyale: AcquisitionRoyale
): Promise<any> {
  const filter = {
    address: acquisitionRoyale.address,
    topics: [ethers.utils.id('MergerBurnPercentageChanged(uint256)')],
  }
  const events = await acquisitionRoyale.queryFilter(filter)
  return events[0].args as any
}

export async function getWithdrawalBurnPercentageChangedEvent(
  acquisitionRoyale: AcquisitionRoyale
): Promise<any> {
  const filter = {
    address: acquisitionRoyale.address,
    topics: [ethers.utils.id('WithdrawalBurnPercentageChanged(uint256)')],
  }
  const events = await acquisitionRoyale.queryFilter(filter)
  return events[0].args as any
}

export async function getCompeteChangedEvent(acquisitionRoyale: AcquisitionRoyale): Promise<any> {
  const filter = {
    address: acquisitionRoyale.address,
    topics: [ethers.utils.id('CompeteChanged(address)')],
  }

  const events = await acquisitionRoyale.queryFilter(filter)
  return events[0].args as any
}

export async function getAcquireCostChangedEvent(
  acquisitionRoyale: AcquisitionRoyale
): Promise<any> {
  const filter = {
    address: acquisitionRoyale.address,
    topics: [ethers.utils.id('AcquireCostChanged(address)')],
  }

  const events = await acquisitionRoyale.queryFilter(filter)
  return events[0].args as any
}

export async function getMergeCostChangedEvent(acquisitionRoyale: AcquisitionRoyale): Promise<any> {
  const filter = {
    address: acquisitionRoyale.address,
    topics: [ethers.utils.id('MergeCostChanged(address)')],
  }

  const events = await acquisitionRoyale.queryFilter(filter)
  return events[0].args as any
}

export async function getFundraiseCostChangedEvent(
  acquisitionRoyale: AcquisitionRoyale
): Promise<any> {
  const filter = {
    address: acquisitionRoyale.address,
    topics: [ethers.utils.id('FundraiseCostChanged(address)')],
  }

  const events = await acquisitionRoyale.queryFilter(filter)
  return events[0].args as any
}

export async function getSupportForBrandingChangedEvent(
  acquisitionRoyale: AcquisitionRoyale
): Promise<any> {
  const filter = {
    address: acquisitionRoyale.address,
    topics: [ethers.utils.id('SupportForBrandingChanged(address,bool)')],
  }

  const events = await acquisitionRoyale.queryFilter(filter)
  return events[0].args as any
}

export async function getFallbackBrandingChangedEvent(
  acquisitionRoyale: AcquisitionRoyale
): Promise<any> {
  const filter = {
    address: acquisitionRoyale.address,
    topics: [ethers.utils.id('FallbackBrandingChanged(address)')],
  }

  const events = await acquisitionRoyale.queryFilter(filter)
  return events[0].args as any
}

export async function getCompeteEvent(
  acquisitionRoyale: AcquisitionRoyale,
  callerId: number,
  targetId: number
): Promise<any> {
  const filter = {
    address: acquisitionRoyale.address,
    topics: [
      ethers.utils.id('Compete(uint256,uint256,uint256,uint256)'),
      getZeroPadHexFromNumber(callerId),
      getZeroPadHexFromNumber(targetId),
    ],
  }

  const events = await acquisitionRoyale.queryFilter(filter)
  return events[0].args as any
}

export async function getAcquisitionEvent(
  acquisitionRoyale: AcquisitionRoyale,
  callerId: number,
  targetId: number
): Promise<any> {
  const filter = {
    address: acquisitionRoyale.address,
    topics: [
      ethers.utils.id('Acquisition(uint256,uint256,uint256)'),
      getZeroPadHexFromNumber(callerId),
      getZeroPadHexFromNumber(targetId),
    ],
  }

  const events = await acquisitionRoyale.queryFilter(filter)
  return events[0].args as any
}

export async function getMergerEvent(
  acquisitionRoyale: AcquisitionRoyale,
  callerId: number,
  targetId: number
): Promise<any> {
  const filter = {
    address: acquisitionRoyale.address,
    topics: [
      ethers.utils.id('Merger(uint256,uint256,uint256)'),
      getZeroPadHexFromNumber(callerId),
      getZeroPadHexFromNumber(targetId),
    ],
  }

  const events = await acquisitionRoyale.queryFilter(filter)
  return events[0].args as any
}

export async function getFundraiseEvent(
  acquisitionRoyale: AcquisitionRoyale,
  enterpriseId: number
): Promise<any> {
  const filter = {
    address: acquisitionRoyale.address,
    topics: [ethers.utils.id('Fundraise(uint256,uint256)'), getZeroPadHexFromNumber(enterpriseId)],
  }

  const events = await acquisitionRoyale.queryFilter(filter)
  return events[0].args as any
}

export async function getDepositEvent(
  acquisitionRoyale: AcquisitionRoyale,
  enterpriseId: number
): Promise<any> {
  const filter = {
    address: acquisitionRoyale.address,
    topics: [ethers.utils.id('Deposit(uint256,uint256)'), getZeroPadHexFromNumber(enterpriseId)],
  }

  const events = await acquisitionRoyale.queryFilter(filter)
  return events[0].args as any
}

export async function getWithdrawalEvent(
  acquisitionRoyale: AcquisitionRoyale,
  enterpriseId: number
): Promise<any> {
  const filter = {
    address: acquisitionRoyale.address,
    topics: [
      ethers.utils.id('Withdrawal(uint256,uint256,uint256)'),
      getZeroPadHexFromNumber(enterpriseId),
    ],
  }

  const events = await acquisitionRoyale.queryFilter(filter, 'latest')
  return events[0].args as any
}

export async function getRebrandEvent(
  acquisitionRoyale: AcquisitionRoyale,
  enterpriseId: number
): Promise<any> {
  const filter = {
    address: acquisitionRoyale.address,
    topics: [ethers.utils.id('Rebrand(uint256,address)'), getZeroPadHexFromNumber(enterpriseId)],
  }

  const events = await acquisitionRoyale.queryFilter(filter)
  return events[0].args as any
}

export async function getRenameEvent(
  acquisitionRoyale: AcquisitionRoyale,
  enterpriseId: number
): Promise<any> {
  const filter = {
    address: acquisitionRoyale.address,
    topics: [ethers.utils.id('Rename(uint256,string)'), getZeroPadHexFromNumber(enterpriseId)],
  }

  const events = await acquisitionRoyale.queryFilter(filter)
  return events[0].args as any
}

export async function getRevivalEvent(
  acquisitionRoyale: AcquisitionRoyale,
  enterpriseId: number
): Promise<any> {
  const filter = {
    address: acquisitionRoyale.address,
    topics: [ethers.utils.id('Revival(uint256)'), getZeroPadHexFromNumber(enterpriseId)],
  }

  const events = await acquisitionRoyale.queryFilter(filter)
  return events[0].args as any
}

export async function getURIEvent(
  acquisitionRoyaleConsumables: AcquisitionRoyaleConsumables
): Promise<any> {
  const filter = {
    address: acquisitionRoyaleConsumables.address,
    topics: [ethers.utils.id('URI(string,uint256)')],
  }

  const events = await acquisitionRoyaleConsumables.queryFilter(filter)
  return events[0].args as any
}

export async function getNameChangedEvent(
  acquisitionRoyaleConsumables: AcquisitionRoyaleConsumables
): Promise<any> {
  const filter = {
    address: acquisitionRoyaleConsumables.address,
    topics: [ethers.utils.id('NameChanged(string)')],
  }

  const events = await acquisitionRoyaleConsumables.queryFilter(filter)
  return events[0].args as any
}

export async function getSymbolChangedEvent(
  acquisitionRoyaleConsumables: AcquisitionRoyaleConsumables
): Promise<any> {
  const filter = {
    address: acquisitionRoyaleConsumables.address,
    topics: [ethers.utils.id('SymbolChanged(string)')],
  }

  const events = await acquisitionRoyaleConsumables.queryFilter(filter)
  return events[0].args as any
}

export async function getCheckpointUpdatedEvent(dynamicPrice: DynamicPrice): Promise<any> {
  const filter = {
    address: dynamicPrice.address,
    topics: [ethers.utils.id('CheckpointUpdated(uint256,uint256)')],
  }

  const events = await dynamicPrice.queryFilter(filter, 'latest')
  return events[0].args as any
}

export async function getTimestepChangedEvent(dynamicPrice: DynamicPrice): Promise<any> {
  const filter = {
    address: dynamicPrice.address,
    topics: [ethers.utils.id('TimestepChanged(uint256)')],
  }

  const events = await dynamicPrice.queryFilter(filter)
  return events[0].args as any
}

export async function getIncreasePercentPerBumpChangedEvent(
  dynamicPrice: DynamicPrice
): Promise<any> {
  const filter = {
    address: dynamicPrice.address,
    topics: [ethers.utils.id('IncreasePercentPerBumpChanged(uint256)')],
  }

  const events = await dynamicPrice.queryFilter(filter)
  return events[0].args as any
}

export async function getReductionPercentPerSecondChangedEvent(
  dynamicPrice: DynamicPrice
): Promise<any> {
  const filter = {
    address: dynamicPrice.address,
    topics: [ethers.utils.id('ReductionPercentPerSecondChanged(uint256)')],
  }

  const events = await dynamicPrice.queryFilter(filter)
  return events[0].args as any
}

export async function getERC20TransferEvent(
  erc20: ERC20,
  from: string | null = null,
  to: string | null = null
): Promise<any> {
  const filter = erc20.filters.Transfer(from, to, null)
  const events = await erc20.queryFilter(filter, 'latest')
  if (events[0] === undefined) {
    return undefined
  }
  return events[0]
}

export async function getERC721TransferEvent(
  erc721: ERC721,
  from: string | null = null,
  to: string | null = null,
  tokenId: number | null = null
): Promise<any> {
  const filter = erc721.filters.Transfer(from, to, tokenId)
  const events = await erc721.queryFilter(filter, 'latest')
  if (events[0] === undefined) {
    return undefined
  }
  return events[0].args as any
}
