// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

import "./interfaces/IBlockList.sol";
import "prepo-shared-contracts/contracts/SafeOwnable.sol";

contract BlockList is IBlockList, SafeOwnable {
  constructor(address _nominatedOwner) {}

  function set(address[] calldata accounts, bool[] calldata blocked) external override onlyOwner {}

  function reset(address[] calldata blockedAccounts) external override onlyOwner {}
}
