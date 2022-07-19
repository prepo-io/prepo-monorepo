// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.7;

import "./interfaces/ITransferHook.sol";
import "prepo-shared-contracts/contracts/SafeOwnable.sol";
import "./interfaces/IAccountList.sol";

contract RestrictedTransferHook is ITransferHook, SafeOwnable {
  address private _ppo;
  IAccountList private _allowedSources;
  IAccountList private _allowedDestinations;
  IAccountList private _blockedAccounts;

  modifier onlyPPO() {
    require(msg.sender == _ppo, "Only PPO can call hook");
    _;
  }

  constructor(address _nominatedOwner) {
    transferOwnership(_nominatedOwner);
  }

  function setPPO(address _newPPO) external onlyOwner {
    _ppo = _newPPO;
  }

  function setAllowedSources(IAccountList _newAllowedSources) external onlyOwner {
    _allowedSources = _newAllowedSources;
  }

  function setAllowedDestinations(IAccountList _newAllowedDestinations) external onlyOwner {
    _allowedDestinations = _newAllowedDestinations;
  }

  function setBlockedAccounts(IAccountList _newBlockedAccounts) external onlyOwner {
    _blockedAccounts = _newBlockedAccounts;
  }

  function hook(
    address _from,
    address _to,
    uint256 _amount
  ) external override onlyPPO {
    require(
      !_blockedAccounts.isIncluded(_from) &&
        !_blockedAccounts.isIncluded(_to) &&
        (_allowedDestinations.isIncluded(_to) || _allowedSources.isIncluded(_from)),
      "Account blocked"
    );
  }

  function getPPO() external view returns (address) {
    return _ppo;
  }

  function getAllowedSources() external view returns (IAccountList) {
    return _allowedSources;
  }

  function getAllowedDestinations() external view returns (IAccountList) {
    return _allowedDestinations;
  }

  function getBlockedAccounts() external view returns (IAccountList) {
    return _blockedAccounts;
  }
}
