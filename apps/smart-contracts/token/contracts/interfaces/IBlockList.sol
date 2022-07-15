// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

//TODO: add all natspecs at the end
interface IBlocklist {
  function blockAccounts(address[] memory accounts) external;

  function removeAccounts(address[] memory accounts) external;

  function reset() external;
}
