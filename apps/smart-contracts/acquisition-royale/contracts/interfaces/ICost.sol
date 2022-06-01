// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

interface ICost {
  function getCost(uint256 callerId, uint256 recipientId)
    external
    view
    returns (
      uint256 amountToRecipient,
      uint256 amountToTreasury,
      uint256 amountToBurn
    );

  function updateAndGetCost(
    uint256 callerId,
    uint256 recipientId,
    uint256 actionCount
  )
    external
    returns (
      uint256 amountToRecipient,
      uint256 amountToTreasury,
      uint256 amountToBurn
    );
}
