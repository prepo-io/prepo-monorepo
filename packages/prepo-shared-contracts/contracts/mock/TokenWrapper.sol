// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity =0.8.7;

import "../Token.sol";

contract TokenWrapper is Token {
  function testTokenModifier() external onlyToken {}
}
