// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.7;

import "./interfaces/IBlocklistTransferHook.sol";
import "./interfaces/IAccountList.sol";
import "prepo-shared-contracts/contracts/SafeOwnable.sol";

contract BlocklistTransferHook is IBlocklistTransferHook, SafeOwnable {
  //TODO: Extract this to a shared contract to reduce duplication.
  address private _token;
  IAccountList private _blockedAccounts;

  modifier onlyToken() {
    require(msg.sender == _token, "msg.sender != token");
    _;
  }

  constructor(address _nominatedOwner) {
    transferOwnership(_nominatedOwner);
  }

  function hook(
    address _from,
    address _to,
    uint256 _amount
  ) external override onlyToken {}

  function setToken(address _newToken) external onlyOwner {
    _token = _newToken;
  }

  function setBlocklist(IAccountList _newBlockedAccounts) external override onlyOwner {
    _blockedAccounts = _newBlockedAccounts;
  }

  function getToken() external view returns (address) {
    return _token;
  }

  function getBlocklist() external view override returns (IAccountList) {
    return _blockedAccounts;
  }
}
