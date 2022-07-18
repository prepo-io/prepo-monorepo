// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

import "./interfaces/IAccountList.sol";
import "prepo-shared-contracts/contracts/SafeOwnable.sol";

contract AccountList is IAccountList, SafeOwnable {
  uint256 private _resetIndex;
  mapping(uint256 => mapping(address => bool)) private _resetIndexToAccountToIncluded;

  constructor(address _nominatedOwner) {
    transferOwnership(_nominatedOwner);
  }

  function set(address[] calldata accounts, bool[] calldata included) external override onlyOwner {}

  function reset(address[] calldata _newIncludedAccounts) external override onlyOwner {}

  function getResetIndex() external view override returns (uint256) {
    return _resetIndex;
  }

  function isIncluded(address _account) external view override returns (bool) {
    return _resetIndexToAccountToIncluded[_resetIndex][_account];
  }
}
