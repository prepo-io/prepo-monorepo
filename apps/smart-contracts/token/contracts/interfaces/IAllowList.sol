// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

//TODO: add all natspecs at the end
interface IAllowlist {
  function allowDestinations(address[] memory accounts) external;

  function removeDestinations(address[] memory accounts) external;

  function resetDestinations() external;

  function allowSources(address[] memory accounts) external;

  function removeSources(address[] memory accounts) external;

  function resetSources() external;
}
