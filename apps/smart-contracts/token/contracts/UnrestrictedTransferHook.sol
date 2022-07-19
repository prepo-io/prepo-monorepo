// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.7;

import "./interfaces/ITransferHook.sol";
import "./interfaces/IAccountList.sol";
import "prepo-shared-contracts/contracts/SafeOwnable.sol";

contract UnrestrictedTransferHook is ITransferHook, SafeOwnable {
  address private _ppo;
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

  function setBlockedAccounts(IAccountList _newBlockedAccounts) external onlyOwner {
    _blockedAccounts = _newBlockedAccounts;
  }

  function hook(
    address _from,
    address _to,
    uint256 _amount
  ) external override onlyPPO {}

  function getPPO() external view returns (address) {
    return _ppo;
  }

  function getBlockedAccounts() external view returns (IAccountList) {
    return _blockedAccounts;
  }
}
