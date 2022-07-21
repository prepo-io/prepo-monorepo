// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

// TODO: add natspec comments
interface IToken {
  function setToken(address token) external;

  function getToken() external view returns (address);
}
