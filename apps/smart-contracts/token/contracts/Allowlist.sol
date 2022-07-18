// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

import "./interfaces/IAllowlist.sol";
import "prepo-shared-contracts/contracts/SafeOwnable.sol";

contract Allowlist is IAllowlist, SafeOwnable {
  uint256 private _sourceIndex;
  uint256 private _destinationIndex;
  mapping(uint256 => mapping(address => bool)) private _sourceIndexToAccountToAllowed;
  mapping(uint256 => mapping(address => bool)) private _destinationIndexToAccountToAllowed;

  constructor(address _nominatedOwner) {
    transferOwnership(_nominatedOwner);
  }

  function setDestinations(address[] calldata _destinations, bool[] calldata _allowed)
    external
    override
    onlyOwner
  {
    require(_destinations.length == _allowed.length, "Array length mismatch");
    for (uint256 i; i < _destinations.length; ++i) {
      _destinationIndexToAccountToAllowed[_destinationIndex][_destinations[i]] = _allowed[i];
    }
  }

  function resetDestinations(address[] calldata _destinationsToAllow) external override onlyOwner {
    _destinationIndex++;
    for (uint256 i; i < _destinationsToAllow.length; ++i) {
      _destinationIndexToAccountToAllowed[_destinationIndex][_destinationsToAllow[i]] = true;
    }
  }

  function setSources(address[] calldata _sources, bool[] calldata _allowed)
    external
    override
    onlyOwner
  {}

  function resetSources(address[] calldata _sourcesToAllow) external override onlyOwner {}

  function isSourceAllowed(address _account) external view override returns (bool) {
    return _sourceIndexToAccountToAllowed[_sourceIndex][_account];
  }

  function isDestinationAllowed(address _account) external view override returns (bool) {
    return _destinationIndexToAccountToAllowed[_destinationIndex][_account];
  }
}
