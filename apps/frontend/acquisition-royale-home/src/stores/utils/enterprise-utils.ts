import { EMPTY_CONTRACT_ADDRESS } from '@prepo-io/constants'
import { BigNumber, ethers } from 'ethers'
import { EnterpriseBasic, RawEnterprise } from '../../types/enterprise.types'
import { EnterpriseArray } from '../AcquisitionRoyaleContractStore'

export const getRawEnterprise = (enterpriseData: EnterpriseArray): RawEnterprise | undefined => {
  const enterprise = enterpriseData?.[0]
  return enterprise
    ? {
        name: enterprise[0],
        rp: enterprise[1],
        lastRpUpdateTime: enterprise[2],
        acquisitionImmunityStartTime: enterprise[3],
        mergerImmunityStartTime: enterprise[4],
        revivalImmunityStartTime: enterprise[5],
        competes: enterprise[6],
        acquisitions: enterprise[7],
        mergers: enterprise[8],
        branding: enterprise[9],
        fundraiseRpTotal: enterprise[10],
        fundraiseWethTotal: enterprise[11],
        damageDealt: enterprise[12],
        damageTaken: enterprise[13],
        renames: enterprise[14],
        rebrands: enterprise[15],
        revives: enterprise[16],
      }
    : undefined
}

export const getReadableEnterpriseBasic = ({
  enterpriseHasMoat,
  id,
  immuneUntil,
  lastHadMoat,
  moatCountdown,
  moatUntil,
  rawEnterprise,
  rawImmune,
  rawOwnerOf,
  rp,
  rpPerDay,
}: {
  enterpriseHasMoat: [boolean]
  id: BigNumber
  immuneUntil: number
  lastHadMoat: [boolean]
  moatCountdown: [BigNumber]
  moatUntil: number
  rawEnterprise: RawEnterprise
  rawImmune: [boolean]
  rawOwnerOf: [string]
  rp: number
  rpPerDay: number
}): EnterpriseBasic => ({
  burned: rawOwnerOf[0] === EMPTY_CONTRACT_ADDRESS,
  hasMoat: enterpriseHasMoat[0],
  id: id.toNumber(),
  immune: rawImmune[0],
  immuneUntil,
  lastHadMoat: lastHadMoat[0],
  moatCountdown: moatCountdown[0].toNumber(),
  moatUntil,
  name: rawEnterprise.name,
  ownerOf: rawOwnerOf[0],
  stats: {
    acquisitions: rawEnterprise.acquisitions.toNumber(),
    competes: +ethers.utils.formatEther(rawEnterprise.competes),
    mergers: rawEnterprise.mergers.toNumber(),
    rp,
    rpPerDay,
  },
  raw: rawEnterprise,
})
