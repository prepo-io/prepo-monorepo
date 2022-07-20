// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.7;

import "./interfaces/ITransferHook.sol";
import "prepo-shared-contracts/contracts/SafeOwnable.sol";
import "./interfaces/IAccountList.sol";

contract RestrictedTransferHook is ITransferHook, SafeOwnable {
  address private _token;
  IAccountList private _blocklist;
  IAccountList private _sourceAllowlist;
  IAccountList private _destinationAllowlist;

  modifier onlyToken() {
    _;
    require(msg.sender == _token, "msg.sender != token");
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

  function setBlockList(IAccountList _newBlockedAccounts) external onlyOwner {
    _blocklist = _newBlockedAccounts;
  }

  function setSourceAllowList(IAccountList _newAllowedSources) external onlyOwner {
    _sourceAllowlist = _newAllowedSources;
  }

  function setDestinationAllowList(IAccountList _newAllowedDestinations) external onlyOwner {
    _destinationAllowlist = _newAllowedDestinations;
  }

  function getToken() external view returns (address) {
    return _token;
  }

  function getBlockList() external view returns (IAccountList) {
    return _blocklist;
  }

  function getSourceAllowList() external view returns (IAccountList) {
    return _sourceAllowlist;
  }

  function getDestinationAllowList() external view returns (IAccountList) {
    return _destinationAllowlist;
  }
}
