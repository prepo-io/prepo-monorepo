// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

import "../SafeOwnableUpgradeable.sol";

contract DeployableSafeOwnableUpgradeable is SafeOwnableUpgradeable {
  function initialize() public initializer {
    __Ownable_init();
  }
}
