// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

import "./interfaces/IPPO.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "prepo-shared-contracts/contracts/SafeOwnableUpgradeable.sol";

contract PPO is IPPO, ReentrancyGuardUpgradeable, SafeOwnableUpgradeable {
  function initialize(address _nominatedOwner) public initializer {}

  function setTransferHook(ITransferHook newTransferHook) external override onlyOwner {}

  function mint(uint256 amount) external override onlyOwner {}

  function burn(uint256 amount) external override onlyOwner {}

  function burnFrom(address account, uint256 amount) external override onlyOwner {}
}
