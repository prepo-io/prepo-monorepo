// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

import "./interfaces/IBlocklist.sol";
import "prepo-shared-contracts/contracts/SafeOwnable.sol";

contract Blocklist is IBlocklist, SafeOwnable {
  constructor(address _nominatedOwner) {}

  function set(address[] calldata _accounts, bool[] calldata _blocked)
    external
    override
    onlyOwner
  {}

  function reset(address[] calldata _blockedAccounts) external override onlyOwner {}
}
