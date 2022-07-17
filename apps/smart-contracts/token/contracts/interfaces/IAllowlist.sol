// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

//TODO: add all natspecs at the end
interface IAllowlist {
  function setDestinations(address[] calldata destinations, bool[] calldata allowed) external;

  function resetDestinations(address[] calldata allowedDestinations) external;

  function setSources(address[] calldata sources, bool[] calldata allowed) external;

  function resetSources(address[] calldata allowedSources) external;

  function getSourceAccountsIndex() external view returns (uint256);

  function getDestinationAccountsIndex() external view returns (uint256);

  function isAccountSourceAllowed(address account) external view returns (bool);

  function isAccountDestinationAllowed(address account) external view returns (bool);
}
