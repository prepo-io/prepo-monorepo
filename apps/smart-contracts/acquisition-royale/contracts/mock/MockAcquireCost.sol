// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

import "../interfaces/ICost.sol";

contract MockAcquireCost is ICost {
  function getCost(uint256 _callerId, uint256 _recipientId)
    external
    view
    override
    returns (
      uint256 _amountToRecipient,
      uint256 _amountToTreasury,
      uint256 _amountToBurn
    )
  {
    // 0.001 WETH to recipient for acquisitionCost,  0.0015 WETH to treasury for merger cost
    return (1e15, 15 * 1e14, 0);
  }

  function updateAndGetCost(
    uint256 _callerId,
    uint256 _recipientId,
    uint256 _actionCount
  )
    external
    override
    returns (
      uint256 _amountToRecipient,
      uint256 _amountToTreasury,
      uint256 _amountToBurn
    )
  {
    return (1e15, 15 * 1e14, 0);
  }
}
