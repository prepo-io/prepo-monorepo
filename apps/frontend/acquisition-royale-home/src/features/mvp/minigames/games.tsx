import React from 'react'
import { IconName } from '../../../components/icon/icon.types'
import { SupportedMinigameContractName } from '../../../lib/minigames-contracts'

export type SupportedMinigame = 'telemarketing'

export type MiniGame = {
  key: SupportedMinigame
  title: string
  description: React.ReactNode
  iconName: IconName
  hookAddress: SupportedMinigameContractName
  proRataAddress: SupportedMinigameContractName
  buttonText: string
}

export const minigames: MiniGame[] = [
  {
    key: 'telemarketing',
    title: 'Telemarketing',
    description: (
      <span>
        Sales is a numbers game.
        <br />
        <br />
        Earn your share of hourly RP based on how many calls you make.
      </span>
    ),
    iconName: 'phone',
    hookAddress: 'TELEMARKETING_HOOK',
    proRataAddress: 'TELEMARKETING_PRORATA',
    buttonText: 'Do telemarketing',
  },
]
