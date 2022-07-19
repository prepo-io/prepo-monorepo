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

  function set(address[] calldata _accounts, bool[] calldata _included)
    external
    override
    onlyOwner
  {
    require(_accounts.length == _included.length, "Array length mismatch");
    for (uint256 i; i < _accounts.length; ++i) {
      _resetIndexToAccountToIncluded[_resetIndex][_accounts[i]] = _included[i];
    }
  }

  function reset(address[] calldata _newIncludedAccounts) external override onlyOwner {
    _resetIndex++;
    for (uint256 i; i < _newIncludedAccounts.length; ++i) {
      _resetIndexToAccountToIncluded[_resetIndex][_newIncludedAccounts[i]] = true;
    }
  }

  function getResetIndex() external view override returns (uint256) {
    return _resetIndex;
  }

  function isIncluded(address _account) external view override returns (bool) {
    return _resetIndexToAccountToIncluded[_resetIndex][_account];
  }
}
