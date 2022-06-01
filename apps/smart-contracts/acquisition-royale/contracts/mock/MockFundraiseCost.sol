// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

import "../interfaces/ICost.sol";

contract MockFundraiseCost is ICost {
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
    // 0.001 WETH for RP to the treasury
    return (0, 1e15, 0);
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
    return (0, 1e15, 0);
  }
}
