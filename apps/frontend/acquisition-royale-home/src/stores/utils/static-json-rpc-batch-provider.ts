import { ethers } from 'ethers'

const { JsonRpcBatchProvider, StaticJsonRpcProvider } = ethers.providers

// Take the JsonRpcBatchProvider and give it the detectNetwork method of the StaticJsonRpcProvider
export class StaticJsonRpcBatchProvider extends JsonRpcBatchProvider {
  detectNetwork = StaticJsonRpcProvider.prototype.detectNetwork.bind(this)
}
