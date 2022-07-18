// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

import "./interfaces/IAllowlist.sol";
import "prepo-shared-contracts/contracts/SafeOwnable.sol";

contract Allowlist is IAllowlist, SafeOwnable {
  uint256 private _sourceAccountsIndex;
  uint256 private _destinationAccountsIndex;
  mapping(uint256 => mapping(address => bool)) private _allowedSourceAccounts;
  mapping(uint256 => mapping(address => bool)) private _allowedDestinationAccounts;

  constructor(address _nominatedOwner) {
    transferOwnership(_nominatedOwner);
  }

  function setDestinations(address[] calldata _destinations, bool[] calldata _allowed)
    external
    override
    onlyOwner
  {}

  function resetDestinations(address[] calldata _destinationsToAllow) external override onlyOwner {}

  function setSources(address[] calldata _sources, bool[] calldata _allowed)
    external
    override
    onlyOwner
  {}

  function resetSources(address[] calldata _sourcesToAllow) external override onlyOwner {}

    function isAccountSourceAllowed(address _account) external view override returns (bool) {
        return _allowedSourceAccounts[_sourceAccountsIndex][_account];
    }

    function isAccountDestinationAllowed(address _account) external view override returns (bool) {
        return _allowedDestinationAccounts[_destinationAccountsIndex][_account];
    }
}
