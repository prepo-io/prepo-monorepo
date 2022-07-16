// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

//TODO: add all natspecs at the end
interface IBlockList {
  function set(address[] calldata accounts, bool[] calldata blocked) external;

  function reset(address[] calldata blockedAccounts) external;
}
