// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

import "./interfaces/IAllowlist.sol";
import "prepo-shared-contracts/contracts/SafeOwnable.sol";

contract Allowlist is IAllowlist, SafeOwnable {
  constructor(address _nominatedOwner) {}

  function setDestinations(address[] calldata _destinations, bool[] calldata _allowed)
    external
    override
    onlyOwner
  {}

  function resetDestinations(address[] calldata _allowedDestinations) external override onlyOwner {}

  function setSources(address[] calldata _sources, bool[] calldata _allowed)
    external
    override
    onlyOwner
  {}

  function resetSources(address[] calldata _allowedSources) external override onlyOwner {}
}
