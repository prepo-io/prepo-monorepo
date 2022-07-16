// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

import "./interfaces/IPPO.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "prepo-shared-contracts/contracts/SafeOwnableUpgradeable.sol";

contract PPO is IPPO, ReentrancyGuardUpgradeable, SafeOwnableUpgradeable {
  ITransferHook private _transferHook;

  function initialize(address _nominatedOwner) public initializer {
    __Ownable_init_unchained();
    __ReentrancyGuard_init_unchained();
    transferOwnership(_nominatedOwner);
  }

  function setTransferHook(ITransferHook _newTransferHook) external override onlyOwner {}

  function mint(uint256 _amount) external override onlyOwner {}

  function burn(uint256 _amount) external override onlyOwner {}

  function burnFrom(address _account, uint256 _amount) external override onlyOwner {}

  function getTransferHook() external view override returns (ITransferHook) {
    return _transferHook;
  }
}
