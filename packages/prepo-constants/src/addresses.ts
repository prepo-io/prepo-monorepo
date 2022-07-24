import { SupportedNetworks } from "./networks"

export type ImportantAddress = {
    [key in SupportedNetworks]?: string
}

export type ImportantAddresses = {
    GOVERNANCE: ImportantAddress
}

export const IMPORTANT_ADDRESSES: ImportantAddresses = {
    GOVERNANCE: {
        arbitrumTestnet: "0x054CcD68A2aC152fCFB93a15b6F75Eea53DCD9E0"
    }
}
