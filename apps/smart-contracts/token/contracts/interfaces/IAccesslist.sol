// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

//TODO: add all natspecs at the end
interface IAccesslist {
  function set(address[] calldata accounts, bool[] calldata include) external;

  function reset(address[] calldata accounts) external;

  function isOnList(address account) external view returns (bool);
}
