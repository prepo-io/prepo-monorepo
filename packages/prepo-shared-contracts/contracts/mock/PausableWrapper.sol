// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

import "../Pausable.sol";

contract PausableWrapper is Pausable {
  function testWhenNotPaused() external whenNotPaused {}
}
