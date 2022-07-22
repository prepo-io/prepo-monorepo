// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

// TODO: add natspec comments
interface IPausable {
  event PausedChange(bool newPaused);

  function setPaused(bool newPaused) external;

  function isPaused() external view returns (bool);
}
