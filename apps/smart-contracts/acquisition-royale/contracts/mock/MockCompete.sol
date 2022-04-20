// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.6;

import '../interfaces/ICompete.sol';

contract MockCompete is ICompete {
  uint256 private _difficulty;
  uint256 private constant PERCENT_DENOMINATOR = 10000000000;

  constructor() {
    // mock difficulty is 1.5x for simplicity.
    _difficulty = 15000000000;
  }

  function getRpRequiredForDamage(
    uint256 _callerId,
    uint256 _recipientId,
    uint256 _damage
  ) external view override returns (uint256) {
    return (_damage * _difficulty) / PERCENT_DENOMINATOR;
  }

  function getDamage(
    uint256 _callerId,
    uint256 _recipientId,
    uint256 _rpToSpend
  ) external view override returns (uint256) {
    return (_rpToSpend * PERCENT_DENOMINATOR) / _difficulty;
  }

  function getDifficulty() external view returns (uint256) {
    return _difficulty;
  }
}
