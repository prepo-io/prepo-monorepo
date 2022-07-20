// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.7;

import "./interfaces/IRestrictedTransferHook.sol";
import "./interfaces/IAccountList.sol";
import "prepo-shared-contracts/contracts/SafeOwnable.sol";

/**
  TODO: Import BlocklistTransferHook.sol and remove duplicate implementation
  and tests for setting blocklist. 
  TODO: Call super.hook(...) to check for blocklist in `hook()`.
*/

contract RestrictedTransferHook is IRestrictedTransferHook, SafeOwnable {
  //TODO: Extract this to a shared contract to reduce duplication.
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

  function setBlocklist(IAccountList _newBlockedAccounts) external override onlyOwner {
    _blocklist = _newBlockedAccounts;
  }

  function setSourceAllowlist(IAccountList _newAllowedSources) external override onlyOwner {
    _sourceAllowlist = _newAllowedSources;
  }

  function setDestinationAllowlist(IAccountList _newAllowedDestinations)
    external
    override
    onlyOwner
  {
    _destinationAllowlist = _newAllowedDestinations;
  }

  function getToken() external view returns (address) {
    return _token;
  }

  function getBlocklist() external view override returns (IAccountList) {
    return _blocklist;
  }

  function getSourceAllowlist() external view override returns (IAccountList) {
    return _sourceAllowlist;
  }

  function getDestinationAllowlist() external view override returns (IAccountList) {
    return _destinationAllowlist;
  }
}
