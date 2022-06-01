// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

import "./interfaces/ICost.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FixedCost is ICost, Ownable {
  uint256 private _fixedAmountToRecipient;
  uint256 private _fixedAmountToTreasury;
  uint256 private _fixedAmountToBurn;

  constructor(
    uint256 _newAmountToRecipient,
    uint256 _newAmountToTreasury,
    uint256 _newAmountToBurn
  ) {
    _fixedAmountToRecipient = _newAmountToRecipient;
    _fixedAmountToTreasury = _newAmountToTreasury;
    _fixedAmountToBurn = _newAmountToBurn;
  }

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
    return (_fixedAmountToRecipient, _fixedAmountToTreasury, _fixedAmountToBurn);
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
    return (_fixedAmountToRecipient, _fixedAmountToTreasury, _fixedAmountToBurn);
  }

  function setFixedAmountToRecipient(uint256 _amount) external onlyOwner {
    _fixedAmountToRecipient = _amount;
  }

  function setFixedAmountToTreasury(uint256 _amount) external onlyOwner {
    _fixedAmountToTreasury = _amount;
  }

  function setFixedAmountToBurn(uint256 _amount) external onlyOwner {
    _fixedAmountToBurn = _amount;
  }
}
