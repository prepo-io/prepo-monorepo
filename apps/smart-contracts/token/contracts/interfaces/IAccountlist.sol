// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

//TODO: add all natspecs at the end
interface IAccountList {
  function set(address[] calldata accounts, bool[] calldata included) external;

  function reset(address[] calldata newIncludedAccounts) external;

  function isAccountIncluded(address account) external view returns (bool);
}
