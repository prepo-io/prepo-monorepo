// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

import "./interfaces/IBlocklist.sol";
import "prepo-shared-contracts/contracts/SafeOwnable.sol";

contract Blocklist is IBlocklist, SafeOwnable {
  uint256 private _blockedAccountsIndex;
  mapping(uint256 => mapping(address => bool)) private _blockedAccounts;

  constructor(address _nominatedOwner) {
    transferOwnership(_nominatedOwner);
  }

  function set(address[] calldata _accounts, bool[] calldata _blocked)
    external
    override
    onlyOwner
  {}

  function reset(address[] calldata _newBlockedAccounts) external override onlyOwner {}

  function isAccountBlocked(address _account) external view override returns (bool) {
    return _blockedAccounts[_blockedAccountsIndex][_account];
  }

  function getBlockedAllountsIndex() external view override returns (uint256) {
    return _blockedAccountsIndex;
  }
}
